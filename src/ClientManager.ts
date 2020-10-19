namespace net.user1.orbiter
{
	import LRUCache = net.user1.utils.LRUCache;
	import Logger = net.user1.logger.Logger;
	import Filter = net.user1.orbiter.filters.Filter;

	/**
	 * The ClientManager class provides centralized access to Client instances, which represent
	 * clients connected to Union Server. Any client that is known to the current client (for
	 * example, a client in the same room as the current client) can be accessed via
	 * [[ClientManager.getClient]] method.
	 */
	export class ClientManager extends net.user1.events.EventDispatcher
	{
		private _isWatchingForBannedAddresses:boolean = false;
		private _isWatchingForClients:boolean = false;
		private _isWatchingForUsers:boolean = false;
		private bannedAddresses:string[] = [];
		private clientCache:LRUCache<Client> = new LRUCache(5000);
		private defaultClientClass:any = null;
		private lifetimeClientsRequested:number = 0;
		private observedClients:ClientSet = new ClientSet();
		private selfReference:Client|null = null;
		private watchedClients:ClientSet  = new ClientSet();

		constructor(private readonly roomManager:RoomManager,
		            private readonly accountManager:AccountManager,
		            private readonly connectionManager:ConnectionManager,
		            private readonly messageManager:MessageManager,
		            private readonly server:Server,
		            private readonly log:Logger)
		{
			super();
		}

		/**
		 * @internal
		 */
		addObservedClient(client:Client):void
		{
			const customClient = client.getCustomClient() as unknown as Client;
			this.observedClients.add(client);
			this.fireObserveClient(customClient ?? client);
		}

		/**
		 * @internal
		 */
		addWatchedBannedAddress(address:string):void
		{
			this.bannedAddresses.push(address);
			this.fireAddressBanned(address);
		}

		/**
		 * @internal
		 */
		addWatchedClient(client:Client):void
		{
			const customClient = client.getCustomClient() as unknown as Client;
			this.watchedClients.add(client);
			this.fireClientConnected(customClient ?? client);
		}

		/**
		 * Disconnects any clients with the specified address (typically an IP address) and prevents
		 * any future client connections from that address. By default, ban() requires administrator
		 * privileges. To allow other types of clients (such as moderators) to ban addresses, define
		 * a remote-client security rule.
		 *
		 * The result of the ban attempt is returned via a [[ClientManagerEvent.BAN_RESULT]] event.
		 *
		 * @param address  The address to ban (typically an IP address).
		 * @param duration The duration of the ban, in seconds.
		 * @param reason   An arbitrary, optional string indicating the reason for the ban. The
		 *                 reason string is saved in the server-side ban list.
		 */
		ban(address:string, duration:number, reason:string):void
		{
			this.messageManager.sendUPC(net.user1.orbiter.UPC.BAN, address, undefined, duration.toString(), reason);
		}

		/**
		 * @internal
		 */
		cleanup():void
		{
			this.log.info('[CLIENT_MANAGER] Cleaning resources.');
			this.selfReference = null;
			this.removeAllObservedClients();
			this.removeAllWatchedClients();
			this.setIsWatchingForClients(false);
		}

		/**
		 * Returns a Boolean indicating whether the client with the specified clientID is known to
		 * the current client. The client is "known" in the following situations:
		 * - The ClientManager is watching for clients, and a client with the specified id is
		 *   connected to Union Server. See the [[ClientManager.watchForClients]] method.
		 * - The client with the specified clientID is in a room that the current client is either
		 *   in or observing, and the current client's update levels for the room include
		 *   occupant-list updates (see the [[UpdateLevels]] class).
		 * - The client with the specified clientID is observing a room that the current client
		 *   is either in or observing, and the current client's update levels for the
		 *   room include observer-list updates (see the UpdateLevels class).
		 * - The current client is observing the client with the specified clientID.
		 *   See [[ClientManager.observeClient]] method.
		 * - The client with the specified clientID is logged in, and the current client is watching
		 *   for user accounts. See [[AccountManager.watchForAccounts]] method.
		 * - The client with the specified clientID is logged into an account being observed by the
		 *   current client. See [[AccountManager.observeAccount]] method.
		 * - The client with the specified clientID is the current client.
		 */
		clientIsKnown(clientID:string):boolean
		{
			return !!this.getInternalClients()[clientID];
		}

		/**
		 * @internal
		 */
		deserializeWatchedClients(ids:string):void
		{
			const idList = ids.split(net.user1.orbiter.Tokens.RS),
			      idHash:{[id:string]:any} = {},
			      localClients = this.watchedClients.getAll(),
			      len = idList.length;

			// Client list received, so set isWatchingForClients now, otherwise, code
			// with side-effects may take action against the clients being added
			this.setIsWatchingForClients(true);

			// Generate a hash of clientID keys to accountID values
			for (let i = len - 2; i >= 0; i -= 2)
			{
				idHash[idList[i]] = idList[i + 1];
			}

			// Remove all local clients that are not in the new list from the server
			for (let clientID in localClients)
			{
				if (!idHash.hasOwnProperty(clientID))
				{
					// For best performance, use direct access rather than removeByClientID()
					delete localClients[clientID];
				}
			}

			// Add all new clients that are not in the local set
			for (let clientID in idHash)
			{
				if (clientID != '')
				{
					if (!this.watchedClients.containsClientID(clientID))
					{
						const theClient = this.requestClient(clientID),
						      accountID = idHash[clientID];
						if (accountID != '')
						{
							theClient.setAccount(this.accountManager.requestAccount(accountID) ?? undefined);
						}
						this.addWatchedClient(theClient);
					}
				}
				else
				{
					throw new Error('[CLIENT_MANAGER] Received empty client id in client list (u101).');
				}
			}

			this.fireSynchronize();
		}

		/**
		 * Permanently disables this object. The object cannot be reused. The dispose() method's
		 * purpose is to put this object into a state in which it can be garbage collected.
		 */
		dispose():void
		{
			this.log.info('[CLIENT_MANAGER] Disposing resources.');

			// @ts-ignore
			this.watchedClients = undefined;
			// @ts-ignore
			this.observedClients = undefined;
			this.defaultClientClass = null;
		}

		/**
		 * @internal
		 */
		fireAddressBanned(address:string):void
		{
			this.dispatchEvent(new ClientManagerEvent(ClientManagerEvent.ADDRESS_BANNED, undefined, undefined, address));
		}

		/**
		 * @internal
		 */
		fireAddressUnbanned(address:string):void
		{
			this.dispatchEvent(new ClientManagerEvent(ClientManagerEvent.ADDRESS_UNBANNED, undefined, undefined, address));
		}

		fireBanClientResult(address:string, clientID:string, status:Status):void
		{
			this.dispatchEvent(new ClientManagerEvent(ClientManagerEvent.BAN_RESULT, clientID, undefined, address, status));
		}

		/**
		 * @internal
		 */
		fireClientConnected(client:Client):void
		{
			this.dispatchEvent(new ClientManagerEvent(ClientManagerEvent.CLIENT_CONNECTED, client.getClientID(), client));
		}

		/**
		 * @internal
		 */
		fireClientDisconnected(client?:Client):void
		{
			this.dispatchEvent(new ClientManagerEvent(ClientManagerEvent.CLIENT_DISCONNECTED, client?.getClientID(), client));
		}

		/**
		 * @internal
		 */
		fireKickClientResult(clientID:string, status:Status):void
		{
			this.dispatchEvent(new ClientManagerEvent(ClientManagerEvent.KICK_RESULT, clientID, undefined, undefined, status));
		}

		/**
		 * @internal
		 */
		fireObserveClient(client:Client):void
		{
			const e = new net.user1.orbiter.ClientEvent(net.user1.orbiter.ClientEvent.OBSERVE, undefined, undefined, undefined, client);
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 */
		fireObserveClientResult(clientID:string, status:Status):void
		{
			this.dispatchEvent(new ClientEvent(ClientEvent.OBSERVE_RESULT, undefined, undefined, undefined, this.getClient(clientID)??undefined, status, clientID));
		}

		/**
		 * @internal
		 */
		private fireStopObservingClient(client:Client):void
		{
			const e = new ClientEvent(ClientEvent.STOP_OBSERVING, undefined, undefined, undefined, client);
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 */
		fireStopObservingClientResult(clientID:string, status:Status):void
		{
			this.dispatchEvent(new ClientEvent(ClientEvent.STOP_OBSERVING_RESULT, undefined, undefined, undefined, this.getClient(clientID)??undefined, status, clientID));
		}

		/**
		 * @internal
		 */
		fireStopWatchingForBannedAddressesResult(status:Status):void
		{
			this.dispatchEvent(new ClientManagerEvent(ClientManagerEvent.STOP_WATCHING_FOR_BANNED_ADDRESSES_RESULT, undefined, undefined, undefined, status));
		}

		/**
		 * @internal
		 */
		fireStopWatchingForClientsResult(status:Status):void
		{
			this.dispatchEvent(new ClientManagerEvent(ClientManagerEvent.STOP_WATCHING_FOR_CLIENTS_RESULT, undefined, undefined, undefined, status));
		}

		/**
		 * @internal
		 */
		fireSynchronize():void
		{
			this.dispatchEvent(new ClientManagerEvent(ClientManagerEvent.SYNCHRONIZE));
		}

		/**
		 * @internal
		 */
		fireSynchronizeBanlist():void
		{
			this.dispatchEvent(new ClientManagerEvent(ClientManagerEvent.SYNCHRONIZE_BANLIST));
		}

		/**
		 * @internal
		 */
		fireUnbanClientResult(address:string, status:Status):void
		{
			this.dispatchEvent(new ClientManagerEvent(ClientManagerEvent.UNBAN_RESULT, undefined, undefined, address, status));
		}

		/**
		 * @internal
		 */
		fireWatchForBannedAddressesResult(status:Status):void
		{
			this.dispatchEvent(new ClientManagerEvent(ClientManagerEvent.WATCH_FOR_BANNED_ADDRESSES_RESULT, undefined, undefined, undefined, status));
		}

		/**
		 * @internal
		 */
		fireWatchForClientsResult(status:Status):void
		{
			this.dispatchEvent(new ClientManagerEvent(ClientManagerEvent.WATCH_FOR_CLIENTS_RESULT, undefined, undefined, undefined, status));
		}

		/**
		 * Returns an array of objects containing values for the specified attribute for all clients
		 * in supplied clientIDs. Each object in the returned array has a `clientID` property
		 * (giving the client id), and a `value` property (giving the attribute value).
		 * The value property will be `null` for clients in clientIDs that either do not exist or do
		 * not have a value set for the specified attribute.
		 *
		 * For information on client attributes see the [[Client.setAttribute]] method.
		 *
		 * @param clientIDs  An array of client ids indicating the clients for which to retrieve the
		 *                   specified attribute.
		 * @param attrName   The name of the attribute to retrieve.
		 * @param attrScope  The scope of the attribute to retrieve. Omit for global attributes.
		 */
		getAttributeForClients(clientIDs:string[], attrName:string, attrScope?:string):{clientID:string, value:string|null}[]
		{
			const clientAttributes = [];

			for (let i = 0; i < clientIDs.length; i++)
			{
				const thisClient = this.getInternalClient(clientIDs[i]);
				if (thisClient)
				{
					clientAttributes.push({
						                      clientID:clientIDs[i],
						                      value   :thisClient.getAttribute(attrName, attrScope)
					                      });
				}
				else
				{
					this.log.debug(`[CLIENT_MANAGER] Attribute retrieval failed during  getAttributeForClients(). Unknown client ID [${clientIDs[i]}]`);
				}
			}
			return clientAttributes;
		}

		getBannedAddresses():string[]
		{
			return this.bannedAddresses.slice(0);
		}

		/**
		 * Returns an object representing the specified client; by default, the object is an
		 * instance of the Client class. However, if a custom class has been specified for the
		 * client in the specified scope, the object will be an instance of that custom class.
		 *
		 * @param  clientID  The server-generated client ID for the client.
		 * @param  scope     An optional fully qualified room id (e.g., "examples.chatRoom").
		 */
		getClient(clientID:string, scope?:string):Client|null
		{
			if (!clientID)
			{
				throw new Error(`ClientManager.getClient() failed. Client ID must not be null or the empty string.`);
			}

			const theClient = this.getInternalClient(clientID);
			if (!theClient)
			{
				this.log.debug(`[CLIENT_MANAGER] getClient() called for unknown client ID [${clientID}].`);
				return null;
			}
			else
			{
				const theCustomClient = theClient.getCustomClient(scope) as unknown as Client;
				return theCustomClient ?? theClient;
			}
		}

		/**
		 * Returns the first client known to the ClientManager that has an attribute name and value
		 * matching the specified attribute name and value. If no client has a matching attribute,
		 * returns null.
		 * @param attributeName   The name of the attribute to match.
		 * @param attributeValue  The value of the attribute to match.
		 * @param attributeScope  The scope of the attribute to match. Use undefined for global.
		 * @param  roomScope      A fully qualified room id (e.g., "examples.chatRoom").
		 *                        For details, see the "scope" parameter of the [[getClient]] method.
		 */
		getClientByAttribute(attributeName:string, attributeValue:string,
		                     attributeScope?:string, roomScope?:string):Client|null
		{
			// Validate
			if (attributeName == null || attributeName === '')
			{
				return null;
			}

			// Search for the client in all known clients
			const clients = this.getInternalClients();
			for (let clientID in clients)
			{
				const client = clients[clientID];
				if (client.getAttribute(attributeName, attributeScope) === attributeValue)
				{
					const theCustomClient = client.getCustomClient(roomScope) as unknown as Client;
					return theCustomClient ?? client;
				}
			}
			return null;
		}

		/**
		 * Returns the client that is logged into the account specified by userID. If no known
		 * client is logged in under the specified userID, returns null.
		 *
		 * @param  userID  A user account's userID.
		 * @param  scope   A fully qualified room id (e.g., "examples.chatRoom").
		 *                 For details, see the "scope" parameter of the
		 *                 [[ClientManager.getClient]] method.
		 */
		getClientByUserID(userID:string, scope?:string):Client|null
		{
			let theClient:Client|null = null;

			if (!userID)
			{
				throw new Error(`ClientManager.getClientByUserID() failed. User ID must not be null or the empty string.`);
			}

			// Search for the client in all known clients
			const clients = this.getInternalClients();
			for (let clientID in clients)
			{
				const client = clients[clientID],
				      account = client.getAccount();
				if (account != null && account.getUserID() === userID)
				{
					theClient = client;
					break;
				}
			}

			if (theClient === null)
			{
				this.log.debug(`[CLIENT_MANAGER] getClientByUserID() called for unknown user ID [${userID}].`);
				return null;
			}
			else
			{
				const theCustomClient = theClient?.getCustomClient(scope) as unknown as Client;
				return theCustomClient ?? theClient;
			}
		}

		/**
		 * Returns a list of all client objects known to the current client. Each client object in
		 * the list is an instance of either Client or a custom client class.
		 */
		getClients():Client[]
		{
			// Get all internal clients
			const clients = this.getInternalClients(),
			      clientsList:Client[] = [];

			// Replace internal clients with custom clients where available
			for (let clientID in clients)
			{
				const client = clients[clientID],
				      customClient = client.getCustomClient();
				if (customClient != null)
				{
					clientsList.push(customClient as unknown as Client);
				}
				else
				{
					clientsList.push(client);
				}
			}
			return clientsList;
		}

		/**
		 * Returns the class used as the global default class for clients in this application.
		 */
		getDefaultClientClass():any
		{
			return this.defaultClientClass;
		}

		/**
		 * Returns the internal Client object for the specified client id. This method is required
		 * in one situation only: when an application specifies a custom client class that does not
		 * extend CustomClient, it must implement IClient directly, and compose a Client instance.
		 * To obtain the composed instance, the custom class must use getInternalClient().
		 * Otherwise, client applications should retrieve Client objects via
		 * [[getClient]], not [[getInternalClient]].
		 *
		 * @param  clientID  The server-generated client ID.
		 */
		getInternalClient(clientID:string):Client|null
		{
			// Error checking
			if (!clientID)
			{
				throw new Error(`[CLIENT_MANAGER] this.getInternalClient() failed. Client ID must not be null or the empty string.`);
			}

			let theClient:Client|null = this.clientCache.get(clientID);

			if (!!theClient)
			{
				return theClient;
			}
			else
			{
				// Find the client...

				// Look in rooms
				let clients = this.roomManager.getAllClients();
				theClient = clients[clientID];
				if (theClient != null)
				{
					this.clientCache.put(clientID, theClient);
					return theClient;
				}

				// Look in observed accounts
				clients = this.accountManager.getClientsForObservedAccounts();
				theClient = clients[clientID];
				if (theClient != null)
				{
					this.clientCache.put(clientID, theClient);
					return theClient;
				}

				// Look in observed clients
				theClient = this.observedClients.getByClientID(clientID);
				if (theClient != null)
				{
					this.clientCache.put(clientID, theClient);
					return theClient;
				}

				// Look in watched clients
				theClient = this.watchedClients.getByClientID(clientID);
				if (theClient != null)
				{
					this.clientCache.put(clientID, theClient);
					return theClient;
				}
			}

			// Client not found
			return null;
		}

		/**
		 * Returns a hash of Client objects known to the current client, where the hash keys are
		 * client IDs, and the hash values are Client objects. Contrast with [[getClients]], whose
		 * client objects are instances custom client classes for any client that specifies a custom
		 * client class. Because getInternalClients() performs no custom-client-class lookup, is
		 * faster than getClients().
		 */
		getInternalClients():{[key:string]:Client}
		{
			const clients = {
				...this.roomManager.getAllClients(),
				...this.accountManager.getClientsForObservedAccounts(),
				...this.observedClients.getAll(),
				...this.watchedClients.getAll()
			};

			if (this.selfReference)
			{
				clients[this.selfReference.getClientID()] = this.selfReference;
			}
			return clients;
		}

		/**
		 * Returns the total number of clients that have ever been known to the current client,
		 * excluding itself.
		 */
		getLifetimeNumClientsKnown():number
		{
			// -1 for each "ready" state the connection has achieved because we don't
			// count the current client ("self")
			return this.lifetimeClientsRequested - this.connectionManager.getReadyCount();
		}

		/**
		 * Returns the number of clients known to Orbiter. When the ClientManager is watching for
		 * clients (see [[watchForClients]]), getNumClients() returns the actual number of clients
		 * currently connected to Union Server. When the ClientManager is __not__ watching for
		 * clients, getNumClients() returns only the number of clients about which the current
		 * client is aware. For example, if the current client is in a room with three other
		 * clients, and has no other awareness of clients on the server, then getNumClients() will
		 * return 4, even though more than 4 clients might be connected to the server.
		 */
		getNumClients():number
		{
			return net.user1.utils.ObjectUtil.len(this.getInternalClients());
		}

		/**
		 * If the ClientManager is watching for clients, getNumClientsOnServer() returns the number
		 * of clients on the server; otherwise, getNumClientsOnServer() returns 0. When the
		 * ClientManager is watching for clients, the getNumClientsOnServer() method provides a
		 * faster alternative to getNumClients().
		 */
		getNumClientsOnServer():number
		{
			return this.watchedClients.length();
		}

		/**
		 * Returns true if the client with the specified clientID is in the watched client list;
		 * false otherwise.
		 */
		hasWatchedClient(clientID:string):boolean
		{
			return this.watchedClients.containsClientID(clientID);
		}

		/**
		 * Returns true if the client with the specified clientID is currently being observed;
		 * false otherwise.
		 */
		isObservingClient(clientID:string):boolean
		{
			return this.observedClients.containsClientID(clientID);
		}

		isWatchingForBannedAddresses():boolean
		{
			return this._isWatchingForBannedAddresses;
		}

		/**
		 * Indicates whether the current client is currently watching for clients.
		 * @return {boolean}
		 */
		isWatchingForClients():boolean
		{
			return this._isWatchingForClients;
		}

		/**
		 * Disconnects the specified client from the server. By default, requires moderator
		 * privileges.
		 *
		 * The result of the kick attempt is returned via a
		 * [[ClientManagerEvent.KICK_RESULT]] event.
		 *
		 * @param clientID The clientID of the client to kick.
		 */
		kickClient(clientID:string):void
		{
			if (!clientID)
			{
				this.log.warn('[CLIENT_MANAGER] Kick attempt failed. No clientID supplied.');
			}
			this.messageManager.sendUPC(net.user1.orbiter.UPC.KICK_CLIENT, clientID);
		}

		/**
		 * Asks the server to register the current client as an observer of the client specified by
		 * clientID. The result of the request is returned via a [[ClientEvent.OBSERVE_RESULT]]
		 * event triggered by the ClientManager. If the request succeeds, Orbiter creates a Client
		 * object for the client (if one does not already exist), and a [[ClientEvent.OBSERVE]]
		 * event is triggered by the ClientManager. The Client object is then synchronized with the
		 * server-side state of the client. Subsequently if the specified client's state changes,
		 * the current client is notified in the following ways:
		 * - Observed client's attribute changes: the Client object triggers a
		 *   AttributeEvent.UPDATE event
		 * - Observed client's attribute is deleted: the Client object triggers a
		 *   AttributeEvent.DELETE event
		 * - Observed client joins a room: the Client object triggers a ClientEvent.JOIN_ROOM event
		 * - Observed client leaves a room: the Client object triggers a
		 *   ClientEvent.LEAVE_ROOM event
		 * - Observed client observes a room: the Client object triggers a ClientEvent.OBSERVE_ROOM
		 *   event
		 * - Observed client stops observing a room: the Client object triggers a
		 *   ClientEvent.STOP_OBSERVING_ROOM event
		 * - Observed client logs into a user account: current client's AccountManager triggers an
		 *   AccountEvent.LOGIN event
		 * - Observed client logs off of a user account: current client's AccountManager triggers an
		 *   AccountEvent.LOGOFF event
		 * - Observed client disconnects: current client's ClientManager triggers the
		 *   ClientManagerEvent.CLIENT_DISCONNECTED event
		 *
		 * To stop observing a client, use [[Client.stopObserving]] method.
		 *
		 * Client observation is used when a client wishes to stay informed of the state of an
		 * arbitrary list of clients, as is typical in applications with client match-making or
		 * administrative interfaces.
		 *
		 * @param clientID The clientID of the client to observe.
		 */
		observeClient(clientID:string):void
		{
			this.messageManager.sendUPC(net.user1.orbiter.UPC.OBSERVE_CLIENT, clientID);
		}

		/**
		 * @internal
		 */
		removeAllObservedClients():void
		{
			this.observedClients.removeAll();
		}

		/**
		 * @internal
		 */
		removeAllWatchedClients():void
		{
			this.watchedClients.removeAll();
		}

		/**
		 * @internal
		 */
		removeObservedClient(clientID:string):void
		{
			const client = this.observedClients.removeByClientID(clientID);
			if (client)
			{
				const customClient = client.getCustomClient() as unknown as Client;
				this.fireStopObservingClient(customClient ?? client);
			}
		}

		/**
		 * @internal
		 */
		removeWatchedBannedAddress(address:string):void
		{
			const idx = this.bannedAddresses.indexOf(address);
			if (idx == -1)
			{
				this.log.warn('[CLIENT_MANAGER] Request to remove watched banned address failed. Address not found.');
			}
			this.bannedAddresses.splice(idx, 1);
			this.fireAddressUnbanned(address);
		}

		/**
		 * @internal
		 */
		removeWatchedClient(clientID:string):void
		{
			this.watchedClients.removeByClientID(clientID);
		}

		/**
		 * @internal
		 */
		requestClient(clientID:string):Client
		{
			if (clientID == null || clientID === '')
			{
				throw new Error('[CLIENT_MANAGER] requestClient() called with empty clientID.');
			}

			let client = this.getInternalClient(clientID);

			// If the client isn't already known
			if (!client)
			{
				client = new net.user1.orbiter.Client(clientID, this, this.messageManager, this.roomManager, this.connectionManager, this.server, this.log);
				this.lifetimeClientsRequested++;
				this.clientCache.put(clientID, client);
			}

			return client;
		}

		/**
		 * @internal
		 */
		self():Client|null
		{
			return this.selfReference;
		}

		/**
		 * Sends a message to a set of specified `clientIDs`. To send a message to a single client
		 * only, use [[Client.sendMessage]] method. To receive the message, recipient clients must
		 * register a message listener via  [[MessageManager.addMessageListener]] method.
		 * @param messageName The name of the message to send.
		 * @param clientIDs   An array of the recipient client ID(s) for the message.
		 * @param filters     Specifies one or more filters for the message. A filter specifies a
		 *                    requirement that each client must meet in order to receive the
		 *                    message. For example, a filter might indicate that only those clients
		 *                    with the attribute "team" set to "red" should receive the message.
		 *                    If filters is null, all specified clients receive the message.
		 * @param rest        An optional comma-separated list of string arguments for the message.
		 *                    These will be passed to any listeners registered to receive the
		 *                    message. See [[MessageManager.addMessageListener]] method.
		 */
		sendMessage(messageName:string, clientIDs:string[], filters:Filter|null, ...rest:string[]):void
		{
			// Can't continue without a valid methodName.
			if (messageName == null || messageName == '')
			{
				this.log.warn('[CLIENT_MANAGER] sendMessage() failed. No messageName supplied.');
				return;
			}

			this.messageManager.sendUPC(UPC.SEND_MESSAGE_TO_CLIENTS,
			                            messageName,
			                            clientIDs.join(net.user1.orbiter.Tokens.RS),
			                            filters?.toXMLString() ?? '',
			                            ...rest);
		}

		/**
		 * Assigns a class to use as the default class for all clients in the application.
		 *
		 * By default, all clients are represented by instances of the Client class. An application
		 * can, however, choose to represent clients with a custom class. The custom client class
		 * can be specified on a per-client basis via the [[Client.setClientClass]] method. Or, the
		 * custom class can be specified on a per-room basis via the
		 * [[Room.setDefaultClientClass]] method. Or, the custom class can be specified globally via
		 * the ClientManager class's setDefaultClientClass() method. When a class has been specified
		 * globally via setDefaultClientClass(), it is used as the client class for any client
		 * retrieved via [[ClientManager.getClient]] method with an unspecified scope.
		 *
		 * Any custom class specified via Room's setDefaultClientClass() method overrides the global
		 * default client class. Similarly, any custom class specified via Client's setClientClass()
		 * method overrides the room and global default client class.
		 *
		 * @param defaultClass The global default client class. The class is normally a descendant
		 *                     of CustomClient.
		 */
		setDefaultClientClass<T>(defaultClass:new ()=>T):void
		{
			this.defaultClientClass = defaultClass;
		}

		/**
		 * @internal
		 */
		setIsWatchingForBannedAddresses(value:boolean):void
		{
			this._isWatchingForBannedAddresses = value;
		}

		/**
		 * @internal
		 */
		setIsWatchingForClients(value:boolean):void
		{
			this._isWatchingForClients = value;
		}

		/**
		 * @internal
		 */
		setSelf(client:Client)
		{
			this.selfReference = client;
			client.setIsSelf();
		}

		/**
		 * @internal
		 */
		setWatchedBannedAddresses(bannedList:string[]):void
		{
			this.bannedAddresses = bannedList;
			this.fireSynchronizeBanlist();
		}

		/**
		 * Asks the server to stop watching for banned addresses. In response, the server no longer
		 * sends notifications when an addresses is banned or unbanned.
		 *
		 * The result of a stopWatchingForBannedAddresses() request is returned via
		 * a [[ClientManagerEvent.STOP_WATCHING_FOR_BANNED_ADDRESSES_RESULT]] event.
		 */
		stopWatchingForBannedAddresses():void
		{
			this.messageManager.sendUPC(net.user1.orbiter.UPC.STOP_WATCHING_FOR_BANNED_ADDRESSES);
		}

		/**
		 * Asks the server to stop watching for clients. In response, the server no longer sends
		 * notifications when a client connects or disconnects. The result of a
		 * stopWatchingForClients() request is returned via
		 * ClientManagerEvent.STOP_WATCHING_FOR_CLIENTS_RESULT.
		 */
		stopWatchingForClients():void
		{
			this.messageManager.sendUPC(net.user1.orbiter.UPC.STOP_WATCHING_FOR_CLIENTS);
		}

		/**
		 * Removes any ban currently in effect for the specified address (typically an IP address).
		 * By default, unban() requires administrator privileges. To allow other types of clients
		 * (such as moderators) to unban addresses, define a remote-client security rule.
		 * @param address The address to unban (typically an IP address).
		 */
		unban(address:string):void
		{
			this.messageManager.sendUPC(net.user1.orbiter.UPC.UNBAN, address);
		}

		/**
		 * Asks the server to send its list of banned client addresses, and then send notification
		 * any time an address is banned or unbanned. When the banned list is ready, ClientManager
		 * dispatches a [[ClientManagerEvent.SYNCHRONIZE_BANLIST]] event. Subsequently, when a
		 * client address is banned, ClientManager dispatches a
		 * [[ClientManagerEvent.ADDRESS_BANNED]] event  and when a client address is unbanned,
		 * ClientManager dispatches a [[ClientManagerEvent.ADDRESS_UNBANNED]] event.
		 *
		 * The result of a watchForBannedAddresses() request is returned via a
		 * [[ClientManagerEvent.WATCH_FOR_BANNED_ADDRESSES_RESULT]] event.
		 *
		 * By default, watchForBannedAddresses() requires administrator privileges. To allow other
		 * types of clients (such as moderators) to access the banned address list, define a
		 * remote-client security rule.
		 */
		watchForBannedAddresses():void
		{
			this.messageManager.sendUPC(net.user1.orbiter.UPC.WATCH_FOR_BANNED_ADDRESSES);
		}

		/**
		 * Asks the server to send a list of clients currently connected to the server, and then
		 * send notification any time a client connects or disconnects. When the client list is
		 * ready, ClientManager dispatches a [[ClientManagerEvent.SYNCHRONIZE]] event. Subsequent
		 * client connections trigger a [[ClientManagerEvent.CLIENT_CONNECTED]] event. Subsequent
		 * disconnections trigger a [[ClientManagerEvent.CLIENT_DISCONNECTED]] event.
		 *
		 * Clients that are added to the ClientManager's client list in response to
		 * watchForClients() do not have attributes loaded. To load attributes for a specific
		 * client, use [[Client.observe]] method or [[ClientManager.observeClient]] method. In the
		 * default configuration, attributes can also be loaded for a given client by joining a room
		 * containing that client.
		 *
		 * As an alternative to watchForClients(), applications can maintain an arbitrary shared
		 * list of clients (with attributes automatically loaded or not) by creating an application
		 * room and then forcing all clients in the application to join that room. Clients wishing
		 * to load the list without being included in it can observe the application room and
		 * register for [[RoomEvent.ADD_OCCUPANT]] and [[RoomEvent.REMOVE_OCCUPANT]] events.
		 * Clients in the list can ignore client list updates by turning off updates for the room
		 * via the Room class's setUpdateLevels() method. In applications that wish to manage client
		 * lists, room-based client lists are normally more appropriate than watchForClients().
		 * The watchForClients() method is intended for use primarily in cases where the list of
		 * rooms and clients on Union Server is not known in advance, and cannot be controlled (as
		 * is often true for server-administration applications). As a final alternative to
		 * watchForClients(), applications can use the ClientListSnapshot class to load a one-time
		 * list of clients on the server.
		 *
		 * The result of a watchForClients() request is returned via a
		 * [[ClientManagerEvent.WATCH_FOR_CLIENTS_RESULT]] event.
		 */
		watchForClients():void
		{
			this.messageManager.sendUPC(net.user1.orbiter.UPC.WATCH_FOR_CLIENTS);
		}
	}
}

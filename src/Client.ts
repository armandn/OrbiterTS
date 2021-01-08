namespace net.user1.orbiter
{
	import Logger = net.user1.logger.Logger;

	/**
	 * The Client class represents a unique client that is connected to Union Server. Each client
	 * can send and receive messages and store shared data in client attributes.
	 *
	 * To learn how Client objects represent client connections in Orbiter's API, let's consider a
	 * simple chat application, running on two separate computers, "A" and "B". When chat starts on
	 * computer A, it connects to Union Server.
	 *
	 * When the connection from computer A's chat to Union Server is established, Union Server
	 * creates a server-side client object for the socket opened by computer A's chat, and assigns
	 * that client a unique clientID (such as "37"). Likewise, when the connection from computer B's
	 * chat to Union Server is established, Union Server creates a second client object and assigns
	 * it a unique clientID (such as "38"). At this stage, the two clients are connected to the
	 * server, but have no knowledge of each other.
	 *
	 * To gain knowledge of each other, the two clients--let's call them clientA (for computer A's
	 * chat) and clientB (for computer B's chat)--join a room. Here's the "join-room" code that runs
	 * in each chat.
	 *
	 * Upon joining the room "examples.chat", each client is automatically sent a list of the room's
	 * "occupants" (the clients in the room). Let's suppose computer A's chatjoins the room  first,
	 * and is sent a list of room occupants for the room "examples.chat". Because clientA was the
	 * first client in the room, the list contains clientA only. (If there had already been other
	 * occupants in the room, they would also have been included in the list.) After clientA
	 * receives the room's occupant list, it triggers a RoomEvent.JOIN event. Once that event has
	 * fired, computer A's chat can access the clients in the room using [[Room.getOccupants]]
	 * method.
	 *
	 * Now suppose clientB joins the "examples.chat" room. Because clientA is already in the room,
	 * it receives notification that clientB joined the room, and the Room object in computer A's
	 * chat.swf triggers the RoomEvent.ADD_OCCUPANT event. That event gives clientA access to the
	 * Client object for clientB via the [[RoomEvent.getClient]] method.
	 *
	 * Once clientA has a reference to clientB's Client object, clientA can access clientB's data by
	 * reading its attributes, and clientA can communicate with clientB by sending it messages. For
	 * example, in the following code, chat sends a private message to clientB (and any other client
	 * that subsequently joins the room).
	 *
	 * In addition to joining rooms, clients can gain knowledge of each other via the
	 * [[ClientManager.watchForClients]] and observeClient() methods. The watchForClients() method
	 * gives the current client knowledge of every client on the server. The observeClient() method
	 * gives the current client knowledge of one specific client. At any time, the Client object for
	 * any known client can be retrieved via [[ClientManager.getClient]] method.
	 *
	 * In addition to accessing other clients (referred to as "foreign clients") each client can
	 * access the Client object representing its own connection via self() method. The Client object
	 * representing a client's own connection is known as the current client.
	 *
	 * Clients store data in client attributes, which act as shareable multiuser variables. To
	 * retrieve a client's attribute values, use the [[Client.getAttribute]] method.
	 *
	 * To set a client's attributes use setAttribute(). Note, however, that by default, a client can
	 * set its own attributes only, and cannot set the attributes of other connected clients.
	 *
	 * It is not necessary to poll for changes in client attributes. When a client attribute is
	 * shared, changes to its value automatically trigger the RoomEvent.UPDATE_CLIENT_ATTRIBUTE
	 * event and the AttributeEvent.UPDATE event.
	 *
	 * In order to reduce traffic between the server and clients, by default, not all clients on the
	 * server are accessible as Client instances. The current client has access to other clients in
	 * it's "sphere of knowledge" only, which includes synchronized rooms, "observed" clients (see
	 * [[ClientManager.observeClient]] method), and "watched" clients (see
	 * [[ClientManager.watchForClients]] method).
	 *
	 * Because client 1 is in both the "chat1" room and the "chat2" room, its list of Client objects
	 * includes the clients with ids 1, 2, 3, 4, and 5. But client 1's list of Client objects does
	 * not include the clients with ids 6, 7, and 8 because client 1 is not in the "chat3" room.
	 *
	 * Applications can apply custom behaviour to connected clients by assigning a custom client
	 * class via the following methods: [[Client.setClientClass]],
	 * [[RoomManager.setDefaultClientClass]], and [[ClientManger.setDefaultClientClass]].
	 *
	 * Clients can save persistent data for later retrieval by creating and logging into a user
	 * account. User accounts are built-in to Union, and come ready to use with every Union Server
	 * installation. To login to an account, use the [[AccountManager.login]] method. To access a
	 * logged-in client's user account, use the [[Client.getAccount]] method. For complete
	 * information on user accounts, see the [[UserAccount]] class.
	 *
	 * In cases where an application wishes to retrieve a one-time snapshot of information about an
	 * arbitrary client on the server, and does not need that information to be kept up-to-date
	 * automatically, the application can use the [[ClientSnapshot]] class.
	 */
	export class Client extends net.user1.events.EventDispatcher implements IClient
	{
		private static FLAG_ADMIN = 1 << 2;

		private _isSelf:boolean = false;
		private account:UserAccount|null = null;
		private attributeManager:AttributeManager;
		private clientID:string = '';
		private connectionState:ConnectionState = ConnectionState.UNKNOWN;
		private customClients:{[key:string]:CustomClient} = {};
		private disposed:boolean = false;
		private observedRoomIDs:string[] = [];
		private occupiedRoomIDs:string[] = [];

		/**
		 * Initializes Client instances. Note that Client instances are created automatically by
		 * ClientManager. Do not attempt to create Client instances manually.
		 * @param {string} clientID
		 * @param {net.user1.orbiter.ClientManager} clientManager
		 * @param {net.user1.orbiter.MessageManager} messageManager
		 * @param {net.user1.orbiter.RoomManager} roomManager
		 * @param {net.user1.orbiter.ConnectionManager} connectionManager
		 * @param {net.user1.orbiter.Server} server
		 * @param {net.user1.logger.Logger} log
		 */
		constructor(clientID:string,
		            private clientManager:ClientManager,
		            private messageManager:MessageManager,
		            private roomManager:RoomManager,
		            private connectionManager:ConnectionManager,
		            private server:Server,
		            private log:Logger)
		{
			super();

			this.attributeManager = new AttributeManager(this, this.messageManager, this.log);

			this.setClientID(clientID);
		}

		addObservedRoomID(roomID:string):void
		{
			if (!this.isObservingRoom(roomID) && roomID != null)
			{
				this.log.info(`Client [${this.getClientID()}] added observed room ID [${roomID}].`);
				this.observedRoomIDs.push(roomID);
			}
		}

		addOccupiedRoomID(roomID:string):void
		{
			if (!this.isInRoom(roomID) && roomID != null)
			{
				this.log.info(`${this.toString()} added occupied room ID [${roomID}].`);
				this.occupiedRoomIDs.push(roomID);
			}
		}

		ban(duration:number, reason?:string):void
		{
			if (this.getClientID() == null)
			{
				this.log.warn(`${this} Ban attempt failed. Client not currently connected.`);
			}
			this.messageManager.sendUPC(UPC.BAN, undefined, this.getClientID(), duration.toString(), reason);
		}

		private createCustomClient<T>(wrapperClass:new ()=>T, scope?:string):T
		{
			// Wrap the client
			const customClient = new wrapperClass();

			//@ts-ignore FIXME this is definitely a bug carried over AS3... scope can't be null here
			this.customClients[scope] = customClient as unknown as CustomClient;

			// Do custom client setup
			if (customClient instanceof CustomClient)
			{
				customClient.setClient(this);
				customClient.init();
				return customClient;
			}
			else
			{
				this.log.debug(`[CLIENT_MANAGER] Custom client class [${wrapperClass}] does not  extend CustomClient. Assuming specified class will manually  compose its own Client instance for client ID: ${this.clientID}. See Client.setClientClass().`);
				return customClient;
			}
		}

		deleteAttribute(attrName:string, attrScope?:string):void
		{
			const deleteRequest = new upc.RemoveClientAttr(this.getClientID(), undefined, attrName, attrScope);
			this.attributeManager.deleteAttribute(deleteRequest);
		}

		dispose():void
		{
			// Normally, this client's connection state is not assigned directly; it it is deduced
			// within getConnectionState(). But when Union sends a u103, we know that this client
			// has definitely disconnected from the server, and this client object will never be
			// reused

			// @ts-ignore
			this.occupiedRoomIDs = undefined;
			this.attributeManager.dispose();
			// @ts-ignore
			this.attributeManager = undefined;
			// @ts-ignore
			this.clientID = undefined;
			// @ts-ignore
			this.log = undefined;
			this.account = null;
			// @ts-ignore
			this.customClients = undefined;
			// @ts-ignore
			this.messageManager = undefined;
			// @ts-ignore
			this.clientManager = undefined;
			// @ts-ignore
			this.roomManager = undefined;
			// @ts-ignore
			this.server = undefined;
			this.disposed = true;
		}

		fireJoinRoom(room:Room, roomID:string):void
		{
			this.log.debug(`${this} triggering ClientEvent.JOIN_ROOM event.`);
			// Trigger event on listeners.
			const e = new ClientEvent(ClientEvent.JOIN_ROOM, undefined, room, roomID, this);
			this.dispatchEvent(e);
		}

		fireLeaveRoom(room:Room, roomID:string):void
		{
			this.log.debug(`${this} triggering ClientEvent.LEAVE_ROOM event.`);
			// Trigger event on listeners.
			const e = new ClientEvent(ClientEvent.LEAVE_ROOM, undefined, room, roomID, this);
			this.dispatchEvent(e);
		}

		fireLogin():void
		{
			const e = new AccountEvent(AccountEvent.LOGIN, Status.SUCCESS, this.getAccount()?.getUserID(), this.getClientID());
			this.dispatchEvent(e);
		}

		fireLogoff(userID:string):void
		{
			const e = new AccountEvent(AccountEvent.LOGOFF, Status.SUCCESS, userID, this.getClientID());
			this.dispatchEvent(e);
		}

		fireObserve():void
		{
			// Trigger event on listeners.
			const e = new ClientEvent(ClientEvent.OBSERVE, undefined, undefined, undefined, this);
			this.dispatchEvent(e);
		}

		fireObserveResult(status:Status):void
		{
			// Trigger event on listeners.
			const e = new ClientEvent(ClientEvent.OBSERVE_RESULT, undefined, undefined, undefined, this, status);
			this.dispatchEvent(e);
		}

		fireObserveRoom(room:Room, roomID:string):void
		{
			this.log.debug(`${this} triggering ClientEvent.OBSERVE_ROOM event.`);
			// Trigger event on listeners.
			const e = new ClientEvent(ClientEvent.OBSERVE_ROOM, undefined, room, roomID, this);
			this.dispatchEvent(e);
		}

		fireStopObserving():void
		{
			// Trigger event on listeners.
			const e = new ClientEvent(ClientEvent.STOP_OBSERVING, undefined, undefined, undefined, this);
			this.dispatchEvent(e);
		}

		fireStopObservingResult(status:Status):void
		{
			// Trigger event on listeners.
			const e = new ClientEvent(ClientEvent.STOP_OBSERVING_RESULT, undefined, undefined, undefined, this, status);
			this.dispatchEvent(e);
		}

		fireStopObservingRoom(room:Room, roomID:string):void
		{
			this.log.debug(`${this} triggering ClientEvent.STOP_OBSERVING_ROOM event.`);
			// Trigger event on listeners.
			const e = new ClientEvent(ClientEvent.STOP_OBSERVING_ROOM, undefined, room, roomID, this);
			this.dispatchEvent(e);
		}

		fireSynchronize():void
		{
			// Trigger event on listeners.
			const e = new ClientEvent(ClientEvent.SYNCHRONIZE, undefined, undefined, undefined, this);
			this.dispatchEvent(e);
		}

		getAccount():UserAccount|null
		{
			return this.account;
		}

		getAttribute(attrName:string, attrScope?:string):string|null
		{
			return this.attributeManager.getAttribute(attrName, attrScope);
		}

		getAttributeManager():AttributeManager
		{
			return this.attributeManager;
		}

		getAttributes():{[name:string]:string|undefined} | null
		{
			return this.attributeManager.getAttributes();
		}

		getAttributesByScope(scope?:string):{[scope:string]:{[name:string]:string|undefined}} | {[name:string]:string|undefined} | null
		{
			return this.attributeManager.getAttributesByScope(scope);
		}

		private getClientClass(scope?:string):null
		{
			const clientClassNames = this.getAttribute(Tokens.CUSTOM_CLASS_ATTR, scope);
			let clientClassList;

			// Convert the custom class names to an array for processing
			if (clientClassNames)
			{
				clientClassList = clientClassNames.split(' ');
			}

			if (clientClassList != null)
			{
				for (let i = 0; i < clientClassList.length; i++)
				{
					let className = clientClassList[i];

					try
					{
						const theClass = this.resolveMemberExpression(className);
						if (!(theClass instanceof Function))
						{
							this.log.debug(`${this.toString()}: Definition for client class [${className}] is not a constructor function.`);
							continue;
						}
						return theClass;
					}
					catch (e)
					{
						this.log.debug(`${this.toString()}: No definition found for client class [${className}]`);
					}
				}
			}
			return null;
		}

		/**
		 * Returns this client's unique ID, as set automatically by the server. The client's id
		 * persists for the length of the client connection, and cannot be changed during that
		 * connection. A client's ID expires when the client disconnects.
		 *
		 * Note that only two things are guaranteed about the client ID:
		 * - it is a string, and
		 * - it is unique on the server.
		 * The specific format of the client id is arbitrary, and is not guaranteed, nor should it
		 * be relied upon. For example, if the ID happens to be numeric (say, "35"), mathematical
		 * calculations should not be performed based on that number. The ID format is itself,
		 * subject to change without notice. It is hazardous to write client-side code that relies
		 * on the internal client ID itself rather than simply the fact that the ID is guaranteed
		 * to be unique. For a truly sequential ordering of clients, use the Client class's
		 * getConnectTime(), which returns the time on the server when a given client connected.
		 *
		 * The client ID of the current client is available only after the OrbiterEvent.READY event
		 * occurs.
		 *
		 * Note that in addition to having a client ID, a client might also be logged into a user
		 * account that has a userID. Whereas a client ID is a temporary, automatically generated
		 * identifier for a single connection, a user ID is the name of a permanent server-side
		 * user account, and is available only after a client logs in. See the UserAccount class
		 * and the Client class's getAccount() method.
		 * @return {string}
		 */
		getClientID():string
		{
			return this.clientID;
		}

		getClientManager():ClientManager
		{
			return this.clientManager;
		}

		getConnectTime():number
		{
			const ct = this.getAttribute('_CT');
			return parseFloat(ct ?? '');
		}

		/**
		 * Indicates the state of the client's current server connection. The value is one of the
		 * constants of the ConnectionState class.
		 * @return {net.user1.orbiter.ConnectionState}
		 */
		getConnectionState():ConnectionState
		{
			if (this.isSelf())
			{
				if (this.disposed || !this.clientManager.getInternalClient(this.getClientID()))
				{
					return ConnectionState.NOT_CONNECTED;
				}
				else
				{
					return this.account?.getConnectionState() ?? this.connectionManager.getConnectionState();
				}
			}
			else
			{
				if (this.connectionState != ConnectionState.UNKNOWN)
				{
					return this.connectionState;
				}
				else
				if (this.disposed || !this.clientManager.getInternalClient(this.getClientID()))
				{
					return ConnectionState.UNKNOWN;
				}
				else
				{
					return this.account?.getConnectionState() ?? ConnectionState.READY;
				}
			}
		}

		getCustomClient(scope?:string):CustomClient|null
		{
			// If the custom client already exists for the specified scope, return it.
			if (scope)
			{
				const customClient = this.customClients[scope];
				if (customClient)
				{
					return customClient;
				}
			}

			// Look for a custom class for the given scope, and create a custom client
			if (scope == null)
			{
				return this.setGlobalCustomClient();
			}
			else
			{
				return this.setCustomClientForScope(scope);
			}
		}

		getIP():string|null
		{
			return this.getAttribute('_IP');
		}

		getObservedRoomIDs():string[]
		{
			if (this.clientManager.isObservingClient(this.getClientID()))
			{
				// This client is under observation, so its occupiedRoomIDs array is 100% accurate.
				return this.observedRoomIDs.slice(0);
			}
			else
			{
				// This client is not under observation, so the current client can only deduce this
				// client's occupied room list based on its current sphere of awareness.
				const knownRooms = this.roomManager.getRooms(),
				      ids:string[] = [];

				for (let i = 0, numKnownRooms = knownRooms.length; i < numKnownRooms; i++)
				{
					const room = knownRooms[i];
					if (room.clientIsObservingRoom(this.getClientID()))
					{
						ids.push(room.getRoomID());
					}
				}
				return ids;
			}
		}

		getOccupiedRoomIDs():string[]
		{
			if (this.clientManager.isObservingClient(this.getClientID()))
			{
				// This client is under observation, so its occupiedRoomIDs array is
				// 100% accurate.
				return this.occupiedRoomIDs.slice(0);
			}
			else
			{
				// This client is not under observation, so the current client can only
				// deduce this client's occupied room list based on its current sphere of awareness.
				const knownRooms = this.roomManager.getRooms(),
				      ids:string[] = [];
				for (let i = 0, numKnownRooms = knownRooms.length; i < numKnownRooms; i++)
				{
					const room = knownRooms[i];
					if (room.clientIsInRoom(this.getClientID()))
					{
						ids.push(room.getRoomID());
					}
				}
				return ids;
			}
		}

		getPing():number
		{
			const ping = this.getAttribute('_PING');
			return ping == null ? -1 : parseInt(ping);
		}

		getTimeOnline():number
		{
			return !this.server ? NaN : this.server.getServerTime() - this.getConnectTime();
		}

		getUpdateLevels(roomID?:string):UpdateLevels|null
		{
			const levelsAttr = this.getAttribute('_UL', roomID);
			if (levelsAttr != null)
			{
				const levels = new UpdateLevels();
				levels.fromInt(parseInt(levelsAttr));
				return levels;
			}
			else
			{
				return null;
			}
		}

		/**
		 * Returns a Boolean indicating whether the client has administrator privileges. The
		 * administrator security role is available to clients that connect and authenticate over
		 * Union Server's administration port only.
		 *
		 * @return {boolean} true if the client has administrator privileges, false otherwise.
		 * @return
		 */
		isAdmin():boolean
		{
			const rolesAttr = this.getAttribute(Tokens.ROLES_ATTR);
			if (rolesAttr != null)
			{
				return (parseInt(rolesAttr) & Client.FLAG_ADMIN) == 1;
			}
			else
			{
				this.log.warn(`[${this.toString()}] Could not determine admin status because the client is not synchronized.`);
				return false;
			}
		}

		isInRoom(roomID:string):boolean
		{
			return this.getOccupiedRoomIDs().indexOf(roomID) != -1;
		}

		isObservingRoom(roomID:string):boolean
		{
			return this.getObservedRoomIDs().indexOf(roomID) != -1;
		}

		/**
		 * Returns true if this client is the current client. See [[Orbiter.self]] method.
		 * @return {boolean}
		 */
		isSelf():boolean
		{
			return this._isSelf;
		}

		kick():void
		{
			if (this.getClientID() == null)
			{
				this.log.warn(`${this} Kick attempt failed. Client not currently connected.`);
			}
			this.messageManager.sendUPC(UPC.KICK_CLIENT, this.getClientID());
		}

		/**
		 * Asks the server to keep this client's state permanently synchronized. As a result, the
		 * current client is notified any time any of following:
		 * - the client sets or deletes an attribute
		 * - the client joins or leaves a room
		 * - the client observes or stops observing a room
		 * - the client disconnects
		 *
		 * Notifications from the server trigger the following events:
		 * - AttributeEvent.UPDATE (for attribute changes)
		 * - AttributeEvent.DELETE (for attribute removals)
		 * - ClientEvent.JOIN_ROOM and ClientEvent.LEAVE_ROOM
		 * - ClientEvent.OBSERVE_ROOM and ClientEvent.STOP_OBSERVING_ROOM
		 * - ClientManagerEvent.CLIENT_DISCONNECTED
		 *
		 * The result of an observe() call is returned via a ClientEvent.OBSERVE_RESULT event. If
		 * the call succeeds, the ClientEvent.OBSERVE event is triggered. After the client has
		 * been synchronized for the first time, the ClientEvent.SYNCRHONIZE event is triggered.
		 */
		observe():void
		{
			this.messageManager.sendUPC(UPC.OBSERVE_CLIENT, this.clientID);
		}

		removeObservedRoomID(roomID:string):boolean
		{
			if (this.isObservingRoom(roomID) && roomID != null)
			{
				this.observedRoomIDs.splice(this.observedRoomIDs.indexOf(roomID), 1);
				return true;
			}
			else
			{
				return false;
			}
		}

		removeOccupiedRoomID(roomID:string):boolean
		{
			if (this.isInRoom(roomID) && roomID != null)
			{
				this.occupiedRoomIDs.splice(this.occupiedRoomIDs.indexOf(roomID), 1);
				return true;
			}
			else
			{
				return false;
			}
		}

		private resolveMemberExpression(value:string)
		{
			const parts = value.split('.');

			// @ts-ignore
			let reference = globalObject ?? {};

			for (let i = 0; i < parts.length; i++)
				reference = reference[parts[i]];

			return reference;
		}

		/**
		 * Sends a message, with arguments, to another client. To receive the message, the recipient
		 * client defines a method (or multiple methods) to be executed when the message arrives.
		 * Each method wishing to be executed registers for the message separately using
		 * `MessageManager`'s `addMessageListener()` method.
		 *
		 * To send a message to an arbitrary list of individual clients instead of to a single
		 * client, use `ClientManager.sendMessage()`.
		 *
		 * @param messageName The name of the message to send to the specified client.
		 * @param rest        An optional comma-separated list of string arguments for the message.
		 */
		sendMessage(messageName:string, ...rest:string[]):void
		{
			if (!this.clientManager)
			{
				return;
			}

			this.clientManager.sendMessage(messageName, [this.getClientID()], null, ...rest);
		}

		setAccount(value?:UserAccount):void
		{
			if (!value)
			{
				this.account = null;
			}
			else
			{
				if (this.account != value)
				{
					this.account = value;
					this.account.setClient(this);
				}
			}
		}

		/**
		 * Sets a client attribute for this client. The attribute and its value are stored on, and
		 * managed by, the server. A client attribute contains information about the client, much
		 * like a variable. However, unlike a basic variable, a client attribute and its value can
		 * be shared amongst other connected clients. Logged-in clients can also use user account
		 * attributes to save information to a database or other data source for later retrieval
		 * (see the UserAccount class's `setAttribute()` method for details).
		 *
		 * Client attributes are used to track the characteristics of a client, such as a name, an
		 * age, a hair colour, or a score. Other connected clients could then access the age "39" on
		 * that client by retrieving its "age" attribute via `Client.getAttribute()`. In addition,
		 * if the client were to change its age from "39" to "40", other interested clients would be
		 * notified of the change. By responding to the change notification, other clients could,
		 * say, keep a user list for a chat room updated with the current user ages.
		 *
		 * To be notified of changes to a specific client's attributes, applications can register
		 * with that client for the `AttributeEvent.UPDATE` event.
		 *
		 * Every client attribute must be scoped to either a specific room or to all rooms. A client
		 * attribute that is scoped to all rooms is known as a "global client attribute". An
		 * attribute's scope determines which clients are updated when the attribute changes.
		 *
		 * To delete a client attribute permanently, use Client's `deleteAttribute()` method. When a
		 * client attribute is deleted, rooms the client is in trigger the
		 * `RoomEvent.DELETE_CLIENT_ATTRIBUTE` event, and the Client object for the client triggers
		 * the `AttributeEvent.DELETE` event.
		 *
		 * Client attributes are not deleted by the server until the client disconnects.
		 * Applications are expected to delete unwanted attributes explicitly via
		 * `deleteAttribute()`. Applications that create numerous client attributes for long-lasting
		 * connections should take care to prevent server-side memory accumulation by deleting each
		 * attribute after it is no longer needed.
		 *
		 * Note that by default the pipe character ("|") is used internally to separate attributes
		 * during transmission to and from the server. Hence, attribute names and values must not
		 * contain the character "|". For more information, see `Tokens.RS`.
		 * </p>
		 *
		 * @param attrName  The attribute name. Must not contain the pipe character ("|").
		 * @param attrValue The attribute value. Must not contain the pipe character ("|").
		 * @param attrScope A fully qualified roomID indicating the attribute's scope. The client
		 *                  need not be in the room to use it as the attribute's scope. However,
		 *                  when a client sets an attribute scoped to a room it is not currently in,
		 *                  other clients in that room are not notified of the attribute update. To
		 *                  create a global attribute (i.e., an attribute scoped to all rooms), set
		 *                  attrScope to undefined (the default). To retrieve a fully qualified room
		 *                  identifier for a Room object, (for use as an attribute scope) use Room's
		 *                  getRoomID() method.
		 * @param isShared  Flag indicating that interested clients should be notified when the
		 *                  attribute changes (true) or that no clients should be notified when the
		 *                  attribute changes (false). Attribute updates are handled via
		 *                  RoomEvent.UPDATE_CLIENT_ATTRIBUTE and AttributeEvent.UPDATE isteners.
		 *                  Defaults to true (shared).
		 * @param evaluate  If true, the server will evaluate the attrValue as a mathematical
		 *                  expression before assigning the attribute its new value. Within the
		 *                  expression, the token "%v" means "substitute the attribute's current
		 *                  value". When evaluate is true, attrValue can contain the following
		 *                  characters only: the numbers 0-9, ., *, /, +, -, %, v.
		 */
		setAttribute(attrName:string, attrValue:string, attrScope?:string, isShared:boolean=true, evaluate:boolean=false):void
		{
			// Create an integer to hold the attribute options.
			const attrOptions = (isShared ? AttributeOptions.FLAG_SHARED   : 0) |
			                    (evaluate ? AttributeOptions.FLAG_EVALUATE : 0);

			// Make the SetClientAttr UPC first so inputs are validated
			const setClientAttr:UPC = new upc.SetClientAttr(attrName, attrValue, attrOptions, attrScope, this.getClientID());

			// Set the attribute locally now, unless:
			// -it is another client's attribute
			// -it is the current client's attribute, and the value has changed
			if (!(!this.isSelf() || evaluate))
			{
				// Set the attribute locally
				this.attributeManager.setAttributeLocal(attrName, attrValue, attrScope, this);
			}

			// Set the attribute on the server.
			this.messageManager.sendUPCObject(setClientAttr);
		}

		setClientClass<T>(scope:string, clientClass:new ()=>T, ...fallbackClasses:(new ()=>T)[]):void
		{
			if (!this.isSelf())
			{
				throw new Error(`Custom client class assignment failed for : ${clientClass}. A custom class can be set for the current client ( i.e., ClientManager.self()) only.`);
			}

			fallbackClasses.unshift(clientClass);
			const classList = fallbackClasses.join(' ');
			this.setAttribute(Tokens.CUSTOM_CLASS_ATTR, classList, scope);
		}

		/**
		 * Used by ClientManager to reassign a client id when a disconnected user reconnects.
		 * @param {string} id
		 * @private
		 */
		private setClientID(id:string):void
		{
			if (this.clientID != id)
				this.clientID = id;
		}

		setConnectionState(newState:ConnectionState):void
		{
			this.connectionState = newState;
		}

		private setCustomClientForScope(scope:string):CustomClient|null
		{
			// If this client has a default custom client class, use it
			const clientClass = this.getClientClass(scope);
			if (clientClass)
			{
				return this.createCustomClient(clientClass, scope);
			}

			// No class was set on the client for the scope, so check for a room default
			const theRoom = this.roomManager.getRoom(scope);
			if (theRoom)
			{
				const roomDefaultClientClass = theRoom.getDefaultClientClass();
				if (roomDefaultClientClass)
				{
					return this.createCustomClient(roomDefaultClientClass, scope);
				}
			}

			// No class was set on the room for the scope, so check for a system-wide default
			// If a custom global client already exists, return it.
			//@ts-ignore FIXME definitely a bug from AS3... can't use null as index
			const customClient = this.customClients[null];
			if (customClient)
			{
				return customClient;
			}
			else
			{
				const globalDefaultClientClass = this.clientManager.getDefaultClientClass();
				if (!globalDefaultClientClass)
				{
					// No global custom client class exists
					return null;
				}
				else
				{
					// Global default class exists
					return this.createCustomClient(globalDefaultClientClass, undefined);
				}
			}
		}

		private setGlobalCustomClient():CustomClient|null
		{
			// If this client has a default custom client class, use it
			const defaultClientClass = this.getClientClass();
			if (defaultClientClass)
			{
				return this.createCustomClient(defaultClientClass, undefined);
			}

			// No global class was set on the client, so check for a system-wide default
			const globalDefaultClientClass = this.clientManager.getDefaultClientClass();
			if (!globalDefaultClientClass)
			{
				// No global custom client class exists
				return null;
			}
			else
			{
				// Global default class exists
				return this.createCustomClient(globalDefaultClientClass, undefined);
			}
		}

		/**
		 * Tells this client that it is the current client. This method is invoked once per
		 * connection by the ClientManager when the client manager is provided with a reference to
		 * the current client via setSelf().
		 */
		setIsSelf():void
		{
			this._isSelf = true;
		}

		stopObserving():void
		{
			this.messageManager.sendUPC(UPC.STOP_OBSERVING_CLIENT, this.clientID);
		}

		synchronize(clientManifest:ClientManifest):void
		{
			this.synchronizeOccupiedRoomIDs(clientManifest.occupiedRoomIDs);
			this.synchronizeObservedRoomIDs(clientManifest.observedRoomIDs);

			// Synchronize Client attributes
			let scopes = clientManifest.transientAttributes.getScopes();
			for (let i = scopes.length; --i >= 0;)
			{
				this.attributeManager.getAttributeCollection()?.synchronizeScope(scopes[i], clientManifest.transientAttributes);
			}
			// Synchronize UserAccount attributes
			if (this.account)
			{
				let scopes = clientManifest.persistentAttributes.getScopes();
				for (let i = scopes.length; --i >= 0;)
				{
					this.account.getAttributeManager()?.getAttributeCollection()?.synchronizeScope(scopes[i], clientManifest.persistentAttributes);
				}
			}
		}

		private synchronizeObservedRoomIDs(newObservedRoomIDs?:string[]):void
		{
			if (!newObservedRoomIDs)
			{
				// Nothing to synchronize
				return;
			}
			// Remove any rooms that are not in the new list
			for (let i = this.observedRoomIDs.length; --i >= 0;)
			{
				const roomID = this.observedRoomIDs[i];
				if (newObservedRoomIDs.indexOf(roomID) == -1)
				{
					this.removeObservedRoomID(roomID);
				}
			}

			// Add any rooms that are not in the old list (existing room IDs are ignored)
			for (let i = newObservedRoomIDs.length; --i >= 0;)
			{
				const roomID = newObservedRoomIDs[i];
				this.addObservedRoomID(roomID);
			}
		}

		private synchronizeOccupiedRoomIDs(newOccupiedRoomIDs?:string[]):void
		{
			if (!newOccupiedRoomIDs)
			{
				// Nothing to synchronize
				return;
			}

			// Remove any rooms that are not in the new list
			for (let i = this.occupiedRoomIDs.length; --i >= 0;)
			{
				const roomID = this.occupiedRoomIDs[i];
				if (newOccupiedRoomIDs.indexOf(roomID) == -1)
				{
					this.removeOccupiedRoomID(roomID);
				}
			}

			// Add any rooms that are not in the old list (existing room IDs are ignored)
			for (let i = newOccupiedRoomIDs.length; --i >= 0;)
			{
				const roomID = newOccupiedRoomIDs[i];
				this.addOccupiedRoomID(roomID);
			}
		}

		private toString():string
		{
			return `[CLIENT clientID: ${this.getClientID()}, userID: ${this.account?.getUserID()}]`;
		}
	}
}

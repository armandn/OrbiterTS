namespace net.user1.orbiter
{
	/**
	 * @internal
	 * The CoreMessageListener class is an internal class that responds to the built-in UPC
	 * messages  sent by the server to the client. The CoreMessageListener class does not have any
	 * public  methods or variables.
	 */
	export class CoreMessageListener
	{
		private log:net.user1.logger.Logger;
		private roomMan:RoomManager;
		private accountMan:AccountManager;
		private clientMan:ClientManager;
		private snapshotMan:SnapshotManager;

		constructor(private readonly orbiter:Orbiter)
		{
			this.orbiter = orbiter;
			this.log = orbiter.getLog();
			this.registerCoreListeners();
			this.orbiter.getConnectionManager().addEventListener(ConnectionManagerEvent.SELECT_CONNECTION, this.selectConnectionListener, this);

			this.roomMan = this.orbiter.getRoomManager();
			this.accountMan = this.orbiter.getAccountManager();
			this.clientMan = this.orbiter.getClientManager();
			this.snapshotMan = this.orbiter.getSnapshotManager();
		}

		createHashFromArg(arg:string):{[key:string]:string}
		{
			const list = arg.split(Tokens.RS),
			      hash:{[key:string]:string} = {};

			for (let i = 0; i < list.length; i += 2)
			{
				hash[list[i]] = list[i + 1];
			}
			return hash;
		}

		registerCoreListeners():void
		{
			const msgMan = this.orbiter.getMessageManager();
			msgMan.addMessageListener(UPC.JOINED_ROOM, this.u6, this);
			msgMan.addMessageListener(UPC.RECEIVE_MESSAGE, this.u7, this);
			msgMan.addMessageListener(UPC.CLIENT_ATTR_UPDATE, this.u8, this);
			msgMan.addMessageListener(UPC.ROOM_ATTR_UPDATE, this.u9, this);
			msgMan.addMessageListener(UPC.CLIENT_METADATA, this.u29, this);
			msgMan.addMessageListener(UPC.CREATE_ROOM_RESULT, this.u32, this);
			msgMan.addMessageListener(UPC.REMOVE_ROOM_RESULT, this.u33, this);
			msgMan.addMessageListener(UPC.CLIENTCOUNT_SNAPSHOT, this.u34, this);
			msgMan.addMessageListener(UPC.CLIENT_ADDED_TO_ROOM, this.u36, this);
			msgMan.addMessageListener(UPC.CLIENT_REMOVED_FROM_ROOM, this.u37, this);
			msgMan.addMessageListener(UPC.ROOMLIST_SNAPSHOT, this.u38, this);
			msgMan.addMessageListener(UPC.ROOM_ADDED, this.u39, this);
			msgMan.addMessageListener(UPC.ROOM_REMOVED, this.u40, this);
			msgMan.addMessageListener(UPC.WATCH_FOR_ROOMS_RESULT, this.u42, this);
			msgMan.addMessageListener(UPC.STOP_WATCHING_FOR_ROOMS_RESULT, this.u43, this);
			msgMan.addMessageListener(UPC.LEFT_ROOM, this.u44, this);
			msgMan.addMessageListener(UPC.CHANGE_ACCOUNT_PASSWORD_RESULT, this.u46, this);
			msgMan.addMessageListener(UPC.CREATE_ACCOUNT_RESULT, this.u47, this);
			msgMan.addMessageListener(UPC.REMOVE_ACCOUNT_RESULT, this.u48, this);
			msgMan.addMessageListener(UPC.LOGIN_RESULT, this.u49, this);
			msgMan.addMessageListener(UPC.ROOM_SNAPSHOT, this.u54, this);
			msgMan.addMessageListener(UPC.OBSERVED_ROOM, this.u59, this);
			msgMan.addMessageListener(UPC.GET_ROOM_SNAPSHOT_RESULT, this.u60, this);
			msgMan.addMessageListener(UPC.STOPPED_OBSERVING_ROOM, this.u62, this);
			msgMan.addMessageListener(UPC.SERVER_HELLO, this.u66, this);
			msgMan.addMessageListener(UPC.JOIN_ROOM_RESULT, this.u72, this);
			msgMan.addMessageListener(UPC.SET_CLIENT_ATTR_RESULT, this.u73, this);
			msgMan.addMessageListener(UPC.SET_ROOM_ATTR_RESULT, this.u74, this);
			msgMan.addMessageListener(UPC.GET_CLIENTCOUNT_SNAPSHOT_RESULT, this.u75, this);
			msgMan.addMessageListener(UPC.LEAVE_ROOM_RESULT, this.u76, this);
			msgMan.addMessageListener(UPC.OBSERVE_ROOM_RESULT, this.u77, this);
			msgMan.addMessageListener(UPC.STOP_OBSERVING_ROOM_RESULT, this.u78, this);
			msgMan.addMessageListener(UPC.ROOM_ATTR_REMOVED, this.u79, this);
			msgMan.addMessageListener(UPC.REMOVE_ROOM_ATTR_RESULT, this.u80, this);
			msgMan.addMessageListener(UPC.CLIENT_ATTR_REMOVED, this.u81, this);
			msgMan.addMessageListener(UPC.REMOVE_CLIENT_ATTR_RESULT, this.u82, this);
			msgMan.addMessageListener(UPC.SESSION_TERMINATED, this.u84, this);
			msgMan.addMessageListener(UPC.LOGOFF_RESULT, this.u87, this);
			msgMan.addMessageListener(UPC.LOGGED_IN, this.u88, this);
			msgMan.addMessageListener(UPC.LOGGED_OFF, this.u89, this);
			msgMan.addMessageListener(UPC.ACCOUNT_PASSWORD_CHANGED, this.u90, this);
			msgMan.addMessageListener(UPC.CLIENTLIST_SNAPSHOT, this.u101, this);
			msgMan.addMessageListener(UPC.CLIENT_ADDED_TO_SERVER, this.u102, this);
			msgMan.addMessageListener(UPC.CLIENT_REMOVED_FROM_SERVER, this.u103, this);
			msgMan.addMessageListener(UPC.CLIENT_SNAPSHOT, this.u104, this);
			msgMan.addMessageListener(UPC.OBSERVE_CLIENT_RESULT, this.u105, this);
			msgMan.addMessageListener(UPC.STOP_OBSERVING_CLIENT_RESULT, this.u106, this);
			msgMan.addMessageListener(UPC.WATCH_FOR_CLIENTS_RESULT, this.u107, this);
			msgMan.addMessageListener(UPC.STOP_WATCHING_FOR_CLIENTS_RESULT, this.u108, this);
			msgMan.addMessageListener(UPC.WATCH_FOR_ACCOUNTS_RESULT, this.u109, this);
			msgMan.addMessageListener(UPC.STOP_WATCHING_FOR_ACCOUNTS_RESULT, this.u110, this);
			msgMan.addMessageListener(UPC.ACCOUNT_ADDED, this.u111, this);
			msgMan.addMessageListener(UPC.ACCOUNT_REMOVED, this.u112, this);
			msgMan.addMessageListener(UPC.JOINED_ROOM_ADDED_TO_CLIENT, this.u113, this);
			msgMan.addMessageListener(UPC.JOINED_ROOM_REMOVED_FROM_CLIENT, this.u114, this);
			msgMan.addMessageListener(UPC.GET_CLIENT_SNAPSHOT_RESULT, this.u115, this);
			msgMan.addMessageListener(UPC.GET_ACCOUNT_SNAPSHOT_RESULT, this.u116, this);
			msgMan.addMessageListener(UPC.OBSERVED_ROOM_ADDED_TO_CLIENT, this.u117, this);
			msgMan.addMessageListener(UPC.OBSERVED_ROOM_REMOVED_FROM_CLIENT, this.u118, this);
			msgMan.addMessageListener(UPC.CLIENT_OBSERVED, this.u119, this);
			msgMan.addMessageListener(UPC.STOPPED_OBSERVING_CLIENT, this.u120, this);
			msgMan.addMessageListener(UPC.OBSERVE_ACCOUNT_RESULT, this.u123, this);
			msgMan.addMessageListener(UPC.ACCOUNT_OBSERVED, this.u124, this);
			msgMan.addMessageListener(UPC.STOP_OBSERVING_ACCOUNT_RESULT, this.u125, this);
			msgMan.addMessageListener(UPC.STOPPED_OBSERVING_ACCOUNT, this.u126, this);
			msgMan.addMessageListener(UPC.ACCOUNT_LIST_UPDATE, this.u127, this);
			msgMan.addMessageListener(UPC.UPDATE_LEVELS_UPDATE, this.u128, this);
			msgMan.addMessageListener(UPC.CLIENT_OBSERVED_ROOM, this.u129, this);
			msgMan.addMessageListener(UPC.CLIENT_STOPPED_OBSERVING_ROOM, this.u130, this);
			msgMan.addMessageListener(UPC.ROOM_OCCUPANTCOUNT_UPDATE, this.u131, this);
			msgMan.addMessageListener(UPC.ROOM_OBSERVERCOUNT_UPDATE, this.u132, this);
			msgMan.addMessageListener(UPC.ADD_ROLE_RESULT, this.u134, this);
			msgMan.addMessageListener(UPC.REMOVE_ROLE_RESULT, this.u136, this);
			msgMan.addMessageListener(UPC.BAN_RESULT, this.u138, this);
			msgMan.addMessageListener(UPC.UNBAN_RESULT, this.u140, this);
			msgMan.addMessageListener(UPC.BANNED_LIST_SNAPSHOT, this.u142, this);
			msgMan.addMessageListener(UPC.WATCH_FOR_BANNED_ADDRESSES_RESULT, this.u144, this);
			msgMan.addMessageListener(UPC.STOP_WATCHING_FOR_BANNED_ADDRESSES_RESULT, this.u146, this);
			msgMan.addMessageListener(UPC.BANNED_ADDRESS_ADDED, this.u147, this);
			msgMan.addMessageListener(UPC.BANNED_ADDRESS_REMOVED, this.u148, this);
			msgMan.addMessageListener(UPC.KICK_CLIENT_RESULT, this.u150, this);
			msgMan.addMessageListener(UPC.SERVERMODULELIST_SNAPSHOT, this.u152, this);
			msgMan.addMessageListener(UPC.GET_UPC_STATS_SNAPSHOT_RESULT, this.u155, this);
			msgMan.addMessageListener(UPC.UPC_STATS_SNAPSHOT, this.u156, this);
			msgMan.addMessageListener(UPC.RESET_UPC_STATS_RESULT, this.u158, this);
			msgMan.addMessageListener(UPC.WATCH_FOR_PROCESSED_UPCS_RESULT, this.u160, this);
			msgMan.addMessageListener(UPC.PROCESSED_UPC_ADDED, this.u161, this);
			msgMan.addMessageListener(UPC.STOP_WATCHING_FOR_PROCESSED_UPCS_RESULT, this.u163, this);
			msgMan.addMessageListener(UPC.NODELIST_SNAPSHOT, this.u166, this);
			msgMan.addMessageListener(UPC.GATEWAYS_SNAPSHOT, this.u168, this);
		}

		selectConnectionListener(e:ConnectionManagerEvent)
		{
			const msgMan = this.orbiter.getMessageManager();
			if (msgMan.removeListenersOnDisconnect)
			{
				this.registerCoreListeners();
			}
		}

		u101(requestID:string, serializedIDs:string):void
		{
			if (requestID == '')
			{
				// Synchronize
				this.clientMan.deserializeWatchedClients(serializedIDs);
			}
			else
			{
				// Snapshot
				const clientList = [],
				      ids = serializedIDs.split(Tokens.RS);
				for (let i = ids.length - 1; i >= 0; i -= 2)
				{
					let thisUserID:string|null = ids[i];
					thisUserID = thisUserID == '' ? null : thisUserID;
					clientList.push({clientID:ids[i - 1], userID:thisUserID});
				}
				this.snapshotMan.receiveClientListSnapshot(requestID, clientList);
			}
		}

		u102(clientID:string):void
		{
			this.clientMan.addWatchedClient(this.clientMan.requestClient(clientID));
		}

		u103(clientID:string):void
		{
			const client = this.clientMan.getInternalClient(clientID);

			if (this.clientMan.hasWatchedClient(clientID))
				this.clientMan.removeWatchedClient(clientID);

			if (this.clientMan.isObservingClient(clientID))
				this.clientMan.removeObservedClient(clientID);

			// If the current client is both observing a client and watching for clients, it will
			// receive two u103 notifications. When the second one arrives, the client will be
			// unknown, so no disconnection event should be dispatched.
			if (client)
			{
				client.setConnectionState(ConnectionState.NOT_CONNECTED);
				// Retrieve the client reference using getClient() here so that the
				// ClientManagerEvent.CLIENT_DISCONNECTED event provides the application with access
				// to the custom client, if available.
				this.clientMan.fireClientDisconnected(this.clientMan.getClient(clientID)??undefined);
			}
		}

		u104(requestID:string, clientID:string, userID:string, serializedOccupiedRoomIDs:string, serializedObservedRoomIDs:string, globalAttrs:string, ...roomAttrs:string[]):void
		{
			const account = this.accountMan.requestAccount(userID),
			      clientManifest = new ClientManifest();

			clientManifest.deserialize(clientID, userID, serializedOccupiedRoomIDs, serializedObservedRoomIDs, globalAttrs, roomAttrs);

			if (clientID)
			{
				// --- Client update ---

				if (requestID == '')
				{
					// Synchronize
					const theClient = this.clientMan.requestClient(clientID);
					theClient.setAccount(account ?? undefined);
					theClient.synchronize(clientManifest);
					theClient.fireSynchronize();
				}
				else
				{
					// Snapshot
					this.snapshotMan.receiveClientSnapshot(requestID, clientManifest);
				}
			}
			else
			{
				// --- User account update ---
				if (requestID == '')
				{
					// Synchronize
					const scopes = clientManifest.persistentAttributes.getScopes();
					for (let i = scopes.length; --i >= 0;)
					{
						account?.getAttributeManager()?.getAttributeCollection()?.synchronizeScope(scopes[i], clientManifest.persistentAttributes);
					}
					account?.fireSynchronize();
				}
				else
				{
					// Snapshot
					this.snapshotMan.receiveAccountSnapshot(requestID, clientManifest);
				}
			}
		}

		u105(clientID:string, status:Status):void
		{
			const theClient = this.clientMan.getInternalClient(clientID);
			switch (status)
			{
				case Status.CLIENT_NOT_FOUND:
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.ALREADY_OBSERVING:
				case Status.PERMISSION_DENIED:
					this.clientMan.fireObserveClientResult(clientID, status);
					theClient?.fireObserveResult(status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u105. Client ID: [${clientID}], status: [${status}].`);
			}
		}

		u106(clientID:string, status:Status):void
		{
			const theClient = this.clientMan.getInternalClient(clientID);
			switch (status)
			{
				case Status.CLIENT_NOT_FOUND:
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.NOT_OBSERVING:
					this.clientMan.fireStopObservingClientResult(clientID, status);
					if (theClient)
						theClient.fireStopObservingResult(status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u106. Client ID: [${clientID}], status: [${status}].`);
			}
		}

		u107(status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.ALREADY_WATCHING:
					this.clientMan.fireWatchForClientsResult(status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u107.Status: [${status}].`);
			}
		}

		u108(status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
					this.clientMan.setIsWatchingForClients(false);
					this.clientMan.removeAllWatchedClients();
				case Status.ERROR:
				case Status.NOT_WATCHING:
					this.clientMan.fireStopWatchingForClientsResult(status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u108.Status: [${status}].`);
			}
		}

		u109(status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
					this.accountMan.setIsWatchingForAccounts(true);
				case Status.ERROR:
				case Status.ALREADY_WATCHING:
					this.accountMan.fireWatchForAccountsResult(status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u109.Status: [${status}].`);
			}
		}

		u110(status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
					this.accountMan.setIsWatchingForAccounts(false);
					this.accountMan.removeAllWatchedAccounts();
				case Status.ERROR:
				case Status.NOT_WATCHING:
					this.accountMan.fireStopWatchingForAccountsResult(status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u110.Status: [${status}].`);
			}
		}

		u111(userID:string):void
		{
			const account:UserAccount|null = this.accountMan.requestAccount(userID)
			account && this.accountMan.addWatchedAccount(account);
		}

		u112(userID:string):void
		{
			let account:UserAccount|null = null;

			if (this.accountMan.hasWatchedAccount(userID))
			{
				account = this.accountMan.removeWatchedAccount(userID);
			}
			if (this.accountMan.isObservingAccount(userID))
			{
				account = this.accountMan.removeObservedAccount(userID);
			}

			account && this.accountMan.fireAccountRemoved(userID, account);
		}

		u113(clientID:string, roomID:string):void
		{
			const theRoom = this.roomMan.getRoom(roomID),
			      client = this.clientMan.requestClient(clientID);

			if (!theRoom)
			{
				this.log.warn(`No room for u113. Room ID: [${roomID}].`);
				return;
			}

			client.addOccupiedRoomID(roomID);
			client.fireJoinRoom(theRoom, roomID);
		}

		u114(clientID:string, roomID:string):void
		{
			const theRoom = this.roomMan.getRoom(roomID),
			      client = this.clientMan.requestClient(clientID);

			if (!theRoom)
			{
				this.log.warn(`No room for u114. Room ID: [${roomID}].`);
				return;
			}

			client.removeOccupiedRoomID(roomID);
			client.fireLeaveRoom(theRoom, roomID);
		}

		u115(requestID:string, clientID:string, status:Status):void
		{
			this.snapshotMan.receiveSnapshotResult(requestID, status);
		}

		u116(requestID:string, userID:string, status:Status):void
		{
			this.snapshotMan.receiveSnapshotResult(requestID, status);
		}

		u117(clientID:string, roomID:string):void
		{
			const theRoom = this.roomMan.getRoom(roomID),
			      client = this.clientMan.requestClient(clientID);

			if (!theRoom)
			{
				this.log.warn(`No room for u117. Room ID: [${roomID}].`);
				return;
			}

			client.addObservedRoomID(roomID);
			client.fireObserveRoom(theRoom, roomID);
		}

		u118(clientID:string, roomID:string):void
		{
			const theRoom = this.roomMan.getRoom(roomID),
			      client = this.clientMan.requestClient(clientID);

			if (!theRoom)
			{
				this.log.warn(`No room for u118. Room ID: [${roomID}].`);
				return;
			}

			client.removeObservedRoomID(roomID);
			client.fireStopObservingRoom(theRoom, roomID);
		}

		u119(clientID:string):void
		{
			const client = this.clientMan.requestClient(clientID);
			this.clientMan.addObservedClient(client);
			client.fireObserve();
		}

		u120(clientID:string):void
		{
			const client = this.clientMan.getInternalClient(clientID);
			this.clientMan.removeObservedClient(clientID);
			if (client)
				client.fireStopObserving();
		}

		u123(userID:string, status:Status):void
		{
			const theAccount = this.accountMan.getAccount(userID);
			switch (status)
			{
				case Status.ACCOUNT_NOT_FOUND:
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.ALREADY_OBSERVING:
					this.accountMan.fireObserveAccountResult(userID, status);
					if (theAccount)
						theAccount.fireObserveResult(status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u123. User ID: [${userID}], status: [${status}].`);
			}
		}

		u124(userID:string):void
		{
			const theAccount = this.accountMan.requestAccount(userID);
			if (theAccount)
			{
				this.accountMan.addObservedAccount(theAccount);
				theAccount.fireObserve();
			}
		}

		u125(userID:string, status:Status):void
		{
			const theAccount = this.accountMan.getAccount(userID);
			switch (status)
			{
				case Status.ACCOUNT_NOT_FOUND:
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.ALREADY_OBSERVING:
					this.accountMan.fireStopObservingAccountResult(userID, status);
					theAccount?.fireStopObservingResult(status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u125. User ID: [${userID}], status: [${status}].`);
			}
		}

		u126(userID:string):void
		{
			const account = this.accountMan.getAccount(userID);
			this.accountMan.removeObservedAccount(userID);
			account?.fireStopObserving();
		}

		u127(requestID:string, serializedIDs:string):void
		{
			const ids = serializedIDs.split(Tokens.RS);

			if (requestID == '')
			{
				// Synchronize
				this.accountMan.deserializeWatchedAccounts(serializedIDs);
			}
			else
			{
				// Snapshot
				const accountList = [];
				for (let i = ids.length; --i >= 0;)
				{
					accountList.push(ids[i]);
				}
				this.snapshotMan.receiveAccountListSnapshot(requestID, accountList);
			}
		}

		u128(updateLevels:string, roomID:string):void
		{
			const room = this.roomMan.getRoom(roomID),
			      levels = new UpdateLevels();

			levels.fromInt(parseInt(updateLevels));
			if (room)
			{
				if (!levels.occupantList)
				{
					const occupantIDs = room.getOccupantIDs(),
					      numOccupantIDs = occupantIDs.length;

					for (let i = 0; i < numOccupantIDs; i++)
					{
						const occupantID = occupantIDs[i];
						room.removeOccupant(occupantID);
					}
				}
				if (!levels.observerList)
				{
					const observerIDs = room.getObserverIDs(),
					      numObserverIDs = observerIDs.length;

					for (let i = 0; i < numObserverIDs; i++)
					{
						const observerID = observerIDs[i];
						room.removeObserver(observerID);
					}
				}
				if (!levels.sharedRoomAttributes && !levels.allRoomAttributes)
				{
					room.getAttributeManager().removeAll();
				}
			}
		}

		u129(roomID:string, clientID:string, userID:string, globalAttributes:string, roomAttributes:string):void
		{
			const theClient = this.clientMan.requestClient(clientID),
			      account = this.accountMan.requestAccount(userID);

			if (account && theClient.getAccount() != account)
			{
				theClient.setAccount(account);
			}

			// If it's not the current client, set the client's attributes. 
			// (The current client obtains its own attributes through separate u8s.)
			const theRoom = this.roomMan.getRoom(roomID);

			if (!theRoom)
			{
				this.log.warn(`No room for u129. Room ID: [${roomID}]`);
				return;
			}

			if (!theClient.isSelf())
			{
				const clientManifest = new ClientManifest();
				clientManifest.deserialize(clientID, userID, undefined, undefined, globalAttributes, [roomID, roomAttributes]);
				theClient.synchronize(clientManifest);

				// If the client is observed, don't fire OBSERVE_ROOM; observed clients always
				// fire OBSERVE_ROOM based on observation updates. Likewise, don't fire OBSERVE_ROOM
				// on self; self fires OBSERVE_ROOM when it receives a u59.
				if (!this.clientMan.isObservingClient(clientID))
				{
					theClient.fireObserveRoom(theRoom, roomID);
				}
			}

			// Add the client to the room's observer list
			theRoom.addObserver(theClient);
		}

		u130(roomID:string, clientID:string):void
		{
			// Remove the room from the client's list of observed rooms
			const theClient = this.clientMan.requestClient(clientID),
			      theRoom = this.roomMan.getRoom(roomID);

			if (!theRoom)
			{
				this.log.warn(`No room for u130. Room ID: [${roomID}], status: [${status}].`);
				return;
			}

			// Remove the client from the given room
			theRoom.removeObserver(clientID);

			// Don't fire STOP_OBSERVING_ROOM on self; self fires STOP_OBSERVING_ROOM
			// when it receives a u62.
			if (!theClient.isSelf())
			{
				// If the client is observed, don't fire STOP_OBSERVING_ROOM; observed 
				// clients always fire STOP_OBSERVING_ROOM based on observation updates.
				if (!this.clientMan.isObservingClient(clientID))
				{
					theClient.fireStopObservingRoom(theRoom, roomID);
				}
			}
		}

		u131(roomID:string, numClients:string):void
		{
			const levels = this.clientMan.self()?.getUpdateLevels(roomID);

			if (levels)
			{
				if (!levels.occupantList)
				{
					this.roomMan.getRoom(roomID)?.setNumOccupants(parseInt(numClients));
				}
			}
			else
			{
				throw new Error(`[CORE_MESSAGE_LISTENER] Received a room occupant count update (u131), but update levels are unknown for the room. Synchronization error`);
			}
		}

		u132(roomID:string, numClients:string):void
		{
			const levels = this.clientMan.self()?.getUpdateLevels(roomID);

			if (levels)
			{
				if (!levels.observerList)
				{
					this.roomMan.getRoom(roomID)?.setNumObservers(parseInt(numClients));
				}
			}
			else
			{
				throw new Error(`[CORE_MESSAGE_LISTENER] Received a room observer count update (u132), but update levels are unknown for the room. Synchronization error.`);
			}
		}

		u134(userID:string, role:string, status:Status):void
		{
			const theAccount = this.accountMan.getAccount(userID);
			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.ACCOUNT_NOT_FOUND:
				case Status.ROLE_NOT_FOUND:
				case Status.ALREADY_ASSIGNED:
				case Status.PERMISSION_DENIED:
					this.accountMan.fireAddRoleResult(userID, role, status);
					theAccount?.fireAddRoleResult(role, status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u134. User ID: [${userID}], role: [${role}], status: [${status}].`);
			}
		}

		u136(userID:string, role:string, status:Status):void
		{
			const theAccount = this.accountMan.getAccount(userID);
			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.ACCOUNT_NOT_FOUND:
				case Status.ROLE_NOT_FOUND:
				case Status.NOT_ASSIGNED:
				case Status.PERMISSION_DENIED:
					this.accountMan.fireRemoveRoleResult(userID, role, status);
					theAccount?.fireRemoveRoleResult(role, status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u136. User ID: [${userID}], role: [${role}], status: [${status}].`);
			}
		}

		u138(address:string, clientID:string, status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.CLIENT_NOT_FOUND:
				case Status.ALREADY_BANNED:
				case Status.PERMISSION_DENIED:
					this.clientMan.fireBanClientResult(address, clientID, status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u138. Address: [${address}], clientID: [${clientID}], status: [${status}].`);
			}
		}

		u140(address:string, status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.NOT_BANNED:
				case Status.PERMISSION_DENIED:
					this.clientMan.fireUnbanClientResult(address, status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u140. Address: [${address}], status: [${status}].`);
			}
		}

		u142(requestID:string, bannedListSource:string):void
		{
			const bannedList = bannedListSource == '' ? [] : bannedListSource.split(Tokens.RS);

			if (requestID == '')
			{
				this.clientMan.setWatchedBannedAddresses(bannedList);
			}
			else
			{
				// Snapshot
				this.snapshotMan.receiveBannedListSnapshot(requestID, bannedList);
			}
		}

		u144(status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.ALREADY_WATCHING:
				case Status.PERMISSION_DENIED:
					this.clientMan.fireWatchForBannedAddressesResult(status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u144: [${status}].`);
			}
		}

		u146(status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.NOT_WATCHING:
					this.clientMan.fireStopWatchingForBannedAddressesResult(status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u146: [${status}].`);
			}
		}

		u147(address:string):void
		{
			this.clientMan.addWatchedBannedAddress(address);
		}

		u148(address:string):void
		{
			this.clientMan.removeWatchedBannedAddress(address);
		}

		u150(clientID:string, status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.CLIENT_NOT_FOUND:
				case Status.PERMISSION_DENIED:
					this.clientMan.fireKickClientResult(clientID, status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u150: [${status}].`);
			}
		}

		u152(requestID:string, serverModuleListSource:string):void
		{
			const moduleListArray = serverModuleListSource == '' ? [] :
			                        serverModuleListSource.split(Tokens.RS);

			const moduleList:ModuleDefinition[] = [];
			for (let i = 0; i < moduleListArray.length; i += 3)
			{
				moduleList.push(new ModuleDefinition(moduleListArray[i], moduleListArray[i + 1], moduleListArray[i + 2]));
			}

			if (requestID == '')
			{
				this.log.warn('Incoming SERVERMODULELIST_SNAPSHOT UPC missing required requestID. Ignoring message.');
			}
			else
			{
				// Snapshot
				this.snapshotMan.receiveServerModuleListSnapshot(requestID, moduleList);
			}
		}

		u155(requestID:string, status:Status):void
		{
			this.snapshotMan.receiveSnapshotResult(requestID, status);
		}

		u156(requestID:string, totalUPCsProcessed:string, numUPCsInQueue:string, lastQueueWaitTime:string, ...longestUPCProcesses:string[]):void
		{
			const processes:UPCProcessingRecord[] = [];
			for (let i = 0; i < longestUPCProcesses.length; i++)
			{
				const upcProcessingRecord = new UPCProcessingRecord();
				upcProcessingRecord.deserialize(longestUPCProcesses[i]);
				processes[i] = upcProcessingRecord;
			}

			this.snapshotMan.receiveUPCStatsSnapshot(requestID, parseFloat(totalUPCsProcessed), parseFloat(numUPCsInQueue), parseFloat(lastQueueWaitTime), processes);
		}

		u158(status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.PERMISSION_DENIED:
					this.orbiter.getServer().dispatchResetUPCStatsResult(status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u158.Status: [${status}].`);
			}
		}

		u160(status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
					this.orbiter.getServer().setIsWatchingForProcessedUPCs(true);
				case Status.ERROR:
				case Status.ALREADY_WATCHING:
				case Status.PERMISSION_DENIED:
					this.orbiter.getServer().dispatchWatchForProcessedUPCsResult(status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u160.Status: [${status}].`);
			}
		}

		u161(fromClientID:string, fromUserID:string, fromClientAddress:string, queuedAt:string, processingStartedAt:string, processingFinishedAt:string, source:string):void
		{
			const upcProcessingRecord = new UPCProcessingRecord();
			upcProcessingRecord.deserializeParts(fromClientID, fromUserID, fromClientAddress, queuedAt, processingStartedAt, processingFinishedAt, source);
			this.orbiter.getServer().dispatchUPCProcessed(upcProcessingRecord);
		}

		u163(status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
					this.orbiter.getServer().setIsWatchingForProcessedUPCs(false);
				case Status.ERROR:
				case Status.NOT_WATCHING:
				case Status.PERMISSION_DENIED:
					this.orbiter.getServer().dispatchStopWatchingForProcessedUPCsResult(status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u163.Status: [${status}].`);
			}
		}

		u166(requestID:string, nodeListSource:string):void
		{
			const nodeIDs = nodeListSource == '' ? [] : nodeListSource.split(Tokens.RS);

			if (requestID == '')
			{
				this.log.warn('Incoming NODELIST_SNAPSHOT UPC missing required requestID. Ignoring message.');
			}
			else
			{
				// Snapshot
				this.snapshotMan.receiveNodeListSnapshot(requestID, nodeIDs);
			}
		}

		u168(requestID:string, gatewayListSource:string[]):void
		{
			const gateways:Gateway[]= [];

			for (let i = 0; i < gatewayListSource.length; i += 8)
			{
				const gateway = new Gateway();
				gateway.id = gatewayListSource[i];
				gateway.type = gatewayListSource[i + 1];

				gateway.lifetimeConnectionsByCategory = gatewayListSource[i + 2] === '' ? {} : this.createHashFromArg(gatewayListSource[i + 2]);
				for (let p in gateway.lifetimeConnectionsByCategory)
				{
					gateway.lifetimeConnectionsByCategory[p] = parseFloat(gateway.lifetimeConnectionsByCategory[p]);
				}
				gateway.lifetimeClientsByType = gatewayListSource[i + 3] === '' ? {} : this.createHashFromArg(gatewayListSource[i + 3]);
				for (let p in gateway.lifetimeClientsByType)
				{
					gateway.lifetimeClientsByType[p] = parseFloat(gateway.lifetimeClientsByType[p]);
				}
				gateway.lifetimeClientsByUPCVersion = gatewayListSource[i + 4] === '' ? {} : this.createHashFromArg(gatewayListSource[i + 4]);
				for (let p in gateway.lifetimeClientsByUPCVersion)
				{
					gateway.lifetimeClientsByUPCVersion[p] = parseFloat(gateway.lifetimeClientsByUPCVersion[p]);
				}
				gateway.attributes = gatewayListSource[i + 5] === '' ? {} : this.createHashFromArg(gatewayListSource[i + 5]);

				const gatewayIntervalSource = gatewayListSource[i + 6].split(Tokens.RS);
				gateway.connectionsPerSecond = parseFloat(gatewayIntervalSource[0]);
				gateway.maxConnectionsPerSecond = parseFloat(gatewayIntervalSource[1]);
				gateway.clientsPerSecond = parseFloat(gatewayIntervalSource[2]);
				gateway.maxClientsPerSecond = parseFloat(gatewayIntervalSource[3]);

				const gatewayBandwidth = new GatewayBandwidth();
				const gatewayBandwidthSource = gatewayListSource[i + 7].split(Tokens.RS);
				gatewayBandwidth.lifetimeRead =       parseFloat(gatewayBandwidthSource[0] || '0');
				gatewayBandwidth.lifetimeWritten =    parseFloat(gatewayBandwidthSource[1] || '0');
				gatewayBandwidth.averageRead =        parseFloat(gatewayBandwidthSource[2] || '0');
				gatewayBandwidth.averageWritten =     parseFloat(gatewayBandwidthSource[3] || '0');
				gatewayBandwidth.intervalRead =       parseFloat(gatewayBandwidthSource[4] || '0');
				gatewayBandwidth.intervalWritten =    parseFloat(gatewayBandwidthSource[5] || '0');
				gatewayBandwidth.maxIntervalRead =    parseFloat(gatewayBandwidthSource[6] || '0');
				gatewayBandwidth.maxIntervalWritten = parseFloat(gatewayBandwidthSource[7] || '0');
				gatewayBandwidth.scheduledWrite =     parseFloat(gatewayBandwidthSource[8] || '0');
				gateway.bandwidth = gatewayBandwidth;
				gateways.push(gateway);
			}

			if (requestID == '')
			{
				this.log.warn('Incoming GATEWAYS_SNAPSHOT UPC missing required requestID. Ignoring message.');
			}
			else
			{
				// Snapshot
				this.snapshotMan.receiveGatewaysSnapshot(requestID, gateways);
			}
		}

		u29(id:string):void
		{
			const theClient = this.clientMan.requestClient(id);
			this.clientMan.setSelf(theClient);
		}

		u32(roomID:string, status:Status):void
		{
			const theRoom = this.roomMan.getRoom(roomID);
			switch (status)
			{
				case Status.ERROR:
				case Status.SUCCESS:
				case Status.ROOM_EXISTS:
				case Status.PERMISSION_DENIED:
					this.roomMan.fireCreateRoomResult(RoomIDParser.getQualifier(roomID), RoomIDParser.getSimpleRoomID(roomID), status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u32. Room ID: [${roomID}], status: [${status}].`);
			}
		}

		u33(roomID:string, status:Status):void
		{
			this.roomMan.fireRemoveRoomResult(RoomIDParser.getQualifier(roomID), RoomIDParser.getSimpleRoomID(roomID), status);
			switch (status)
			{
				case Status.ERROR:
					this.log.warn(`Server error for room removal attempt: ${roomID}`);
					break;
				case Status.PERMISSION_DENIED:
					this.log.info(`Attempt to remove room [${roomID}] failed. Permission denied. See server log for details.`);
					break;

				case Status.SUCCESS:
				case Status.ROOM_NOT_FOUND:
					if (this.roomMan.getRoom(roomID))
					{
						this.roomMan.disposeRoom(roomID);
					}
					break;

				case Status.AUTHORIZATION_REQUIRED:
				case Status.AUTHORIZATION_FAILED:
					break;

				default:
					this.log.warn(`Unrecognized status code for u33. Room ID: [${roomID}], status: [${status}].`);
			}
		}

		u34(requestID:string, numClients:string):void
		{
			this.snapshotMan.receiveClientCountSnapshot(requestID, parseInt(numClients));
		}

		u36(roomID:string, clientID:string, userID:string, globalAttributes:string, roomAttributes:string):void
		{
			const theClient = this.clientMan.requestClient(clientID),
			      account = this.accountMan.requestAccount(userID);

			if (account && theClient.getAccount() != account)
			{
				theClient.setAccount(account);
			}

			// If it's not the current client, set the client's attributes. 
			// (The current client obtains its own attributes through separate u8s.)
			const theRoom = this.roomMan.getRoom(roomID);

			if (!theRoom)
			{
				this.log.warn(`No room for u36. Room ID: [${roomID}].`);
				return;
			}

			if (!theClient.isSelf())
			{
				const clientManifest = new ClientManifest();
				clientManifest.deserialize(clientID, userID, undefined, undefined, globalAttributes, [roomID, roomAttributes]);
				theClient.synchronize(clientManifest);

				// If the client is observed, don't fire JOIN; observed clients always fire JOIN
				// based on observation updates. Likewise, don't fire JOIN on self; self fires JOIN
				// when it receives a u6.
				if (!this.clientMan.isObservingClient(clientID))
				{
					theClient.fireJoinRoom(theRoom, roomID);
				}
			}

			// Add the client to the given room.
			theRoom.addOccupant(theClient);
		}

		u37(roomID:string, clientID:string):void
		{
			// Remove the room from the client's list of occupied rooms
			const theClient = this.clientMan.requestClient(clientID),
			      theRoom   = this.roomMan.getRoom(roomID);

			if (!theRoom)
			{
				this.log.warn(`No room for u37. Room ID: [${roomID}].`);
				return;
			}

			// Remove the client from the given room
			theRoom.removeOccupant(clientID);

			// Don't fire LEAVE on self; self fires LEAVE when it receives a u44.
			if (!theClient.isSelf())
			{
				// If the client is observed, don't fire LEAVE; observed clients always
				// fire LEAVE based on observation updates.
				if (!this.clientMan.isObservingClient(clientID))
				{
					theClient.fireLeaveRoom(theRoom, roomID);
				}
			}
		}

		u38(requestID:string, requestedRoomIDQualifier:string, recursive:string, ...args:string[]):void
		{
			const roomList = [];

			if (requestID == '')
			{
				// Synchronize
				for (let i = 0; i < args.length; i += 2)
				{
					const roomQualifier = args[i],
					      roomIDs = args[i + 1].split(Tokens.RS);

					this.roomMan.setWatchedRooms(roomQualifier, roomIDs);
				}
			}
			else
			{
				// Snapshot
				for (let i = 0; i < args.length; i += 2)
				{
					const roomQualifier = args[i],
					      roomIDs = args[i + 1].split(Tokens.RS);
					
					for (let j = 0; j < roomIDs.length; j++)
					{
						roomList.push(roomQualifier + (roomQualifier == '' ? '' : '.') + roomIDs[j]);
					}
				}
				this.snapshotMan.receiveRoomListSnapshot(requestID, roomList, requestedRoomIDQualifier, recursive == 'true');
			}
		}

		u39(roomID:string):void
		{
			// Add the room 
			this.roomMan.addWatchedRoom(roomID);
		}

		u40(roomID:string):void
		{
			this.roomMan.removeWatchedRoom(roomID);
			if (this.roomMan.getRoom(roomID))
			{
				this.roomMan.disposeRoom(roomID);
			}
		}

		u42(roomIdQualifier:string, recursive:string, status:Status):void
		{
			// Broadcast the result of the observation attempt.
			this.roomMan.fireWatchForRoomsResult(roomIdQualifier, status);
			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.INVALID_QUALIFIER:
				case Status.ALREADY_WATCHING:
				case Status.PERMISSION_DENIED:
					break;

				default:
					this.log.warn(`Unrecognized status code for u42. Room ID Qualifier: [${roomIdQualifier}], recursive: [${recursive}], status: [${status}].`);
			}
		}

		u43(roomIdQualifier:string, recursive:string, status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
					if (roomIdQualifier == '' && recursive == 'true')
					{
						this.roomMan.removeAllWatchedRooms();
					}
					else
					{
						// Remove all watched rooms for the qualifier
						this.roomMan.setWatchedRooms(roomIdQualifier, []);
					}
					
				case Status.ERROR:
				case Status.NOT_WATCHING:
				case Status.INVALID_QUALIFIER:
					this.roomMan.fireStopWatchingForRoomsResult(roomIdQualifier, status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u43. Room ID Qualifier: [${roomIdQualifier}], recursive: [${recursive}], status: [${status}].`);
			}
		}

		u44(roomID:string):void
		{
			const leftRoom = this.roomMan.getRoom(roomID);
			this.roomMan.removeOccupiedRoom(roomID);
			if (leftRoom)
			{
				leftRoom.doLeave();
				this.clientMan.self()?.fireLeaveRoom(leftRoom, roomID);
			}
		}

		u46(userID:string, status:Status):void
		{
			const account = this.accountMan.getAccount(userID);
			if (account)
			{
				account.fireChangePasswordResult(status);
			}
			this.accountMan.fireChangePasswordResult(userID, status);
		}

		u47(userID:string, status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.ACCOUNT_EXISTS:
				case Status.PERMISSION_DENIED:
					this.orbiter.getAccountManager().fireCreateAccountResult(userID, status);
					break;
				default:
					this.log.warn(`Unrecognized status code for u47. Account: [${userID}], status: [${status}].`);
			}
		}

		u48(userID:string, status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.ACCOUNT_NOT_FOUND:
				case Status.AUTHORIZATION_FAILED:
				case Status.PERMISSION_DENIED:
					this.orbiter.getAccountManager().fireRemoveAccountResult(userID, status);
					break;
				default:
					this.log.warn(`Unrecognized status code for u48. Account: [${userID}], status: [${status}].`);
			}
		}

		u49(userID:string, status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.ALREADY_LOGGED_IN:
				case Status.ACCOUNT_NOT_FOUND:
				case Status.AUTHORIZATION_FAILED:
				case Status.PERMISSION_DENIED:
					this.orbiter.getAccountManager().fireLoginResult(userID, status);
					break;
				default:
					this.log.warn(`Unrecognized status code for u49. Account: [${userID}], status: [${status}].`);
			}
		}

		u54(requestID:string, roomID:string, occupantCount:string, observerCount:string, roomAttributes:string, ...clientList:string[]):void
		{
			const roomManifest = new RoomManifest();
			roomManifest.deserialize(roomID, roomAttributes, clientList, parseInt(occupantCount), parseInt(observerCount));

			if (requestID == '')
			{
				// Synchronize
				let theRoom = this.roomMan.getRoom(roomID);

				if (!theRoom)
				{
					// If the server makes the current client join or observe a room, it will first
					// send a u54 before sending the u6 or u59 notice. In that case, the room might
					// be unknown briefly, so create a cached room then wait for u6 or u59.
					theRoom = this.roomMan.addCachedRoom(roomID);
				}

				theRoom?.synchronize(roomManifest);
			}
			else
			{
				// Snapshot
				this.snapshotMan.receiveRoomSnapshot(requestID, roomManifest);
			}
		}

		u59(roomID:string):void
		{
			const room = this.roomMan.addObservedRoom(roomID);
			if (room)
			{
				room.doObserve();
				this.clientMan.self()?.fireObserveRoom(room, roomID);
			}
		}

		u6(roomID:string):void
		{
			const room = this.roomMan.addOccupiedRoom(roomID);
			if (room)
			{
				room.doJoin();
				this.clientMan.self()?.fireJoinRoom(room, roomID);
			}
		}

		u60(requestID:string, roomID:string, status:Status):void
		{
			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.ROOM_NOT_FOUND:
				case Status.AUTHORIZATION_REQUIRED:
				case Status.AUTHORIZATION_FAILED:
				case Status.PERMISSION_DENIED:
					this.snapshotMan.receiveSnapshotResult(requestID, status);
					break;
				default:
					this.log.warn(`Unrecognized status code for u60. Request ID: [${requestID}], Room ID: [${roomID}], status: [${status}].`);
			}
		}

		u62(roomID:string):void
		{
			const theRoom = this.roomMan.getRoom(roomID);
			this.roomMan.removeObservedRoom(roomID);

			if (theRoom)
			{
				theRoom.doStopObserving();
				this.clientMan.self()?.fireStopObservingRoom(theRoom, roomID);
			}
		}

		u66(serverVersion:string, sessionID:string, serverUPCVersionString:string, protocolCompatible:string, affinityAddress:string, affinityDuration:string):void
		{
			this.log.info('[ORBITER] Server version: ' + serverVersion);
			this.log.info('[ORBITER] Server UPC version: ' + serverUPCVersionString);

			const serverUPCVersion = new VersionNumber();
			serverUPCVersion.fromVersionString(serverUPCVersionString);
			this.orbiter.getServer().setVersion(serverVersion);
			this.orbiter.getServer().setUPCVersion(serverUPCVersion);

			const inProgressConnection = this.orbiter.getConnectionManager().getInProgressConnection(),
			      inProgressConnectionHost = inProgressConnection?.getHost() ?? '';

			if (affinityAddress != '' && typeof affinityAddress !== 'undefined' && affinityAddress != inProgressConnectionHost)
			{
				this.orbiter.getConnectionManager().setAffinity(inProgressConnectionHost, affinityAddress, parseFloat(affinityDuration));
				inProgressConnection?.applyAffinity();
			}
		}

		u7(message:string, broadcastType:string, fromClientID:string, toRoomID:string, ...userDefinedArgs:string[]):void
		{
			const msgMan = this.orbiter.getMessageManager();

			let listenerError:Error|undefined,
			    fromClient:Client|null,
			    args:any[];

			// Retrieve the Room object for the recipient room. 
			const toRoom = this.roomMan.getRoom(toRoomID);

			// Retrieve the Client object for the sender
			if (fromClientID == '')
			{
				// No client ID was supplied, so the message was generated by the server, not by a
				// client, so set fromClient to null.
				fromClient = null;
			}
			else
			{
				// A valid ID was supplied, so find or create the matching IClient object
				fromClient = this.clientMan.getClient(fromClientID) ?? this.clientMan.requestClient(fromClientID);
			}

			// If the message was sent to a specific client, a list of specific clients, or to the
			// whole server, then args passed to registered message listeners  are: the Client
			// object plus all user-defined arguments originally passed to sendMessage().
			if (broadcastType != ReceiveMessageBroadcastType.TO_ROOMS)
			{
				args = ([fromClient] as any[]).concat(userDefinedArgs);
				try
				{
					msgMan.notifyMessageListeners(message, args);
				}
				catch (e)
				{
					listenerError = e;
				}
			}
			else
			{

				// ===== To Rooms =====
				// Check if the room is valid
				if (!toRoom)
				{
					this.log.warn(`Message (u7) received for unknown room: [${toRoomID}]Message: [${message}]`);
					return;
				}

				// RECEIVE_MESSAGE was a response to SEND_MESSAGE_TO_ROOMS, so  we notify listeners
				// only if they asked to be told about messages  sent to the recipient room.

				// First, get the list of messsage listeners for this message
				const listeners = msgMan.getMessageListeners(message),
				      toRoomSimpleID = RoomIDParser.getSimpleRoomID(toRoomID),
				      toRoomQualifier = RoomIDParser.getQualifier(toRoomID);

				// If the message can be dispatched, set to true.
				let listenerFound;
				// If the listener isn't interested in messages sent to the 
				// recipient room, set to true.
				let listenerIgnoredMessage;

				// ===== Run once for each message listener =====
				for (let i = 0; i < listeners.length; i++)
				{
					const messageListener = listeners[i];

					// Assume this listener ignored the message until we prove it didn't
					listenerIgnoredMessage = true;

					// --- Has no "forRoomIDs" filter ---
					// If the listener doesn't specify any forRoomIDs, then 
					// just send it the message notification. (No-rooms-specified
					// means the listener wants all of these messages, no matter
					// which room they were sent to.) This listener is told which 
					// room the message was sent to via args[1] (toRoomID).
					if (!messageListener.getForRoomIDs())
					{
						args = ([fromClient, toRoom] as any[]).concat(userDefinedArgs);
						try
						{
							messageListener.getListenerFunction().apply(messageListener.getThisArg(), args);
						}
						catch (e)
						{
							listenerError = e;
						}
						listenerFound = true;
						listenerIgnoredMessage = false;
						continue;  // Done with this listener. On to the next.
					}

					// --- Has a "forRoomIDs" filter ---
					// If the message was sent to any of the rooms the listener is  interested in,
					// then notify that listener. Note that a listener  for messages sent to room
					// foo.* means the listener wants  notifications for all rooms whose ids start
					// with foo.
					const listenerRoomIDs = messageListener.getForRoomIDs() ?? [];
					// ===== Run once for each room id =====
					for (let j = 0; j < listenerRoomIDs.length; j++)
					{
						const listenerRoomIDString = listenerRoomIDs[j],
							  listenerRoomQualifier = RoomIDParser.getQualifier(listenerRoomIDString),
						      listenerRoomSimpleID = RoomIDParser.getSimpleRoomID(listenerRoomIDString);

						// Check if the listener is interested in the recipient room...
						if (listenerRoomQualifier == toRoomQualifier &&
						    (listenerRoomSimpleID == toRoomSimpleID || listenerRoomSimpleID == '*'))
						{
							// Found a match. Notify the listener...

							// Prepare args.
							if (listenerRoomIDs.length == 1)
							{
								// The listener is interested in messages sent to a  specific room
								// only, so omit the "toRoom" arg. (The listener already knows the
								// target room because  it's only notified if the message was sent
								// to that room.)
								args = ([fromClient] as any[]).concat(userDefinedArgs);
							}
							else
							{
								// The listener is interested in messages sent to  multiple rooms.
								// In this case, we have to  include the "toRoom" arg so the
								// listener knows  which room received the message.
								args = ([fromClient, toRoom] as any[]).concat(userDefinedArgs);
							}

							try
							{
								messageListener.getListenerFunction().apply(messageListener.getThisArg(), args);
							}
							catch (e)
							{
								listenerError = e;
							}
							listenerFound = true;
							listenerIgnoredMessage = false;
							break; // Stop looking at this listener's room ids
						}
					} // Done looking at this listener's room ids
					if (listenerIgnoredMessage)
					{
						this.log.debug(`Message listener ignored message: ${message}. Listener registered to receive messages sent to: ${messageListener.getForRoomIDs()}, but message was sent to: ${toRoomID}`);
					}
				}
				if (!listenerFound)
				{
					this.log.warn(`No message listener handled incoming message: ${message}, sent to: ${toRoomID}`);
				}
			} // Done looking at listeners for the incoming message

			if (listenerError)
			{
				throw new Error(`A message listener for incoming message [${message}] received from client [${fromClient?.getClientID()}] encountered an error: ${listenerError.toString()} Ensure that all [${message}] listeners supply a first parameter whose datatype is Client (or a compatible type). Listeners that registered for the message via MessageManager's addMessageListener() with anything other than a single roomID for the toRoomIDs parameter must also define a second paramter whose datatype is Room (or a compatible type). Finally, ensure that the listener's declared message parameters match the following actual message arguments: ${userDefinedArgs}${typeof listenerError.stack === 'undefined' ? '' : '\n\nStack trace follows:\n' + listenerError.stack}`);
			}
		}

		u72(roomID:string, status:Status):void
		{
			const theRoom = this.roomMan.getRoom(roomID);
			switch (status)
			{
				case Status.ROOM_NOT_FOUND:
					if (this.roomMan.getRoom(roomID))
					{
						this.roomMan.disposeRoom(roomID);
					}

				case Status.ERROR:
				case Status.ROOM_FULL:
				case Status.AUTHORIZATION_REQUIRED:
				case Status.AUTHORIZATION_FAILED:
				case Status.SUCCESS:
				case Status.ALREADY_IN_ROOM:
				case Status.PERMISSION_DENIED:
					this.roomMan.fireJoinRoomResult(roomID, status);
					if (theRoom)
					{
						theRoom.doJoinResult(status);
					}
					break;

				default:
					this.log.warn(`Unrecognized status code for u72. Room ID: [${roomID}], status: [${status}].`);
			}
		}

		u73(attrScope:string, clientID:string, userID:string, attrName:string, attrOptions:string, status:Status):void
		{
			switch (status)
			{
				case Status.CLIENT_NOT_FOUND:
				case Status.ACCOUNT_NOT_FOUND:
					break;

				case Status.SUCCESS:
				case Status.ERROR:
				case Status.DUPLICATE_VALUE:
				case Status.IMMUTABLE:
				case Status.SERVER_ONLY:
				case Status.EVALUATION_FAILED:
				case Status.PERMISSION_DENIED:
					if (parseInt(attrOptions) & AttributeOptions.FLAG_PERSISTENT)
					{
						// Persistent attr
						const theAccount = this.accountMan.requestAccount(userID);
						theAccount?.getAttributeManager()?.fireSetAttributeResult(attrName, attrScope, status);
					}
					else
					{
						// Non-persistent attr
						const theClient = this.clientMan.requestClient(clientID);
						theClient.getAttributeManager().fireSetAttributeResult(attrName, attrScope, status);
					}
					break;

				default:
					this.log.warn('Unrecognized status received for u73: ' + status);
			}
		}

		u74(roomID:string, attrName:string, status:Status):void
		{
			const theRoom = this.roomMan.getRoom(roomID);

			// Quit if the room isn't found
			if (!theRoom)
			{
				this.log.warn(`Room attribute update received for room with no client-side Room object. Room ID [${roomID}]. Attribute: [${attrName}]. Status: [${status}].`);
				return;
			}

			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.IMMUTABLE:
				case Status.SERVER_ONLY:
				case Status.EVALUATION_FAILED:
				case Status.ROOM_NOT_FOUND:
				case Status.PERMISSION_DENIED:
					theRoom.getAttributeManager().fireSetAttributeResult(attrName, Tokens.GLOBAL_ATTR, status);
					break;

				default:
					this.log.warn(`Unrecognized status received for u74: ${status}`);
			}
		}

		u75(requestID:string, status:Status):void
		{
			this.snapshotMan.receiveSnapshotResult(requestID, status);
		}

		u76(roomID:string, status:Status):void
		{
			const leftRoom = this.roomMan.getRoom(roomID);

			switch (status)
			{
				case Status.ROOM_NOT_FOUND:
					if (leftRoom)
					{
						this.roomMan.disposeRoom(roomID);
					}

				case Status.SUCCESS:
				case Status.ERROR:
				case Status.NOT_IN_ROOM:
					this.roomMan.fireLeaveRoomResult(roomID, status);
					leftRoom?.doLeaveResult(status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u76. Room ID: [${roomID}]. Status: [${status}].`);
			}
		}

		u77(roomID:string, status:Status):void
		{
			const theRoom = this.roomMan.getRoom(roomID);
			switch (status)
			{
				case Status.ROOM_NOT_FOUND:
					if (theRoom)
					{
						this.roomMan.disposeRoom(roomID);
					}

				case Status.ERROR:
				case Status.AUTHORIZATION_REQUIRED:
				case Status.AUTHORIZATION_FAILED:
				case Status.SUCCESS:
				case Status.ALREADY_OBSERVING:
				case Status.PERMISSION_DENIED:
					this.roomMan.fireObserveRoomResult(roomID, status);
					theRoom?.doObserveResult(status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u77. Room ID: [${roomID}], status: ${status}.`);
			}
		}

		u78(roomID:string, status:Status):void
		{
			const theRoom = this.roomMan.getRoom(roomID);

			switch (status)
			{
				case Status.ROOM_NOT_FOUND:
					if (theRoom)
					{
						this.roomMan.disposeRoom(roomID);
					}

				case Status.SUCCESS:
				case Status.ERROR:
				case Status.NOT_OBSERVING:
					this.roomMan.fireStopObservingRoomResult(roomID, status);
					theRoom?.doStopObservingResult(status);
					break;

				default:
					this.log.warn(`Unrecognized status code for u78. Room ID: [${roomID}], status: ${status}.`);
			}
		}

		u79(roomID:string, byClientID:string, attrName:string):void
		{
			const theRoom = this.roomMan.getRoom(roomID);

			// Quit if the room isn't found
			if (!theRoom)
			{
				this.log.warn(`Room attribute removal notification received for room with no client-side Room object. Room ID [${roomID}]. Attribute: [${attrName}].`);
				return;
			}

			// If the clientID is "", the server removed the room, so there's no
			// corresponding client.
			const theClient = byClientID == '' ? null : this.clientMan.requestClient(byClientID);
			theRoom.getAttributeManager().removeAttributeLocal(attrName, Tokens.GLOBAL_ATTR, theClient??undefined);
		}

		u8(attrScope:string, clientID:string, userID:string, attrName:string, attrVal:string, attrOptions:string):void
		{
			const options = parseInt(attrOptions);

			if (options & AttributeOptions.FLAG_PERSISTENT)
			{
				const account = this.accountMan.getAccount(userID);
				if (account)
				{
					account.getAttributeManager()?.setAttributeLocal(attrName, attrVal, attrScope);
				}
				else
				{
					throw new Error(`[CORE_MESSAGE_LISTENER] Received an attribute update for  an unknown user account [${userID}].`);
				}
			}
			else
			{
				const client = this.clientMan.getInternalClient(clientID);
				if (client)
				{
					client.getAttributeManager().setAttributeLocal(attrName, attrVal, attrScope);
				}
				else
				{
					throw new Error(`[CORE_MESSAGE_LISTENER] Received an attribute update for  an unknown client [${clientID}].`);
				}
			}
		}

		u80(roomID:string, attrName:string, status:Status):void
		{
			const theRoom = this.roomMan.getRoom(roomID);
			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.IMMUTABLE:
				case Status.SERVER_ONLY:
				case Status.ROOM_NOT_FOUND:
				case Status.ATTR_NOT_FOUND:
				case Status.PERMISSION_DENIED:
					if (theRoom)
					{
						theRoom.getAttributeManager().fireDeleteAttributeResult(attrName, Tokens.GLOBAL_ATTR, status);
					}
					break;

				default:
					this.log.warn(`Unrecognized status received for u80: ${status}`);
			}
		}

		u81(attrScope:string, clientID:string, userID:string, attrName:string, attrOptions:string):void
		{
			if (parseInt(attrOptions) & AttributeOptions.FLAG_PERSISTENT)
			{
				// Persistent attr
				const account = this.accountMan.requestAccount(userID);
				account?.getAttributeManager()?.removeAttributeLocal(attrName, attrScope);
			}
			else
			{
				// Non-persistent attr
				const client = this.clientMan.requestClient(clientID);
				client.getAttributeManager().removeAttributeLocal(attrName, attrScope);
			}
		}

		u82(attrScope:string, clientID:string, userID:string, attrName:string, attrOptions:string, status:Status):void
		{
			switch (status)
			{
				case Status.CLIENT_NOT_FOUND:
				case Status.ACCOUNT_NOT_FOUND:
					break;
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.IMMUTABLE:
				case Status.SERVER_ONLY:
				case Status.ATTR_NOT_FOUND:
				case Status.EVALUATION_FAILED:
				case Status.PERMISSION_DENIED:
					if (parseInt(attrOptions) & AttributeOptions.FLAG_PERSISTENT)
					{
						// Persistent attr
						const account = this.accountMan.requestAccount(userID);
						account?.getAttributeManager()?.fireDeleteAttributeResult(attrName, attrScope, status);
					}
					else
					{
						// Non-persistent attr
						const client = this.clientMan.requestClient(clientID);
						client.getAttributeManager().fireDeleteAttributeResult(attrName, attrScope, status);
					}
					break;

				default:
					this.log.warn(`Unrecognized status received for u82: ${status}`);
			}
		}

		u84():void
		{
			this.orbiter.getConnectionManager().dispatchSessionTerminated();
		}

		u87(userID:string, status:Status):void
		{
			const account = this.accountMan.getAccount(userID);

			switch (status)
			{
				case Status.SUCCESS:
				case Status.ERROR:
				case Status.AUTHORIZATION_FAILED:
				case Status.ACCOUNT_NOT_FOUND:
				case Status.NOT_LOGGED_IN:
				case Status.PERMISSION_DENIED:
					account?.fireLogoffResult(status);
					this.accountMan.fireLogoffResult(userID, status);
					break;
				default:
					this.log.warn(`Unrecognized status received for u87: ${status}`);
			}
		}

		u88(clientID:string, userID:string, globalAttrs:string, ...roomAttrs:string[]):void
		{
			const account = this.accountMan.requestAccount(userID),
			      client = this.clientMan.requestClient(clientID),
			      clientManifest = new ClientManifest();

			clientManifest.deserialize(clientID, userID, undefined, undefined, globalAttrs, roomAttrs);
			// Update the account
			const scopes = clientManifest.persistentAttributes.getScopes(),
			      accountAttrs = account?.getAttributeManager()?.getAttributeCollection();

			for (let i = scopes.length; --i >= 0;)
			{
				accountAttrs?.synchronizeScope(scopes[i], clientManifest.persistentAttributes);
			}

			if (!client.getAccount())
			{
				// Client doesn't know about this account yet
				client.setAccount(account ?? undefined);
				client.fireLogin();
				account?.doLoginTasks();
				account && this.accountMan.fireLogin(account, clientID);
			}
			else
			{
				// Do nothing if the account is known. Logins are reported for  observe-account,
				// observe-client, and watch-for-clients, so a  client might receive multiple login
				// notifications.
			}
		}

		u89(clientID:string, userID:string):void
		{
			const client = this.clientMan.getInternalClient(clientID),
			      account = this.accountMan.getAccount(userID);

			if (account)
			{
				if (account.getConnectionState() == ConnectionState.LOGGED_IN)
				{
					if (client)
					{
						client.fireLogoff(userID);
					}
					account.doLogoffTasks();
					this.accountMan.fireLogoff(account, clientID);
				}
				else
				{
					// Do nothing if the account is unknown. Logoffs are reported for
					// observe-account, observe-client, and watch-for-clients, so a  client might
					// receive multiple logoff notifications.
				}
			}
			else
			{
				throw new Error(`LOGGED_OFF (u89) received for an unknown user: [${userID}].`);
			}
		}

		u9(roomID:string, byClientID:string, attrName:string, attrVal:string):void
		{
			const theRoom = this.roomMan.getRoom(roomID);
			let byClient;

			// Quit if the room isn't found
			if (!theRoom)
			{
				this.log.warn(`Room attribute update received for server-side room with no matching client-side Room object. Room ID [${roomID}]. Attribute: [${attrName}].`);
				return;
			}

			// Retrieve the Client object for the sender
			if (byClientID == '')
			{
				// No client ID was supplied, so the message was generated by the
				// server, not by a client, so set fromClient to null.
				byClient = null;
			}
			else
			{
				// A valid ID was supplied, so find or create the matching IClient object
				byClient = this.clientMan.getClient(byClientID) ?? this.clientMan.requestClient(byClientID);
			}

			theRoom.getAttributeManager().setAttributeLocal(attrName, attrVal, Tokens.GLOBAL_ATTR, byClient??undefined);
		}

		u90():void
		{
			const self = this.orbiter.self(),
			      selfAccount = self?.getAccount();

			selfAccount?.fireChangePassword();

			this.accountMan.fireChangePassword(selfAccount?.getUserID());
		}
	}
}

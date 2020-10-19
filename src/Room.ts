namespace net.user1.orbiter
{
	/**
	 * The Room class represents a Union room, which is a place for clients to engage in group
	 * communication. When a client sends a message to a room, all other clients that are
	 * conceptually "in" the room (known as the room's "occupants") receive the message. For
	 * example, an Orbiter client could send a message named "CHAT" to all occupants of a given room
	 *
	 * Clients can join more than one room at a time. For example, a single client can play a game
	 * in one room while chatting in another and reviewing employee salaries at a managers' meeting
	 * in yet another.
	 *
	 * Clients leave rooms via [[Room.leave]] method. (The [[RoomManager]] class does not define a
	 * separate leaveRoom() method because client applications can always retrieve a reference to a
	 * previously joined room, and, hence, can always use Room's leave() method.) When the current
	 * client joins a room, the room dispatches a RoomEvent.JOIN event. When the current client
	 * leaves a room, the room dispatches a RoomEvent.LEAVE event.
	 *
	 * By default, when the current client is in a room, and other clients join or leave that room,
	 * the room dispatches the RoomEvent.ADD_OCCUPANT and RoomEvent.REMOVE_OCCUPANT events.
	 *
	 * Clients that do not wish to be notified when other clients join or leave the room can opt-out
	 * of notifications using the [[Room.setUpdateLevels]] method.
	 *
	 * By default, a client does not receive messages sent to rooms it is not in. However, clients
	 * can spectate the activity of a room by asking to "observe" it via either
	 * [[RoomManager.observeRoom]] method or [[Room.observe]] method. A client observing a room is
	 * given all the same updates as the room's occupants, but does not appear in the room's
	 * occupant list. Observation is often used to create applications with spectation, such as
	 * people watching a game of chess or fans spectating a celebrity chat.
	 *
	 * Each specific Room instance in Orbiter is a reflection of an actual server-side Java Room
	 * object in Union Server. When a client joins or observes a room, Union server automatically
	 * sends that client a summary of the room's state, and subsequently pushes updates to the
	 * client when the room's state changes. The amount of information pushed to each client by
	 * Union Server is determined by the client's "room update levels" settings, which can be set
	 * via the [[Room.join]], [[observe]], and [[setUpdateLevels]] methods.
	 *
	 * A room can store information using room attributes, which are shareable, multiuser variables
	 * that are accessible to all occupants and observers of the room. To create a room attribute or
	 * assign a room attribute a new value, use the [[Room.setAttribute]] method. In the default
	 * case, when a shared room attribute's value changes, all clients are notified via the
	 * AttributeEvent.UPDATE event. However, clients that do not wish to be notified when a room
	 * attribute changes can opt-out of notifications using the [[Room.setUpdateLevels]] method.
	 *
	 * To create a new server-side room, use the [[RoomManager.createRoom]] method. To remove a
	 * server-side room use the [[RoomManager.removeRoom]] method. When a room is removed from
	 * the server, all clients are forced to leave the room. As a result, the
	 * RoomEvent.LEAVE event occurs.
	 *
	 * In Orbiter, rooms are represented by Room objects by default, but applications can specify
	 * custom Room subclasses for individual rooms, and implement application logic in those
	 * classes. For example, a Room subclass might represent a chat room that handles chat messages.
	 * Or a Room subclass might be a game room that implements custom gameplay. To assign the class
	 * for a specific room, use the [[RoomClassRegistry.setRoomClass]] method.
	 */
	export class Room extends net.user1.events.EventDispatcher
	{
		protected defaultClientClass?:any;
		protected disposed:boolean = false;
		private _clientIsInRoom:boolean = false;
		private _clientIsObservingRoom:boolean = false;
		private attributeManager:AttributeManager;
		private id?:string;
		private numObservers:number = 0;
		private numOccupants:number = 0;
		private observerList:ClientSet;
		private occupantList:ClientSet;
		private syncState?:string;

		constructor(id:string, private roomManager:RoomManager, private messageManager:MessageManager, private clientManager:ClientManager, private accountManager:AccountManager, private log?:net.user1.logger.Logger)
		{
			super();

			// Initialization
			this.setRoomID(id);

			this.occupantList = new ClientSet();
			this.observerList = new ClientSet();
			this.attributeManager = new AttributeManager(this, this.messageManager, this.log);

			this.setSyncState(SynchronizationState.NOT_SYNCHRONIZED);
		}

		/**
		 * Registers a listener to be notified when messages of the specified type
		 * are sent to the room. Room messages can be sent via [[Room.sendMessage]]
		 * method or RoomManager's sendMessage() method, or by a server-side module.
		 * Note, however, that message listeners for a given room will not be
		 * triggered on clients that have chosen to ignore messages for that room.
		 * See [[setUpdateLevels]].
		 *
		 * For a lower-level alternative to Room's addMessageListener() method, see
		 * [[MessageManager.addMessageListener]] method, which offers more listening
		 * options, but also has a more complex API.
		 *
		 * @param message A message name, such as "CHAT" or "PROJECTILE_FIRED". When
		 *                a message by this name is received, the specified listener
		 *                will be executed.
		 * @param listener The function to be executed when the specified message is
		 *                received. The listener's first parameter's datatype must be
		 *                IClient. Subsequent parameters receive the message's
		 *                arguments (sent via sendMessage()).
		 */
		addMessageListener(message:string, listener:Function, thisArg:any):void
		{
			this.messageManager.addMessageListener(message, listener, thisArg, [this.getRoomID()]);
		}

		addObserver(client:Client):void
		{
			// Don't add the client if it's already in the list.
			if (this.observerList.contains(client))
			{
				this.log?.info(`${this} ignored addObserver() request. Observer list already contains client:${client}.`);
				return;
			}

			// Add the client
			this.observerList.add(client);

			// Update the number of clients in the room
			this.setNumObservers(this.observerList.length());

			// Register for attribute change events
			if (!this.occupantList.contains(client))
			{
				this.addClientAttributeListeners(client);
			}

			// Tell listeners an observer was added
			this.fireAddObserver(client.getClientID());
		}

		/**
		 * @internal
		 */
		addOccupant(client:Client):void
		{
			// Don't add the client if it's already in the list.
			if (this.occupantList.contains(client))
			{
				this.log?.info(`${this} ignored addOccupant() request. Occupant list already contains client:${client}.`);
				return;
			}

			// Add the client
			this.occupantList.add(client);

			// Update the number of clients in the room
			this.setNumOccupants(this.occupantList.length());

			// Register for attribute change events
			if (!this.observerList.contains(client))
			{
				this.addClientAttributeListeners(client);
			}

			// Tell listeners an occupant was added
			this.fireAddOccupant(client.getClientID());
		}

		/**
		 * Returns true if the specified client is in this room, false otherwise.
		 *
		 * @param clientID The clientID to check. Use undefined for the current client
		 */
		clientIsInRoom(clientID?:string):boolean
		{
			if (this.disposed) return false;

			if (clientID == null)
			{
				return this._clientIsInRoom;
			}

			return this.occupantList.containsClientID(clientID);
		}

		/**
		 * Returns true if the specified client is observing this room, false otherwise.
		 *
		 * @param clientID The clientID to check.
		 */
		clientIsObservingRoom(clientID?:string):boolean
		{
			if (this.disposed) return false;

			if (clientID == null)
			{
				return this._clientIsObservingRoom;
			}
			return this.observerList.containsClientID(clientID);
		}

		/**
		 * Deletes the specified room attribute from the server.
		 *
		 * When a room attribute is deleted, the AttributeEvent.DELETE
		 * event is triggered on all clients in or observing the room with
		 * sufficiently verbose update levels (see UpdateLevels' sharedRoomAttributes
		 * and allRoomAttributes variables).
		 *
		 * If the room attribute could not be found on the server, no update is sent
		 * to any client. An attempt to delete a non-existent attribute triggers an
		 * AttributeEvent.DELETE_RESULT on the client that attempted to delete the
		 * attribute.
		 *
		 * @param attrName The name of the attribute to delete. Must not contain
		 *                 &amp;, ", ', &lt;, &gt;, or Tokens.RS.
		 */
		deleteAttribute(attrName:string):void
		{
			if (this.disposed) return;

			const deleteRequest = new upc.RemoveRoomAttr(this.getRoomID(), attrName);
			this.attributeManager.deleteAttribute(deleteRequest);
		}

		/**
		 * Permanently disables this object. The object cannot be reused. The
		 * dispose() method's purpose is to put this object into a state in which
		 * it can be garbage collected (for example, before a .swf file is unloaded).
		 *
		 * The Room class's dispose() method is invoked automatically when
		 * the [[Orbiter.dispose]] method is invoked.
		 */
		dispose():void
		{
			// @ts-ignore
			this.log = null;
			// @ts-ignore
			this.syncState = null;
			// @ts-ignore
			this.occupantList = null;
			// @ts-ignore
			this.observerList = null;
			// @ts-ignore
			this.attributeManager = null;
			this.numOccupants = 0;
			this.defaultClientClass = null;
			// @ts-ignore
			this.messageManager = null;
			// @ts-ignore
			this.roomManager = null;
			this.disposed = true;
		}

		/**
		 * @internal
		 */
		doJoin():void
		{
			this._clientIsInRoom = true;
			this.fireJoin();
		}

		/**
		 * @internal
		 */
		doJoinResult(status:Status):void
		{
			this.fireJoinResult(status);
		}

		/**
		 * @internal
		 */
		doLeave():void
		{
			// If the client is not observing the room, then dispose
			// of all of the room's information.
			if (!this.clientIsObservingRoom())
			{
				this.purgeRoomData();
			}

			// Note that the client is no longer in this room.
			this._clientIsInRoom = false;
			this.fireLeave();
		}

		/**
		 * @internal
		 */
		doLeaveResult(status:Status):void
		{
			this.fireLeaveResult(status);
		}

		/**
		 * @internal
		 */
		doObserve():void
		{
			this._clientIsObservingRoom = true;
			this.fireObserve();
		}

		/**
		 * @internal
		 */
		doObserveResult(status:Status):void
		{
			this.fireObserveResult(status);
		}

		/**
		 * @internal
		 */
		doStopObserving():void
		{
			// If the client is not in the room, then we dispose
			// of all of the room's information.
			if (!this.clientIsInRoom())
			{
				this.purgeRoomData();
			}

			this._clientIsObservingRoom = false;

			this.fireStopObserving();
		}

		/**
		 * @internal
		 */
		doStopObservingResult(status:Status):void
		{
			this.fireStopObservingResult(status);
		}

		/**
		 * Returns the current local value of the specified room attribute. The local
		 * value is the most recent value that exists on the client, but depending
		 * on network timing, a different value may actually exist on the server.
		 * The getAttribute() method returns null for any attribute
		 * that does not exist on the client and for any attribute that existed once
		 * but has since been deleted.
		 *
		 * @param attrName The name of the attribute whose value should be retrieved.
		 *                  Must not contain &amp;, ", ', &lt;, &gt;, or Tokens.RS.
		 *
		 * @return The string value of the attribute, or null if the
		 * attribute does not exist or has been deleted.
		 */
		getAttribute(attrName:string):string|null
		{
			if (this.disposed) return null;

			return this.attributeManager.getAttribute(attrName);
		}

		getAttributeManager():AttributeManager
		{
			return this.attributeManager;
		}

		/**
		 * Returns an object whose properties represent the names and values of the
		 * shared attributes for this room. The object is a copy of the current
		 * attributes; changes that occur after the call to getAttributes()
		 * are not reflected by the object.
		 */
		getAttributes():{[scope:string]:{[name:string]:string|undefined}}|{[name:string]:string|undefined}|null
		{
			if (this.disposed) return null;

			// Room attributes are considered global
			return this.attributeManager.getAttributesByScope(Tokens.GLOBAL_ATTR);
		}

		/**
		 * Returns the occupant or observer with the specified id. The returned client will be an
		 * instance of either the built-in Client class, or a custom client class. For information
		 * on custom client classes, see the [[Client.setClientClass]] method,
		 * [[Room.setDefaultClientClass]] method, and [[ClientManager.setDefaultClientClass]].
		 */
		getClient(id:string):Client|CustomClient|null
		{
			if (this.disposed) return null;

			const client = this.occupantList.getByClientID(id) ?? this.observerList.getByClientID(id);

			return client?.getCustomClient(this.getRoomID() ?? undefined) ?? client;
		}

		/**
		 * Returns the class used as the default class for clients in this room.
		 */
		getDefaultClientClass():any
		{
			return this.defaultClientClass;
		}

		/**
		 * Returns the number of clients known to be observing this room at the time
		 * of the call. If the current client's update levels for this room do not
		 * include either "observer list" or "observer count", then the observer
		 * count is unknown, and getNumObservers() returns 0.
		 */
		getNumObservers():number
		{
			if (this.disposed) return 0;

			const levels = this.clientManager.self()?.getUpdateLevels(this.getRoomID());
			if (levels)
			{
				if (levels.observerCount || levels.observerList)
				{
					return this.numObservers;
				}
				else
				{
					this.log?.warn(`${this} getNumObservers() called, but no observer count is available. To enable observer count, turn on observer list updates or observer count updates via the Room's setUpdateLevels() method.`);
					return 0;
				}
			}
			else
			{
				this.log?.warn(`${this} getNumObservers() called, but the current client's update  levels for the room are unknown.`);
				return 0;
			}
		}

		/**
		 * Returns the number of clients known to be in this room at the time
		 * of the call. If the current client's update levels for this room do not
		 * include either "occupant list" or "occupant count", then the occupant
		 * count is unknown, and getNumOccupants() returns 0.
		 */
		getNumOccupants():number
		{
			if (this.disposed) return 0;

			const levels = this.clientManager.self()?.getUpdateLevels(this.getRoomID());
			if (levels)
			{
				if (levels.occupantCount || levels.occupantList)
				{
					return this.numOccupants;
				}
				else
				{
					this.log?.warn(`${this} getNumOccupants() called, but no occupant count is available. To enable occupant count, turn on occupant list updates or occupant count updates via the Room's setUpdateLevels() method.`);
					return 0;
				}
			}
			else
			{
				this.log?.debug(`${this} getNumOccupants() called, but the current client's update levels for the room are unknown. To determine the room's occupant count, first join or observe the room.`);
				return 0;
			}
		}

		/**
		 * Returns the IDs of all clients currently observing the room, as an array. The array is a
		 * one-time copy of the list of clients observing the room, and is not synchronized with
		 * the actual observer list (which may change as clients continue to observe and stop
		 * observing the room).
		 */
		getObserverIDs():string[]
		{
			if (this.disposed) return [];

			return this.observerList.getAllIDs();
		}

		/**
		 * Returns an array of objects representing all clients currently
		 * observing the room. The array is a one-time snapshot of clients observing the room,
		 * and is not synchronized with the actual observer list (which may change
		 * as clients continue to observe and stop observing the room).
		 */
		getObservers():(Client|CustomClient)[]|null
		{
			if (this.disposed) return null;

			const observers = this.observerList.getAll(),
			      observersList:(Client|CustomClient)[] = [];

			for (const clientID in observers)
			{
				if (!observers.hasOwnProperty(clientID)) continue;

				const observer     = observers[clientID],
				      customClient = observer.getCustomClient(this.getRoomID());

				observersList.push(customClient ?? observer);
			}
			return observersList;
		}

		/**
		 * @internal
		 */
		getObserversInternal():UDictionary<Client>
		{
			return this.observerList.getAll();
		}

		/**
		 * Returns the IDs of all clients currently in the room, as an array. The array
		 * is a one-time copy of the list of clients in the room, and is not synchronized with
		 * the actual occupant list (which may change as clients continue to join and
		 * leave the room).
		 */
		getOccupantIDs():string[]
		{
			if (this.disposed) return [];

			return this.occupantList.getAllIDs();
		}

		/**
		 * Returns an array of objects representing all clients currently
		 * in the room. The array is a one-time snapshot of clients in the room,
		 * and is not synchronized with the actual occupant list (which may change
		 * as clients continue to join and leave the room).
		 */
		getOccupants():(Client|CustomClient)[]|null
		{
			if (this.disposed) return null;

			const occupants = this.occupantList.getAll(),
			      occupantsList:(Client|CustomClient)[] = [];

			for (const clientID in occupants)
			{
				if (!occupants.hasOwnProperty(clientID)) continue;

				const occupant     = occupants[clientID],
				      customClient = occupant.getCustomClient(this.getRoomID() ?? undefined);

				occupantsList.push(customClient ?? occupant);
			}
			return occupantsList;
		}

		/**
		 * @internal
		 */
		getOccupantsInternal():UDictionary<Client>
		{
			return this.occupantList.getAll();
		}

		/**
		 * Returns the qualifier part of this room's ID. For example, if the room's fully qualified
		 * is "examples.chat", this method returns "examples".
		 */
		getQualifier():string
		{
			return RoomIDParser.getQualifier(this.id ?? '');
		}

		/**
		 * Returns this room's fully qualified ID. For example, "examples.chat".
		 */
		getRoomID():string
		{
			return this.id ?? '';
		}

		/**
		 * Returns a [[RoomSettings]] object describing the settings for this room,
		 * including the maximum number of occupants and whether the room is
		 * automatically removed when the last occupant leaves. The returned object
		 * is a one-time snapshot, and is not updated after the call to
		 * getRoomSettings().
		 */
		getRoomSettings():RoomSettings|null
		{
			if (this.disposed) return null;

			const settings      = new RoomSettings(),
			      maxClients    = this.getAttribute(Tokens.MAX_CLIENTS_ATTR),
			      removeOnEmpty = this.getAttribute(Tokens.REMOVE_ON_EMPTY_ATTR);

			settings.maxClients = maxClients != null ? parseInt(maxClients) : undefined;

			switch (removeOnEmpty)
			{
				case null:
					settings.removeOnEmpty = undefined;
					break;
				case 'true':
					settings.removeOnEmpty = true;
					break;
				case 'false':
					settings.removeOnEmpty = false;
					break;
			}

			return settings;
		}

		/**
		 * Returns this room's simple ID. For example, if the room's fully qualified is
		 * "examples.chat", this method returns "chat".
		 */
		getSimpleRoomID():string
		{
			return RoomIDParser.getSimpleRoomID(this.id ?? '');
		}

		/**
		 * Returns a string indicating the current synchronization state
		 * of this room. For details, see the SynchronizationState class.
		 */
		getSyncState():string|null
		{
			return this.syncState ?? null;
		}

		/**
		 * Returns a Boolean indicating whether the specified listener function
		 * is currently registered to receive message notifications via this room
		 * for the specified message.
		 *
		 * @param message The string ID of a Union message.
		 * @param listener A function or method.
		 */
		hasMessageListener(message:string, listener:Function):boolean
		{
			// First, get the list of message listeners for this message
			const listeners = this.messageManager.getMessageListeners(message);
			for (let i = 0; i < listeners.length; i++)
			{
				const messageListener = listeners[i],
				      listenerRoomIDs = messageListener.getForRoomIDs();

				if (!listenerRoomIDs) continue;

				for (let j = 0; j < listenerRoomIDs.length; j++)
				{
					const listenerRoomID = listenerRoomIDs[i];
					if (listenerRoomID == this.getRoomID())
					{
						return true;
					}
				}
			}
			return false;
		}

		/**
		 * Asks the server to place the current client in the server-side room
		 * represented by this Room object. When result of the attempt is
		 * received, the room triggers a RoomEvent.JOIN_RESULT event. If the attempt
		 * succeeds, the room triggers a RoomEvent.JOIN event. Once the client
		 * joins the room it is kept synchronized with the server-side state of
		 * the room in accordance with the current client's update levels for the
		 * room (see the [[Room.setUpdateLevels]] method). Updates from the
		 * server trigger individual room events, such as RoomEvent.ADD_OCCUPANT and
		 * AttributeEvent.UPDATE.</p>
		 *
		 * @param password The optional string password used to enter the room.
		 *
		 * @param updateLevels Specifies the client's update levels for the room, which dictate the
		 *                     amount of information the client receives about the room while it is
		 *                     in or observing the room. See the [[UpdateLevels]] class for details.
		 */
		join(password?:string, updateLevels?:UpdateLevels):void
		{
			if (this.disposed) return;

			// Client can't join a room the its already in.
			if (this.clientIsInRoom())
			{
				this.log?.warn(`${this} Room join attempt aborted. Already in room.`);
				return;
			}
			// Validate the password
			if (password == null)
			{
				password = '';
			}
			if (!Validator.isValidPassword(password))
			{
				this.log?.error(`${this} Invalid room password supplied to join().  Join request not sent. See Validator.isValidPassword().`);
				return;
			}

			// If any update levels are specified, send them before joining.
			if (updateLevels != null)
			{
				this.setUpdateLevels(updateLevels);
			}

			this.messageManager.sendUPC(UPC.JOIN_ROOM, this.getRoomID(), password);
		}

		/**
		 * Asks the server to remove the current client from the server-side room
		 * represented by this Room object. When the result of the attempt is
		 * received, the room triggers a RoomEvent.LEAVE_RESULT event. If the
		 * request succeeds, the room triggers a RoomEvent.LEAVE event.
		 */
		leave():void
		{
			if (this.disposed) return;

			if (this.clientIsInRoom())
			{
				this.messageManager.sendUPC(UPC.LEAVE_ROOM, this.getRoomID());
			}
			else
			{
				this.log?.debug(`${this} Leave-room request ignored. Not in room.`);
			}
		}

		/**
		 * Sends an "observe room" request to the server; if successful, the current client begins
		 * spectating the room's activity, and will receiving updates about the room and its
		 * occupants. The observe() method is a pass-through to [[RoomManager.observeRoom]] method.
		 *
		 * @param password The room's password.
		 *
		 * @param updateLevels Specifies the client's update levels for the room, which dictate the
		 *                     amount of information the client receives about the room while it is
		 *                     in or observing the room. See the [[UpdateLevels]] class for details.
		 */
		observe(password?:string, updateLevels?:UpdateLevels):void
		{
			if (this.disposed) return;

			this.roomManager.observeRoom(this.getRoomID(), password, updateLevels);
		}

		/**
		 * Asks the server to remove this room. This method delegates its work to
		 * [[RoomManager.removeRoom]]. See that method for complete details.
		 */
		remove(password?:string):void
		{
			if (this.disposed) return;

			this.roomManager.removeRoom(this.getRoomID(), password);
		}

		/**
		 * Unregisters a message listener previously registered via addMessageListener().
		 */
		removeMessageListener(message:string, listener:Function):void
		{
			this.messageManager?.removeMessageListener(message, listener);
		}

		/**
		 * @internal
		 */
		removeObserver(clientID:string):void
		{
			const client      = this.observerList.removeByClientID(clientID),
			      clientFound = client != null;

			// Update the number of clients in the room
			this.setNumObservers(this.observerList.length());

			// Unregister for attribute change events
			if (!this.occupantList.contains(client))
			{
				this.removeClientAttributeListeners(client);
			}

			// Tell listeners an observer was removed
			const customClient = client.getCustomClient(this.getRoomID());
			this.fireRemoveObserver(customClient ?? client);

			if (!clientFound)
			{
				this.log?.debug(`${this} could not remove observer: ${clientID}. No such client in the room's observer list.`);
			}
		}

		/**
		 * @internal
		 */
		removeOccupant(clientID:string):void
		{
			const client      = this.occupantList.removeByClientID(clientID),
			      clientFound = client != null;

			// Update the number of clients in the room
			this.setNumOccupants(this.occupantList.length());

			// Unregister for attribute change events
			if (!this.observerList.contains(client))
			{
				this.removeClientAttributeListeners(client);
			}

			// Tell listeners an occupant was removed
			const customClient = client.getCustomClient(this.getRoomID());
			this.fireRemoveOccupant(customClient ?? client);

			if (!clientFound)
			{
				this.log?.debug(`${this} could not remove occupant: ${clientID}. No such client in the room's occupant list.`);
			}
		}

		/**
		 * Sends a message to clients in and observing this room. To send a message to clients in
		 * multiple rooms, use the RoomManager class's sendMessage() method. To send the message to
		 * all clients on the server, use the Server class's sendMessage() method.
		 *
		 * To receive the message, recipient clients normally register a message listener via the
		 * Room class's addMessageListener() method. However, the message can also be received by
		 * listeners registered via MessageManager's addMessageListener() method. Message listeners
		 * registered via someRoom.addMessageListener() are triggered when the specified message is
		 * sent to __someRoom__ only, which is normally the desired behaviour. Message listeners
		 * registered via MessageManager's addMessageListener() method are triggered when the
		 * specified message is sent to __any__ room. For a complete description of the difference
		 * between MessageManager's addMessageListener() method Room's addMessageListener(), see the
		 * entry for MessageManager's addMessageListener() method.
		 *
		 * Clients that prefer not to receive messages for a room can opt-out of messages via the
		 * Room class's setUpdateLevels() method.
		 *
		 * @param messageName The name of the message to send.
		 * @param includeSelf Indicates whether to send the message to the current client (i.e., the
		 *                    client that invoked sendMessage()). Defaults to false (don't echo to
		 *                    the sender).
		 * @param filters     Specifies one or more filters for the message. A filter specifies a
		 *                    requirement that each client must meet in order to receive the
		 *                    message. For example, a filter might indicate that only those clients
		 *                    with the attribute "team" set to "red" should receive the message. For
		 *                    complete details, see the Filter class. If filters is null, all
		 *                    interested clients in the room receive the message.
		 * @param ...rest     An optional comma-separated list of string arguments for the message.
		 *                    These will be passed to any listeners registered to receive the
		 *                    message. See Room's addMessageListener() method.
		 */
		sendMessage(messageName:string, includeSelf:boolean = false, filters?:filters.Filter, ...rest:string[]):void
		{
			if (this.disposed) return;

			this.roomManager.sendMessage(messageName, [this.getRoomID()], includeSelf, filters, ...rest);
		}

		/**
		 * Sends the specified message to this room's server-side modules.
		 *
		 * @param messageName      The name of the message to send.
		 * @param messageArguments The message arguments, specified as dynamic instance variables on
		 *                         a generic object.
		 */
		sendModuleMessage(messageName:string, messageArguments:{[key:string]:string}):void
		{
			if (this.disposed) return;

			const sendupcArgs = [];

			for (const arg in messageArguments)
			{
				if (messageArguments.hasOwnProperty(arg)) sendupcArgs.push(`${arg}|${messageArguments[arg]}`);
			}

			this.messageManager.sendUPC(UPC.SEND_ROOMMODULE_MESSAGE, this.getRoomID() ?? undefined, messageName, ...sendupcArgs);
		}

		/**
		 * Asks the server to set an attribute for this room. An attribute is a like a variable for
		 * the room with the added benefit that it can be automatically shared with all clients in
		 * the room. Room attributes are intended to store information about the room's environment,
		 * such as the highscore in a game room or the position of the furniture in a virtual house.
		 *
		 * If setAttribute() is called with `isShared` set to true, then by default the attribute
		 * value is automatically propagated to all clients in the room. Clients can respond to the
		 * changing of a shared room-attribute value via the AttributeEvent.UPDATE event. Clients
		 * that do not wish to receive the attribute update can use [[setUpdateLevels]] to opt out
		 * of the notification.
		 *
		 * When the current client sets a room attribute, it will not be able to access that
		 * attribute's new value until the AttributeEvent.UPDATE occurs.
		 *
		 * To delete a room attribute use deleteAttribute().
		 *
		 * Room attributes can be saved to a database on the server via Union's built-in attribute-
		 * persistence feature. To save a room attribute, set the isPersistent parameter of
		 * setAttribute() to true. By default, Union Server includes support for persistent room
		 * attributes via a light-weight built-in database called Apache Derby. Because Derby is
		 * built-in to Union Server, Union's persistent room-attribute feature can be used without
		 * any special configuration or additional installation. However, developers who prefer to
		 * use another database or arbitrary data source can customize or fully replace Union's
		 * built-in database. For information on customizing Union's persistence data source, see
		 * http://www.unionplatform.com/?page_id=837.
		 *
		 * Note that internally, a reserved character is used to separate attributes during
		 * transmission to and from the server. The reserved character is assigned to the Tokens.RS
		 * static variable, and defaults to the pipe character, "|". Application code must not use
		 * that character in the name or value of an attribute.
		 *
		 * @param attrName   The name of the attribute. Must not contain &amp;, ", ', &lt;, &gt;,
		 *                   or Tokens.RS.
		 *
		 * @param attrValue  The value of the attribute. Must be a string. Must not contain
		 *                   Tokens.RS.
		 *
		 * @param isShared   If true, all interested clients in the room on which this attribute is
		 *                   set are notified when the attribute changes. If false, the attribute
		 *                   value is stored on the server but clients in the room are not
		 *                   automatically notified of its existence nor of its value.
		 *
		 * @param isPersistent  If true, causes the attribute to be stored in a server-side
		 *                      database. Attributes stored in the database are known as "persistent
		 *                      attributes". Persistent attributes are saved even after the server
		 *                      shuts down. When the server restarts, if the room on which the
		 *                      persistent attribute was stored is created again, the persistent
		 *                      attribute is automatically loaded. If the persistent attribute is
		 *                      also shared, then clients that join the room are automatically
		 *                      informed of the attribute name and value.
		 *
		 * @param evaluate  If true, the server will evaluate the attrValue as a mathematical
		 *                  expression before assigning the attribute its new value. Within the
		 *                  expression, the token "%v" means "substitute the attribute's current
		 *                  value". For example, the following code adds one to an existing
		 *                  attribute "visits":
		 *                  `theRoom.setAttribute("visits", "%v+1", true, false, true);`.
		 *                  When evaluate is true, attrValue can contain the following
		 *                  characters only: the numbers 0-9, ., *, /, +, -, %, v.
		 */
		setAttribute(attrName:string, attrValue:string, isShared:boolean = true, isPersistent:boolean = false, evaluate:boolean = false):void
		{
			if (this.disposed) return;

			if (isShared !== false)
			{
				isShared = true;
			}

			// Create an integer to hold the attribute options.
			const attrOptions = (isShared ? AttributeOptions.FLAG_SHARED : 0) | (isPersistent ? AttributeOptions.FLAG_PERSISTENT : 0) | (evaluate ? AttributeOptions.FLAG_EVALUATE : 0);
			this.attributeManager.setAttribute(new upc.SetRoomAttr(attrName, attrValue, attrOptions, this.getRoomID()));
		}

		/**
		 * Assigns a class to use as the default class for clients in this room. By default, all
		 * clients are represented by instances of the Client class, which implements IClient.
		 * Orbiter applications can, however, choose to represent clients with a custom class. The
		 * custom client class can be specified on a per-client basis via the
		 * [[Client.setClientClass]] method. Or, the custom class can be specified on a per-room
		 * basis via the [[Room.setDefaultClientClass]] method. When a class has been specified via
		 * setDefaultClientClass() for a room, it is used as the client class for any client
		 * retrieved via the room's getClient() method, unless the client specifies a custom class
		 * via the Client class's setClientClass() method, which overrides Room's
		 * setDefaultClientClass().
		 *
		 * To set the custom class for a client globally, use the
		 * [[ClientManager.setDefaultClientClass]].
		 *
		 * @param defaultClass The default client class for this room. The class is normally a
		 *                     descendant of CustomClient, but can be any class that implements the
		 *                     IClient interface.
		 */
		setDefaultClientClass(defaultClass:any):void
		{
			this.defaultClientClass = defaultClass;
		}

		/**
		 * @internal
		 */
		setNumObservers(newNumObservers:number):void
		{
			const oldNumClients = this.numObservers;
			this.numObservers = newNumObservers;

			// Tell listeners that the number of clients in the room has changed.
			if (oldNumClients != newNumObservers)
			{
				this.fireObserverCount(newNumObservers);
			}
		}

		/**
		 * @internal
		 */
		setNumOccupants(newNumOccupants:number):void
		{
			const oldNumClients = this.numOccupants;
			this.numOccupants = newNumOccupants;

			// Tell listeners that the number of clients in the room has changed.
			if (oldNumClients != newNumOccupants)
			{
				this.fireOccupantCount(newNumOccupants);
			}
		}

		/**
		 * Assigns new settings for the room. For a list of available room settings, see the
		 * RoomSettings class. To change a room setting, the current client must have sufficient
		 * privileges. By default, a room's creator is authorized to change room settings. To allow
		 * other types of clients (such as moderators) to change room settings, define a
		 * remote-client security.
		 */
		setRoomSettings(settings:RoomSettings):void
		{
			if (this.disposed) return;

			if (settings.maxClients != null)
			{
				this.setAttribute(Tokens.MAX_CLIENTS_ATTR, settings.maxClients.toString());
			}

			if (settings.password != null)
			{
				this.setAttribute(Tokens.PASSWORD_ATTR, settings.password);
			}

			if (settings.removeOnEmpty != null)
			{
				this.setAttribute(Tokens.REMOVE_ON_EMPTY_ATTR, settings.removeOnEmpty.toString());
			}
		}

		/**
		 * Specifies the amount of information the current client will receive from
		 * the server about this room while in or observing this room. For details,
		 * see the [[UpdateLevels]] class.
		 */
		setUpdateLevels(updateLevels:UpdateLevels):void
		{
			this.messageManager?.sendUPC(UPC.SET_ROOM_UPDATE_LEVELS, this.getRoomID(), updateLevels.toInt());
		}

		/**
		 * Sends a "stop observing room" request to the server. If successful, the current client
		 * stops observing the room, and is no longer sent updates about the room's activity.
		 */
		stopObserving():void
		{
			if (this.disposed) return;

			if (this.clientIsObservingRoom())
			{
				this.messageManager.sendUPC(UPC.STOP_OBSERVING_ROOM, this.getRoomID());
			}
			else
			{
				this.log?.debug(`${this} Stop-observing-room request ignored. Not observing room.`);
			}
		}

		/**
		 * @internal
		 */
		synchronize(manifest:RoomManifest):void
		{
			const oldSyncState = this.getSyncState();
			this.log?.debug(`${this} Begin synchronization.`);
			this.setSyncState(SynchronizationState.SYNCHRONIZING);

			// SYNC ROOM ATTRIBUTES
			manifest.attributes && this.getAttributeManager().getAttributeCollection()?.synchronizeScope(Tokens.GLOBAL_ATTR, manifest.attributes);

			if (this.disposed) return;

			// SYNC OCCUPANT LIST
			const oldOccupantList = this.getOccupantIDs(),
			      newOccupantList = [];

			// Add all unknown occupants to the room's occupant list, and
			// synchronize all existing occupants.
			for (let i = manifest.occupants.length; --i >= 0;)
			{
				const thisOccupantClientID = manifest.occupants[i].clientID,
				      thisOccupantUserID   = manifest.occupants[i].userID,
				      thisOccupant         = thisOccupantClientID ? this.clientManager.requestClient(thisOccupantClientID) : undefined,
				      thisOccupantAccount  = thisOccupantUserID ? this.accountManager.requestAccount(thisOccupantUserID) : undefined;

				newOccupantList.push(thisOccupantClientID);

				if (!thisOccupant) continue;

				if (thisOccupantAccount)
				{
					thisOccupant.setAccount(thisOccupantAccount);
				}

				// If it's not the current client, update it.
				// The current client obtains its attributes through separate u8s.
				if (!thisOccupant.isSelf())
				{
					thisOccupant.synchronize(manifest.occupants[i]);
				}

				this.addOccupant(thisOccupant);
				if (this.disposed)
				{
					return;
				}
			}

			// Remove occupants that are now gone...
			if (oldOccupantList)
			{
				for (let i = oldOccupantList.length; --i >= 0;)
				{
					const oldClientID = oldOccupantList[i];
					if (newOccupantList.indexOf(oldClientID) == -1)
					{
						this.removeOccupant(oldClientID);
						if (this.disposed)
						{
							return;
						}
					}
				}
			}

			// SYNC OBSERVER LIST
			const oldObserverList = this.getObserverIDs(),
			      newObserverList = [];

			// Add all unknown observers to the room's observer list, and
			// synchronize all existing observers.
			for (let i = manifest.observers.length; --i >= 0;)
			{
				const thisObserverClientID = manifest.observers[i].clientID,
				      thisObserverUserID   = manifest.observers[i].userID,
				      thisObserver         = thisObserverClientID ? this.clientManager.requestClient(thisObserverClientID) : undefined,
				      thisObserverAccount  = thisObserverUserID ? this.accountManager.requestAccount(thisObserverUserID) : undefined;

				newObserverList.push(thisObserverClientID);

				if (!thisObserver) continue;

				if (thisObserverAccount)
				{
					thisObserver.setAccount(thisObserverAccount);
				}

				// If it's not the current client, update it.
				// The current client obtains its attributes through separate u8s.
				if (!thisObserver.isSelf())
				{
					thisObserver.synchronize(manifest.observers[i]);
				}

				this.addObserver(thisObserver);
				if (this.disposed)
				{
					return;
				}
			}

			// Remove observers that are now gone...
			if (oldObserverList)
			{
				for (let i = oldObserverList.length; --i >= 0;)
				{
					const oldClientID = oldObserverList[i];
					if (newObserverList.indexOf(oldClientID) == -1)
					{
						this.removeObserver(oldClientID);
						if (this.disposed)
						{
							return;
						}
					}
				}
			}

			// UPDATE CLIENT COUNTS
			//   If a client list is available, use its length to calculate the client count. That
			//   way, the list length and the "get count" method return values will be the same
			//   (e.g., getOccupants().length and getNumOccupants()). Otherwise, rely on the
			//   server's reported count.
			const levels = this.clientManager.self()?.getUpdateLevels(this.getRoomID());
			if (levels?.occupantList)
			{
				this.setNumOccupants(this.occupantList.length());
			}
			else if (levels?.occupantCount)
			{
				this.setNumOccupants(manifest.occupantCount);
			}

			if (levels?.observerList)
			{
				this.setNumObservers(this.observerList.length());
			}
			else if (levels?.observerCount)
			{
				this.setNumObservers(manifest.observerCount);
			}

			// Update sync state
			this.setSyncState(oldSyncState ?? undefined);

			// Tell listeners that synchronization is complete
			this.fireSynchronize(Status.SUCCESS);
		}

		toString():string
		{
			return `[ROOM id: ${this.getRoomID()}]`;
		}

		/**
		 * @internal
		 */
		updateSyncState():void
		{
			if (this.disposed)
			{
				this.setSyncState(SynchronizationState.NOT_SYNCHRONIZED);
			}
			else
			{
				if (this.roomManager.hasObservedRoom(this.getRoomID()) || this.roomManager.hasOccupiedRoom(this.getRoomID()) || this.roomManager.hasWatchedRoom(this.getRoomID()))
				{
					this.setSyncState(SynchronizationState.SYNCHRONIZED);
				}
				else
				{
					this.setSyncState(SynchronizationState.NOT_SYNCHRONIZED);
				}
			}
		}

		private addClientAttributeListeners(client:Client):void
		{
			client.addEventListener(AttributeEvent.UPDATE, this.updateClientAttributeListener, this);
			client.addEventListener(AttributeEvent.DELETE, this.deleteClientAttributeListener, this);
		}

		private deleteClientAttributeListener(e:RoomEvent):void
		{
			const attr         = e.getChangedAttr(),
			      client       = e.target as unknown as Client,
			      customClient = client.getCustomClient(this.getRoomID() ?? undefined);

			this.fireDeleteClientAttribute(customClient ?? client, attr?.scope, attr?.name, attr?.value);
		}

		private fireAddObserver(id:string):void
		{
			this.log?.info(`${this} Added observer: [${id}].`);

			const e = new RoomEvent(RoomEvent.ADD_OBSERVER, this.getClient(id) ?? undefined, id);
			this.dispatchEvent(e);
		}

		private fireAddOccupant(id:string):void
		{
			this.log?.info(`${this} Added occupant: [${id}].`);

			const e = new RoomEvent(RoomEvent.ADD_OCCUPANT, this.getClient(id) ?? undefined, id);
			this.dispatchEvent(e);
		}

		private fireDeleteClientAttribute(client:Client|CustomClient, scope?:string, attrName?:string, attrValue?:string):void
		{
			this.log?.info(`${this} Client attribute deleted from ${client}. Deleted attribute: [${attrName}].`);

			const deletedAttr = new Attribute(attrName, attrValue, undefined, scope);

			// Trigger event on listeners.
			const e = new RoomEvent(RoomEvent.DELETE_CLIENT_ATTRIBUTE, client, client.getClientID() ?? undefined, undefined, deletedAttr);
			this.dispatchEvent(e);
		}

		private fireJoin():void
		{
			this.log?.info(`${this} Room joined.`);

			const e = new RoomEvent(RoomEvent.JOIN);
			this.dispatchEvent(e);
		}

		private fireJoinResult(status:Status):void
		{
			if (this.log) this.log.info(`${this} Join result: ${status}`);

			const e = new RoomEvent(RoomEvent.JOIN_RESULT, undefined, undefined, status);
			this.dispatchEvent(e);
		}

		private fireLeave():void
		{
			if (this.log) this.log.info(`${this} Room left.`);

			const e = new RoomEvent(RoomEvent.LEAVE);
			this.dispatchEvent(e);
		}

		private fireLeaveResult(status:Status):void
		{
			if (this.log) this.log.info(`${this} Leave result: ${status}`);

			const e = new RoomEvent(RoomEvent.LEAVE_RESULT, undefined, undefined, status);
			this.dispatchEvent(e);
		}

		private fireObserve():void
		{
			this.log?.info(`${this} Room observed.`);

			// Trigger event on listeners.
			const e = new RoomEvent(RoomEvent.OBSERVE);
			this.dispatchEvent(e);
		}

		private fireObserveResult(status:Status):void
		{
			this.log?.info(`${this} Observe result: ${status}`);

			// Trigger event on listeners.
			const e = new RoomEvent(RoomEvent.OBSERVE_RESULT, undefined, undefined, status);
			this.dispatchEvent(e);
		}

		private fireObserverCount(newNumClients:number):void
		{
			this.log?.info(`${this} New observer count: ${newNumClients}`);

			// Trigger event on listeners.
			const e = new RoomEvent(RoomEvent.OBSERVER_COUNT, undefined, undefined, undefined, undefined, newNumClients);
			this.dispatchEvent(e);
		}

		private fireOccupantCount(newNumClients:number):void
		{
			this.log?.info(`${this} New occupant count: ${newNumClients}`);

			// Trigger event on listeners.
			const e = new RoomEvent(RoomEvent.OCCUPANT_COUNT, undefined, undefined, undefined, undefined, newNumClients);
			this.dispatchEvent(e);
		}

		private fireRemoveObserver(client:Client|CustomClient):void
		{
			this.log?.info(`${this} Removed observer: ${client}.`);

			const e = new RoomEvent(RoomEvent.REMOVE_OBSERVER, client, client.getClientID());
			this.dispatchEvent(e);
		}

		private fireRemoveOccupant(client:Client|CustomClient):void
		{
			this.log?.info(`${this} Removed occupant: ${client}.`);

			const e = new RoomEvent(RoomEvent.REMOVE_OCCUPANT, client, client.getClientID());
			this.dispatchEvent(e);
		}

		private fireRemoved():void
		{
			// Trigger event on listeners.
			const e = new RoomEvent(RoomEvent.REMOVED);
			this.dispatchEvent(e);
		}

		private fireStopObserving():void
		{
			this.log?.info(`${this} Observation stopped.`);

			// Trigger event on listeners.
			const e = new RoomEvent(RoomEvent.STOP_OBSERVING);
			this.dispatchEvent(e);
		}

		private fireStopObservingResult(status:Status):void
		{
			this.log?.info(`${this} Stop observing result:  ${status}`);

			// Trigger event on listeners.
			const e = new RoomEvent(RoomEvent.STOP_OBSERVING_RESULT, undefined, undefined, status);
			this.dispatchEvent(e);
		}

		private fireSynchronize(status:Status):void
		{
			this.log?.info(`${this} Synchronization complete.`);

			// Trigger event on listeners.
			const e = new RoomEvent(RoomEvent.SYNCHRONIZE, undefined, undefined, status);
			this.dispatchEvent(e);
		}

		private fireUpdateClientAttribute(client:Client|CustomClient, scope?:string, attrName?:string, attrVal?:string, oldVal?:string):void
		{
			this.log?.info(`${this} Client attribute updated on ${client}. Attribute [${attrName}] is now: [${attrVal}]. Old value was: [${oldVal}].`);

			const changedAttr = new Attribute(attrName, attrVal, oldVal, scope),
			      e           = new RoomEvent(RoomEvent.UPDATE_CLIENT_ATTRIBUTE, client, client.getClientID(), undefined, changedAttr);
			this.dispatchEvent(e);
		}

		private purgeRoomData():void
		{
			if (this.disposed) return;

			// Clear the client lists
			this.log?.debug(`${this} Clearing occupant list.`);
			for (const occupantID in this.occupantList.getAll())
			{
				this.removeClientAttributeListeners(this.occupantList.getByClientID(occupantID) ?? undefined);
			}
			this.occupantList.removeAll();

			this.log?.debug(`${this} Clearing observer list.`);
			for (const observerID in this.observerList.getAll())
			{
				this.removeClientAttributeListeners(this.observerList.getByClientID(observerID) ?? undefined);
			}
			this.observerList.removeAll();

			// Clear room attributes.
			this.log?.debug(`${this} Clearing room attributes.`);
			this.attributeManager.removeAll();
		}

		private removeClientAttributeListeners(client?:Client):void
		{
			client?.removeEventListener(AttributeEvent.UPDATE, this.updateClientAttributeListener, this);
			client?.removeEventListener(AttributeEvent.DELETE, this.deleteClientAttributeListener, this);
		}

		private setRoomID(roomID:string):void
		{
			if (!Validator.isValidResolvedRoomID(roomID))
			{
				const errorMsg = `Invalid room ID specified during room creation. Offending ID: ${roomID}`;
				this.log?.error(errorMsg);
				throw new Error(errorMsg);
			}
			this.id = roomID;
		}

		private setSyncState(newSyncState?:string):void
		{
			this.syncState = newSyncState;
		}

		private shutdown():void
		{
			if (this.disposed) return;

			// Store a temp reference to the log for use in this method after
			// the room has released all its resources.
			const theLog = this.log;

			theLog?.debug(`${this} Shutdown started.`);

			// Notify the room's listeners that the client left the room.
			if (this.clientIsInRoom())
			{
				theLog?.info(`${this} Current client is in the room. Forcing the client to leave...`);
				this.doLeave();
			}

			// Notify the room's listeners that the client stopped observing the room.
			if (this.clientIsObservingRoom())
			{
				theLog?.info(`${this} Current client is observing the room. Forcing the client to stop observing...`);
				this.doStopObserving();
			}

			theLog?.info(`${this} Dereferencing resources.`);

			// Dereference objects.
			this.purgeRoomData();

			this.attributeManager.dispose();
			// Fire removed before nulling the MessageManager object so that listeners have a
			// last chance to respond by communicating with the server (or by removing themselves
			// from the connection's listener list)
			this.fireRemoved();
			this.dispose();

			theLog?.info(this + ' Shutdown complete.');
		}

		private updateClientAttributeListener(e:AttributeEvent):void
		{
			const attr         = e.getChangedAttr(),
			      client       = e.target as unknown as Client,
			      customClient = client.getCustomClient(this.getRoomID());

			this.fireUpdateClientAttribute(customClient ?? client, attr.scope, attr.name, attr.value, attr.oldValue);
		}
	}
}

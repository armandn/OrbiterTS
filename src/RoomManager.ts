namespace net.user1.orbiter
{
	/**
	 * The RoomManager class provides access to Room objects, and utilities for creating,
	 * destroying, joining, and observing rooms on the server.
	 *
	 * To access the client-side representation of a room, use RoomManager's getRoom() method, which
	 * returns a Room object.
	 *
	 * The set of rooms accessible via getRoom() is limited by the current client's knowledge of the
	 * rooms on the server. The current client can gain knowledge of a room in the following ways:
	 * - By watching for rooms (see RoomManager's watchForRooms() method)
	 * - By joining rooms (see RoomManager's joinRoom() method)
	 * - By observing rooms (see RoomManager's observeRoom() method)
	 *
	 * To create a new server-side room, use the RoomManager class's createRoom() method. When
	 * createRoom() executes, the RoomManager first creates and returns a Room object, and then
	 * sends a message to the server requesting that the room be created server-side. The client
	 * application can immediately begin working with the Room object, for example, by invoking
	 * join() on it.
	 *
	 * The join request is sent to the server after the create-room request. If the create-room
	 * attempt is rejected, and the server does not actually create the room, the client is informed
	 * of the failure, and the RoomManager automatically removes its reference to the corresponding
	 * Room object. The join attempt also fails, triggering the RoomEvent.JOIN_RESULT event.
	 */
	export class RoomManager extends net.user1.events.EventDispatcher
	{
		protected cachedRooms:RoomList;
		protected log:net.user1.logger.Logger;
		protected observedRooms:RoomList;
		protected occupiedRooms:RoomList;
		protected roomClassRegistry:RoomClassRegistry;
		protected watchedQualifiers:string[] = [];
		protected watchedRooms:RoomList;

		constructor(private orbiter:Orbiter)
		{
			super();

			this.cachedRooms = new RoomList();
			this.occupiedRooms = new RoomList();
			this.observedRooms = new RoomList();
			this.watchedRooms = new RoomList();

			this.cachedRooms.addEventListener(CollectionEvent.REMOVE_ITEM,   this.removeRoomListener, this);
			this.occupiedRooms.addEventListener(CollectionEvent.ADD_ITEM,    this.addRoomListener,    this);
			this.occupiedRooms.addEventListener(CollectionEvent.REMOVE_ITEM, this.removeRoomListener, this);
			this.observedRooms.addEventListener(CollectionEvent.ADD_ITEM,    this.addRoomListener,    this);
			this.observedRooms.addEventListener(CollectionEvent.REMOVE_ITEM, this.removeRoomListener, this);
			this.watchedRooms.addEventListener(CollectionEvent.ADD_ITEM,     this.addRoomListener,    this);
			this.watchedRooms.addEventListener(CollectionEvent.REMOVE_ITEM,  this.removeRoomListener, this);

			this.orbiter = orbiter;

			this.addEventListener(RoomManagerEvent.WATCH_FOR_ROOMS_RESULT,         this.watchForRoomsResultListener,        this);
			this.addEventListener(RoomManagerEvent.STOP_WATCHING_FOR_ROOMS_RESULT, this.stopWatchingForRoomsResultListener, this);

			this.roomClassRegistry = new RoomClassRegistry();

			// Store a reference to the this.log.
			this.log = this.orbiter.getLog();
		}

		/**
		 * @internal
		 */
		addCachedRoom(roomID:string):Room|null
		{
			const cachedRoom = this.cachedRooms.getByRoomID(roomID);
			if (!cachedRoom)
			{
				this.log.debug(`[ROOM_MANAGER] Adding cached room: [${roomID}]`);

				const room = this.requestRoom(roomID);
				if (room)
					return this.cachedRooms.add(room);
				else
					return null;
			}
			else
			{
				return cachedRoom;
			}
		}

		/**
		 * @internal
		 */
		addObservedRoom(roomID:string):Room|null
		{
			this.log.debug(`[ROOM_MANAGER] Adding observed room: [${roomID}]`);

			const requestedRoom = this.requestRoom(roomID);
			if (requestedRoom)
			{
				const room = this.observedRooms.add(requestedRoom);
				room?.updateSyncState();
				return room;
			}
			else
				return null;
		}

		/**
		 * @internal
		 */
		addOccupiedRoom(roomID:string):Room|null
		{
			this.log.debug(`[ROOM_MANAGER] Adding occupied room: [${roomID}]`);

			const requestedRoom = this.requestRoom(roomID);

			if (requestedRoom)
			{
				const room = this.occupiedRooms.add(requestedRoom);
				room?.updateSyncState();
				return room;
			}
			else
				return null;
		}

		private addRoomListener(e:CollectionEvent):void
		{
			const room = e.getItem();

			// Only trigger added for first known reference
			if (this.getKnownReferenceCount(room.getRoomID()) == 1)
			{
				this.fireRoomAdded(room.getQualifier(), room.getRoomID(), room);
				this.fireRoomCount(this.getNumRooms());
			}
		}

		/**
		 * @internal
		 */
		addWatchedRoom(roomID:string):void
		{
			this.log.debug(`[ROOM_MANAGER] Adding watched room: [${roomID}]`);

			const requestedRoom = this.requestRoom(roomID);

			if (requestedRoom)
			{
				const room = this.watchedRooms.add(requestedRoom);
				room?.updateSyncState();
			}
		}

		/**
		 * @private
		 *
		 * Clears all resources. The object remains alive, and can be reused. To
		 * permanently deactivate this object, use dispose().
		 */
		cleanup():void
		{
			this.log.info('[ROOM_MANAGER] Cleaning resources.');
			this.removeAllRooms();
			this.watchedQualifiers = [];
		}

		/**
		 * Returns true if the client with the specified clientID is an occupant
		 * or observer of any of the room manager's currently known rooms.
		 */
		clientIsKnown(clientID:string):boolean
		{
			const clientSets = [],
			      rooms = this.getRooms();

			for (let i = rooms.length; --i >= 0;)
			{
				const room = rooms[i];
				clientSets.push(room.getOccupantsInternal());
				clientSets.push(room.getObserversInternal());
			}

			for (let i = clientSets.length; --i >= 0;)
			{
				if (clientSets[i][clientID] != null)
				{
					return true;
				}
			}
			return false;
		}

		/**
		 * The createRoom() method creates a new Room object on the client and attempts to create
		 * the matching room on the server. If `roomID` is specified, the new room is given the
		 * supplied identifier; otherwise, the server generates the room's identifier automatically.
		 * The result of the room-creation attempt is returned via a
		 * RoomManagerEvent.CREATE_ROOM_RESULT event.
		 *
		 * @param roomID The fully qualified id of the new room, as a string. For example,
		 *               "examples.chat". If roomID is not specified, the room id will be generated
		 *               automatically by the server and returned via
		 *               RoomManagerEvent.CREATE_ROOM_RESULT.
		 *
		 * @param roomSettings A RoomSettings object containing the initial settings for the new
		 *                     room. For details, see the RoomSettings class.
		 *
		 * @param attributes An array of JavaScript objects that describes the initial room
		 *                   attributes for the room in the following format:
		 *     ```
		 *     [
		 *       attribute: {
		 *         name:"attrName1",
		 *         value:"attrValue1",
		 *         shared:true,
		 *         persistent:false,
		 *         immutable:false
		 *       },
		 *       attribute: {
		 *         name:"attrName2",
		 *         value:"attrValue2",
		 *         shared:true,
		 *         persistent:false,
		 *         immutable:false
		 *       }
		 *     ]
		 *     ```
		 * @param modules A RoomModules object specifying the server-side modules for the room.
		 *                For details, see the RoomModules class.
		 *
		 * @return If the roomID parameter is not null, returns a Room object representing the room
		 *         the client wishes to create. If the roomID parameter is null, returns null
		 *         (in which case, the current client is expected to retrieve access to the room
		 *         after the dynamically generated roomID has been returned via
		 *         RoomManagerEvent.CREATE_ROOM_RESULT).
		 *
		 * Note that when two different clients sequentially invoke createRoom(), the first
		 * create-room request will succeed, triggering a RoomManagerEvent.CREATE_ROOM_RESULT event
		 * on the first client, with a status of Status.SUCCESS. The second create-room request will
		 * trigger a RoomManagerEvent.CREATE_ROOM_RESULT event on the second client, with a status
		 * of Status.ROOM_EXISTS. The architecture of "all clients attempt to create the room, but
		 * only the first succeeds" is common in Orbiter because it produces less traffic than the
		 * architecture of "check if the room exists first before asking to create it."
		 */
		createRoom(roomID:string, roomSettings:RoomSettings=new RoomModules(), attributes?:{[key:string]:string|boolean}[], modules:RoomModules=new RoomModules()):Room|null
		{
			// Abort if invalid module name found.
			const moduleIDs = modules.getIdentifiers();
			for (let i = moduleIDs.length; --i >= 0;)
			{
				const moduleID = moduleIDs[i];
				if (!Validator.isValidModuleName(moduleID))
				{
					throw new Error(`[ROOM_MANAGER] createRoom() failed. Illegal room module name: [${moduleID}]. See Validator.isValidModuleName().`);
				}
			}

			// If a roomID is specified, we must validated it
			if (roomID != null)
			{
				// Abort if the supplied id can't be resolved to a single room
				if (!Validator.isValidResolvedRoomID(roomID))
				{
					throw new Error(`[ROOM_MANAGER] createRoom() failed. Illegal room id: [${roomID}]. See Validator.isValidResolvedRoomID().`);
				}
			}

			// MAKE THE ROOM LOCALLY

			// Send "" as the roomID if no roomID is specified. When the server
			// receives a request to create a roomID of "", it auto-generates
			// the id, and returns it via RoomManagerEvent.CREATE_ROOM_RESULT.
			if (roomID == null)
			{
				// Don't make the local room. Instead wait for the server to
				// report the new room via u39.
				roomID = '';
			}
			else
			{
				// Make the local room.
				this.addCachedRoom(roomID);
			}

			// TELL THE SERVER TO MAKE THE ROOM

			let attrArg = '';

			// Create attributes
			if (attributes)
			{
				let attrSettings = 0;

				for (let i = 0; i < attributes.length; i++)
				{
					const attr = attributes[i];
					attrSettings = 0;
					attrSettings |= attr.shared ? AttributeOptions.FLAG_SHARED : 0;
					attrSettings |= attr.persistent ? AttributeOptions.FLAG_PERSISTENT : 0;
					attrSettings |= attr.immutable ? AttributeOptions.FLAG_IMMUTABLE : 0;
					attrArg += attr.NAME + Tokens.RS + attr.VALUE + Tokens.RS + attrSettings.toString();

					if (i < attributes.length - 1)
					{
						attrArg += Tokens.RS;
					}
				}
			}

			// Send the create room request to the server.
			const msgMan = this.orbiter.getMessageManager();
			msgMan.sendUPC(UPC.CREATE_ROOM, roomID, roomSettings.serialize(), attrArg, modules.serialize());

			// RETURN A REFERENCE TO THE LOCAL ROOM, IF ONE WAS CREATED
			if (roomID == '')
			{
				return null;
			}
			else
			{
				return this.getRoom(roomID);
			}
		}

		/**
		 * @internal
		 */
		dispose():void
		{
			this.log.info('[ROOM_MANAGER] Disposing resources.');
			// @ts-ignore
			this.watchedQualifiers = null;
			const rooms = this.getAllRooms();
			for (let i = this.getAllRooms().length; --i >= 0;)
			{
				const room = rooms[i];
				room.dispose();
			}
			this.cachedRooms.removeEventListener(CollectionEvent.REMOVE_ITEM,   this.removeRoomListener, this);
			this.occupiedRooms.removeEventListener(CollectionEvent.ADD_ITEM,    this.addRoomListener,    this);
			this.occupiedRooms.removeEventListener(CollectionEvent.REMOVE_ITEM, this.removeRoomListener, this);
			this.observedRooms.removeEventListener(CollectionEvent.ADD_ITEM,    this.addRoomListener,    this);
			this.observedRooms.removeEventListener(CollectionEvent.REMOVE_ITEM, this.removeRoomListener, this);
			this.watchedRooms.removeEventListener(CollectionEvent.ADD_ITEM,     this.addRoomListener,    this);
			this.watchedRooms.removeEventListener(CollectionEvent.REMOVE_ITEM,  this.removeRoomListener, this);

			// @ts-ignore
			this.occupiedRooms = null;
			// @ts-ignore
			this.observedRooms = null;
			// @ts-ignore
			this.watchedRooms = null;
			// @ts-ignore
			this.cachedRooms = null;
			// @ts-ignore
			this.log = null;
			// @ts-ignore
			this.orbiter = null;
			// @ts-ignore
			this.roomClassRegistry = null;
		}

		/**
		 * Forcibly removes all rooms from this RoomManager's room cache. Rooms are
		 * potentially added to the room cache in the following situations:
		 * - the current client invokes [[RoomManager.joinRoom]] method
		 * - the current client invokes [[RoomManager.observeRoom]] method
		 * - the current client invokes [[RoomManager.createRoom]] method
		 *
		 * In each of the preceding cases, if the RoomManager does not already have
		 * a reference to a Room object with the specified roomID, the RoomManager
		 * optimistically creates a Room object in anticipation of the room's likely
		 * future existence.
		 *
		 * If the RoomManager does not already have a reference to a room with the
		 * room id "examples.chat", it makes a Room object for that id, adds it
		 * to the room cache, then sends a "join room" request to Union Server.
		 * If the room exists on the server, and the server reports that the client
		 * successfully joined the room, then the RoomManager adds the Room object
		 * to its list of "occupied rooms". If the client leaves the room, the
		 * RoomManager removes the Room object from its list of occupied rooms, but
		 * does _not_ remove the room from the room cache. Instead, the Room
		 * object remains in the cache in anticipation of the possibility that the
		 * client might join the room again in the future. If the current client ever
		 * learns that the room has been removed from the server, the RoomManager
		 * removes the room from its room cache. Otherwise, the Room object is never
		 * removed from the cache, and application code is responsible for manually
		 * purging the cache by invoking disposeCachedRooms(). When a Room object is
		 * removed from the room cache, if the RoomManager has no other references
		 * to that object, then the Room object's data is disposed before the Room
		 * object is removed from the cache, and the Room object can no longer be used
		 * to communicate with Union Server.
		 */
		disposeCachedRooms():void
		{
			const rooms = this.cachedRooms.getAll();
			for (let i = 0; i <= rooms.length; i++)
			{
				const room = rooms[i];
				this.removeCachedRoom(room.getRoomID());
			}
		}

		/**
		 * @internal
		 */
		disposeRoom(roomID:string):void
		{
			const room = this.getRoom(roomID);
			if (room)
			{
				this.log.debug(`[ROOM_MANAGER] Disposing room: ${room}`);
				this.removeCachedRoom(roomID);
				this.removeWatchedRoom(roomID);
				this.removeOccupiedRoom(roomID);
				this.removeObservedRoom(roomID);
			}
			else
			{
				this.log.debug(`[ROOM_MANAGER] disposeRoom() called for unknown room: [${roomID}]`);
			}
		}

		/**
		 * @internal
		 */
		fireCreateRoomResult(roomIDQualifier:string, roomID:string, status:Status):void
		{
			const e = new RoomManagerEvent(RoomManagerEvent.CREATE_ROOM_RESULT, roomID, status, roomIDQualifier);
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 */
		fireJoinRoomResult(roomID:string, status:Status):void
		{
			this.dispatchEvent(new RoomEvent(RoomEvent.JOIN_RESULT, undefined, undefined, status, undefined, 0, roomID));
		}

		/**
		 * @internal
		 */
		fireLeaveRoomResult(roomID:string, status:Status):void
		{
			this.dispatchEvent(new RoomEvent(RoomEvent.LEAVE_RESULT, undefined, undefined, status, undefined, 0, roomID));
		}

		/**
		 * @internal
		 */
		fireObserveRoomResult(roomID:string, status:Status):void
		{
			this.dispatchEvent(new RoomEvent(RoomEvent.OBSERVE_RESULT, undefined, undefined, status, undefined, 0, roomID));
		}

		/**
		 * @internal
		 */
		fireRemoveRoomResult(roomIDQualifier:string, roomID:string, status:Status):void
		{
			const e = new RoomManagerEvent(RoomManagerEvent.REMOVE_ROOM_RESULT, roomID, status, roomIDQualifier);
			this.dispatchEvent(e);
		}

		private fireRoomAdded(roomIDQualifier:string, roomID:string, theRoom:Room):void
		{
			const e = new RoomManagerEvent(RoomManagerEvent.ROOM_ADDED, roomID, undefined, roomIDQualifier, theRoom);
			this.dispatchEvent(e);
		}

		private fireRoomCount(numRooms:number):void
		{
			this.dispatchEvent(new RoomManagerEvent(RoomManagerEvent.ROOM_COUNT, undefined, undefined, undefined, undefined, numRooms));
		}

		private fireRoomRemoved(roomIDQualifier:string, roomID:string, theRoom:Room):void
		{
			const e = new RoomManagerEvent(RoomManagerEvent.ROOM_REMOVED, roomID, undefined, roomIDQualifier, theRoom);
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 */
		fireStopObservingRoomResult(roomID:string, status:Status):void
		{
			this.dispatchEvent(new RoomEvent(RoomEvent.STOP_OBSERVING_RESULT, undefined, undefined, status, undefined, 0, roomID));
		}

		/**
		 * @internal
		 */
		fireStopWatchingForRoomsResult(roomIDQualifier:string, status:Status)
		{
			const e = new RoomManagerEvent(RoomManagerEvent.STOP_WATCHING_FOR_ROOMS_RESULT, undefined, status, roomIDQualifier);
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 */
		fireWatchForRoomsResult(roomIDQualifier:string, status:Status):void
		{
			const e = new RoomManagerEvent(RoomManagerEvent.WATCH_FOR_ROOMS_RESULT, undefined, status, roomIDQualifier);
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 */
		getAllClients():{[key:string]:Client}
		{
			const clientSets = [],
			      rooms = this.getRooms();

			let obj:{[key:string]:Client} = {};

			for (let i = rooms.length; --i >= 0;)
			{
				const room = rooms[i];
				obj = {...obj, ...room.getOccupantsInternal(), ...room.getObserversInternal()};
			}

			return obj;
		}

		/**
		 * @internal
		 */
		getAllRooms():Room[]
		{
			return [
				...this.occupiedRooms.getAll(),
				...this.observedRooms.getAll(),
				...this.watchedRooms.getAll(),
				...this.cachedRooms.getAll()
			];
		}

		/**
		 * @internal
		 */
		private getKnownReferenceCount(roomID:string):number
		{
			let count = 0;
			count += this.hasObservedRoom(roomID) ? 1 : 0;
			count += this.hasOccupiedRoom(roomID) ? 1 : 0;
			count += this.hasWatchedRoom(roomID) ? 1 : 0;
			return count;
		}

		/**
		 * Returns the number of rooms with the specified qualifier currently known to the
		 * RoomManager. Rooms that exist on the server but are unknown to the client-side room
		 * manager are not reflected in the value returned by getNumRooms(). To synchronize
		 * the RoomManager with the server's room list, use [[watchForRooms]] (which automatically
		 * keeps the RoomManager synchronized with the server's room list).
		 *
		 * @param qualifier Specifies the qualifier for which a room count should be returned. For
		 *                  example, getNumRooms("example") returns the number of rooms with
		 *                  roomIDs qualified by "example". If qualifier is omitted, getNumRooms()
		 *                  returns the total number of rooms known to the RoomManager.
		 * @return An integer specifying the number of rooms with the specified qualifier known.
		 */
		getNumRooms(qualifier?:string):number
		{
			return this.getRoomsWithQualifier(qualifier).length;
		}

		/**
		 * Returns a reference to the Room instance specified by roomID. If no such Room instance
		 * exists, returns null.
		 *
		 * @param roomID The fully qualified identifier of the Room object to retrieve.
		 */
		getRoom(roomID:string):Room|null
		{
			const rooms = this.getAllRooms();
			for (let i = rooms.length; --i >= 0;)
			{
				const room = rooms[i];
				if (room.getRoomID() == roomID)
				{
					return room;
				}
			}
			return null;
		}

		/**
		 * Returns the RoomManager's RoomClassRegistry object, which catalogs all client-side room
		 * classes.
		 */
		getRoomClassRegistry():RoomClassRegistry
		{
			return this.roomClassRegistry;
		}

		/**
		 * Returns an array of roomIDs for the Room objects known to this RoomManager. The array is
		 * a one-time copy of the roomIDs in the RoomManager's known room list, and is not updated
		 * after the call to getRoomIDs().
		 *
		 * To retrieve an array of Room instances instead of room IDs, use
		 * [[RoomManager.getRooms]] method.
		 *
		 * @return An array of string room ids.
		 */
		getRoomIDs():string[]
		{
			return this.getRooms().map(r=>r.getRoomID());
		}

		/**
		 * Returns an array of the Room objects known to this RoomManager.
		 * The list includes rooms the RoomManager has confirmed as existing only,
		 * and does not include any rooms the RoomManager has speculatively created
		 * in anticipation of incomplete operations such as a joinRoom() call.
		 * The array is a one-time copy of the RoomManager's known room list, and is not
		 * updated after the call to getRooms().
		 */
		getRooms():Room[]
		{
			return [
				...this.occupiedRooms.getAll(),
				...this.observedRooms.getAll(),
				...this.watchedRooms.getAll()
			];
		}

		/**
		 * Returns an array of Room objects with the specified room qualifier. The array is a
		 * one-time snapshot, and is not updated. If no qualifier is specified, returns all rooms
		 * (identical to [[getRooms]]).
		 *
		 * @return An array containing Room instances (or instances of subclasses of Room.
		 */
		getRoomsWithQualifier(qualifier?:string):Room[]
		{
			if (qualifier == undefined)
				return this.getRooms();

			const roomlist = [];
			for (const room of this.getRooms())
			{
				if (RoomIDParser.getQualifier(room.getRoomID()) == qualifier)
				{
					roomlist.push(room);
				}
			}

			return roomlist;
		}

		/**
		 * Returns true if the RoomManager has a Room object for the specified
		 * roomID in its list of cached rooms; otherwise, returns false.
		 * See [[watchForRooms]].
		 *
		 * @param roomID A fully qualified room id, such as "examples.chat".
		 */
		hasCachedRoom(roomID:string):boolean
		{
			return this.cachedRooms.containsRoomID(roomID);
		}

		/**
		 * Returns true if the current client is known to be observing the specified room;
		 * otherwise, returns false. See [[observeRoom]].
		 *
		 * @param roomID A fully qualified room id, such as "examples.chat".
		 */
		hasObservedRoom(roomID:string):boolean
		{
			return this.observedRooms.containsRoomID(roomID);
		}

		/**
		 * Returns true if the current client is known to be in the specified room;
		 * otherwise, returns false. See [[joinRoom]].
		 *
		 * @param roomID A fully qualified room id, such as "examples.chat".
		 */
		hasOccupiedRoom(roomID:string):boolean
		{
			return this.occupiedRooms.containsRoomID(roomID);
		}

		/**
		 * Returns true if the RoomManager has a Room object for the specified
		 * roomID in its watched rooms list; otherwise, returns false.
		 * See [[watchForRooms]].
		 *
		 * @param roomID A fully qualified room id, such as "examples.chat".
		 */
		hasWatchedRoom(roomID:string):boolean
		{
			return this.watchedRooms.containsRoomID(roomID);
		}

		/**
		 * Indicates whether the current client is currently watching the specified qualifier.
		 */
		isWatchingQualifier(qualifier:string):boolean
		{
			return this.watchedQualifiers.indexOf(qualifier) != -1;
		}

		/**
		 * Asks the server to place the current client in the server-side room. If
		 * the room is not already represented by a client-side room object, one is
		 * created and returned. When the result of the attempt is received,
		 * a RoomEvent.JOIN_RESULT event is dispatched via both the
		 * RoomManager and the joined Room. If the request attempt succeeds,
		 * a RoomEvent.JOIN event is also dispatched via the Room.
		 * The Room object will subsequently be kept updated in accordance with the
		 * current client's specified update levels (see the [[UpdateLevels]] class).
		 *
		 * RoomManager's joinRoom() method is functionally identical to [[Room.join]],
		 * method, except that it can be used without the prior existence of a
		 * Room object.
		 *
		 * @param roomID       The fully qualified room ID of the room to join.
		 * @param password     The optional string password used to enter the room.
		 * @param updateLevels Specifies the client's update levels for the room,  which dictate the
		 *                     amount of information the client receives about the room while it is
		 *                     in or observing the room. See the [[UpdateLevels]] class for details.
		 *
		 * @return The room being joined.
		 */
		joinRoom(roomID:string, password:string, updateLevels:UpdateLevels):Room|null
		{
			if (!this.orbiter.isReady())
			{
				this.log.warn(`[ROOM_MANAGER] Connection not open. Request to join room [${roomID}] could not be sent.`);
				return null;
			}

			// If the room ID is not valid, quit
			if (!Validator.isValidResolvedRoomID(roomID))
			{
				this.log.error(`[ROOM_MANAGER] Invalid room id supplied to joinRoom(): [${roomID}]. Join request not sent. See Validator.isValidResolvedRoomID().`);
				return null;
			}

			// Try to get a reference to the room
			let theRoom = this.getRoom(roomID);

			// If the room exists
			if (theRoom)
			{
				// Can't join a room you're already in.
				if (theRoom.clientIsInRoom())
				{
					this.log.warn('[ROOM_MANAGER] Room join attempt aborted. Already in room: [' +
					              theRoom.getRoomID() + '].');
					return theRoom;
				}
			}
			else
			{
				// Make the local room.
				theRoom = this.addCachedRoom(roomID);
			}

			// Validate the password
			if (password == null)
			{
				password = '';
			}

			if (!Validator.isValidPassword(password))
			{
				this.log.error(`[ROOM_MANAGER] Invalid room password supplied to joinRoom(): [${roomID}]. Join request not sent. See Validator.isValidPassword().`);
				return theRoom;
			}

			// If any update levels are specified, send them before joining.
			if (updateLevels != null)
			{
				theRoom?.setUpdateLevels(updateLevels);
			}

			const msgMan = this.orbiter.getMessageManager();
			msgMan.sendUPC(UPC.JOIN_ROOM, roomID, password);
			return theRoom;
		}

		/**
		 * The observeRoom() method provides a means for a client to spectate a
		 * room's state and activity without actually being in that room. For example,
		 * a chat moderator client might observe a chat room to spectate the chat
		 * without actually participating in it.
		 *
		 * When observeRoom() is invoked, the client sends a request to begin observing
		 * the specified room. If the request is successful, the corresponding
		 * client-side Room object will be synchronized with the server, and will
		 * subsequently be kept updated in accordance with its specified update levels
		 * (see the [[UpdateLevels]] class).
		 *
		 * When an observation request for a room completes, the
		 * RoomEvent.OBSERVE_RESULT event is dispatched via the RoomManager and the
		 * observed Room. If the request succeeds, RoomEvent.OBSERVE is also dispatched
		 * via the Room.
		 *
		 * A client can observe a room, and then join and leave it arbitrarily
		 * without affecting observation status.
		 *
		 * RoomManager's observeRoom() method is functionally identical to [[Room.observe]],
		 * method, except that it can be used without the prior existence of a
		 * Room object.
		 *
		 * @param roomID       The fully qualified room ID of the room to observe.
		 * @param password     The optional string password used to observe the room.
		 * @param updateLevels Specifies the client's update levels for the room, which dictate the
		 *                     amount of information the client receives about the room while it is
		 *                     in or observing the room. See the [[UpdateLevels]] class for details.
		 *
		 * @return A reference to the room being observed, or null if the observation
		 *         request could not be sent.
		 */
		observeRoom(roomID:string, password?:string, updateLevels?:UpdateLevels):Room|null
		{
			let theRoom;

			// If the room is not valid, quit
			if (!Validator.isValidResolvedRoomID(roomID))
			{
				throw new Error(`Invalid room id supplied to observeRoom(): [${roomID}]. Request not sent. See Validator.isValidResolvedRoomID().`);
			}

			// Try to get a reference to the room
			theRoom = this.getRoom(roomID);

			// If the room exists
			if (theRoom)
			{
				if (theRoom.clientIsObservingRoom())
				{
					this.log.warn(`[ROOM_MANAGER] Room observe attempt ignored. Already observing room: '${roomID}'.`);
					return null;
				}
			}
			else
			{
				// Make the local room
				theRoom = this.addCachedRoom(roomID);
			}

			// Validate the password
			if (password == null)
			{
				password = '';
			}

			if (!Validator.isValidPassword(password))
			{
				throw new Error(`Invalid room password supplied to observeRoom().  Room ID: [${roomID}], password: [${password}]. See Validator.isValidPassword().`);
			}

			// If update levels were specified for this room, send them now.
			if (updateLevels != null)
			{
				theRoom?.setUpdateLevels(updateLevels);
			}

			// Send the UPC only if at least one valid room was found
			const msgMan = this.orbiter.getMessageManager();
			msgMan.sendUPC(UPC.OBSERVE_ROOM, roomID, password);

			return theRoom;
		}

		private removeAllRooms():void
		{
			this.log.debug('[ROOM_MANAGER] Removing all local room object references.');
			this.cachedRooms.removeAll();
			this.watchedRooms.removeAll();
			this.occupiedRooms.removeAll();
			this.observedRooms.removeAll();
		}

		/**
		 * @internal
		 */
		removeAllWatchedRooms():void
		{
			for (const room of this.watchedRooms.getAll())
			{
				this.removeWatchedRoom(room.getRoomID());
				room.updateSyncState();
			}
		}

		private removeCachedRoom(roomID:string):void
		{
			if (this.cachedRooms.containsRoomID(roomID))
			{
				this.cachedRooms.removeByRoomID(roomID);
			}
			else
			{
				throw new Error(`[ROOM_MANAGER] Could not remove cached room: [${roomID}]. Room not found.`);
			}
		}

		/**
		 * @internal
		 */
		removeObservedRoom(roomID:string):void
		{
			const room = this.observedRooms.removeByRoomID(roomID);
			if (room)
			{
				room.updateSyncState();
			}
			else
			{
				this.log.debug(`[ROOM_MANAGER] Request to remove observed room [${roomID}] ignored; client is not observing room.`);
			}
		}

		/**
		 * @internal
		 */
		removeOccupiedRoom(roomID:string):void
		{
			const room = this.occupiedRooms.removeByRoomID(roomID);
			if (room)
			{
				room.updateSyncState();
			}
			else
			{
				this.log.debug(`[ROOM_MANAGER] Request to remove occupied room [${roomID}] ignored; client is not in room.`);
			}
		}

		/**
		 * Asks the server to remove the specified room. The result of the
		 * attempt triggers the RoomManagerEvent.REMOVE_ROOM_RESULT event on the
		 * current client.
		 * If the removal succeeds, and there is a client-side Room object
		 * corresponding to the room in question, that Room object is automatically
		 * removed.
		 *
		 * Clients in the room at the time of removal are automatically forced
		 * to leave the room, triggering a RoomEvent.LEAVE event.
		 *
		 * @param roomID The fully qualified identifier of the room to remove.
		 *               For example, "examples.chat".
		 * @param password The password required to remove the room.
		 */
		removeRoom(roomID:string, password?:string):void
		{
			// Quit if no room specified.
			if (roomID == null || !Validator.isValidResolvedRoomID(roomID))
			{
				throw new Error(`Invalid room id supplied to removeRoom(): [${roomID}]. Request not sent.`);
			}

			if (password == null)
			{
				password = '';
			}

			const msgMan = this.orbiter.getMessageManager();
			msgMan.sendUPC(UPC.REMOVE_ROOM, roomID, password);
		}

		private removeRoomListener(e:CollectionEvent):void
		{
			const room = e.getItem(),
			      knownReferenceCount = this.getKnownReferenceCount(room.getRoomID());

			switch (e.target)
			{
				case this.occupiedRooms:
					this.log.debug(`[ROOM_MANAGER] Removed occupied room: ${room}`);
					if (knownReferenceCount == 0)
					{
						this.fireRoomRemoved(room.getQualifier(), room.getRoomID(), room);
						this.fireRoomCount(this.getNumRooms());
					}
					break;

				case this.observedRooms:
					this.log.debug(`[ROOM_MANAGER] Removed observed room: ${room}`);
					if (knownReferenceCount == 0)
					{
						this.fireRoomRemoved(room.getQualifier(), room.getRoomID(), room);
						this.fireRoomCount(this.getNumRooms());
					}
					break;

				case this.watchedRooms:
					this.log.debug(`[ROOM_MANAGER] Removed watched room: ${room}`);
					if (knownReferenceCount == 0)
					{
						this.fireRoomRemoved(room.getQualifier(), room.getRoomID(), room);
						this.fireRoomCount(this.getNumRooms());
					}
					break;

				case this.cachedRooms:
					this.log.debug(`[ROOM_MANAGER] Removed cached room: ${room}`);
					break;
			}

			// When the RoomManager has no more references to the room, shut it down
			if (knownReferenceCount == 0 && !this.cachedRooms.contains(room))
			{
				room.shutdown();
			}
		}

		/**
		 * @internal
		 */
		removeWatchedRoom(roomID:string):void
		{
			const room = this.watchedRooms.removeByRoomID(roomID);
			if (room)
			{
				room.updateSyncState();
			}
			else
			{
				this.log.debug(`[ROOM_MANAGER] Request to remove watched room [${roomID}] ignored; room not in watched list.`);
			}
		}

		private requestRoom(roomID:string):Room|null
		{
			if (!roomID)
			{
				this.log.warn('[ROOM_MANAGER] requestRoom() failed. Supplied room ID was empty.');
				return null;
			}

			let theRoom = this.getRoom(roomID);
			if (theRoom)
			{
				return theRoom;
			}
			else
			{
				this.log.debug(`[ROOM_MANAGER] Creating new room object for id: [${roomID}]`);
				const RoomClass = this.roomClassRegistry.getRoomClass(roomID);
				theRoom = new RoomClass(roomID, this, this.orbiter.getMessageManager(), this.orbiter.getClientManager(), this.orbiter.getAccountManager(), this.log);
				return theRoom;
			}
		}

		/**
		 * Returns true if the specified room is known to the RoomManager.
		 * A room is known when the current client successfully is in or observing it,
		 * or when it is in the RoomManager's watched room list (see [[watchForRooms]]).
		 */
		roomIsKnown(roomID:string):boolean
		{
			for (const room of this.getRooms())
			{
				if (room.getRoomID() == roomID)
				{
					return true;
				}
			}
			return false;
		}

		/**
		 * Sends a message to clients in the room(s) specified by rooms. To send a message to
		 * clients in a single room only, use Room's sendMessage() method.
		 *
		 * Clients that prefer not to receive messages for a room can opt out of messages via the
		 * Room class's setUpdateLevels() method.
		 *
		 * To receive the message, recipient clients must register a message listener via
		 * MessageManager's addMessageListener() method.
		 *
		 * The message listener must define mandatory parameters; for details, see the
		 * MessageManager class's addMessageListener() method.
		 *
		 * To send a message to all rooms whose IDs are directly qualified by a given qualifier
		 * (non-recursive), specify that qualifier, followed by an asterisk, for sendMessage()'s
		 * rooms parameter.
		 *
		 * To send a message to all clients on the server, use the Server class's sendMessage()
		 * method.
		 *
		 * @param messageName The name of the message to send.
		 * @param   rooms The room(s) to which to send the message. Each entry in the rooms array
		 *                must be either a fully qualified room ID, or a room ID qualifier.
		 * @param includeSelf Indicates whether to send the message to the current client (i.e., the
		 *                    client that invoked sendMessage()). Defaults to false (don't echo to
		 *                    the sender).
		 * @param filters Specifies one or more filters for the message. A filter specifies a
		 *                requirement that each client must meet in order to receive the message.
		 *                For example, a filter might indicate that only those clients with the
		 *                attribute "team" set to "red" should receive the message. For complete
		 *                details, see the IFilter interface. If filters is null, all interested
		 *                clients in rooms receive the message.
		 * @param ...rest An optional comma-separated list of string arguments for the message.
		 *                These will be passed to any listeners registered to receive the message.
		 *                See Room's addMessageListener() method and MessageManager's
		 *                addMessageListener() method.
		 */
		sendMessage(messageName:string, rooms:string[], includeSelf:boolean, filters?:filters.Filter, ...rest:string[]):void
		{
			// Can't continue without a valid messageName.
			if (!messageName)
			{
				this.log.warn('[ROOM_MANAGER] sendMessage() failed. No messageName supplied.');
				return;
			}

			// Send the UPC.
			const msgMan = this.orbiter.getMessageManager();
			msgMan.sendUPC(UPC.SEND_MESSAGE_TO_ROOMS,
			               messageName,
			               rooms.join(Tokens.RS),
			               String(includeSelf),
			               filters?.toXMLString() ?? '',
			               ...rest);
		}

		/**
		 * Sets the rooms for a given room qualifier.
		 */
		setWatchedRooms(qualifier:string, newRoomIDs:string[]):void
		{
			// Remove rooms from local list
			for (const room of this.getRoomsWithQualifier(qualifier))
			{
				if (newRoomIDs.indexOf(room.getSimpleRoomID()) == -1)
				{
					this.removeWatchedRoom(room.getRoomID());
				}
			}

			// Add rooms to local list
			for (const roomID of newRoomIDs)
			{
				const fullRoomID = qualifier + (qualifier != '' ? '.' : '') + roomID;
				if (!this.watchedRooms.containsRoomID(fullRoomID))
				{
					this.addWatchedRoom(fullRoomID);
				}
			}
		}

		/**
		 * Asks the server to stop watching for rooms.
		 * In response, the server no longer sends notifications when a room with the
		 * specified roomQualifier is added or removed.
		 *
		 * The result of a stopWatchingForRooms() request is returned via a
		 * RoomManagerEvent.STOP_WATCHING_FOR_ROOMS_RESULT event.
		 *
		 * @param roomQualifier The roomID qualifier to stop watching (e.g.,
		 *                      "examples.chat.sports"). To stop watching for rooms with the unnamed
		 *                      qualifier, set roomQualifier to the empty string (""). To stop
		 *                      watching for all rooms on the server, omit roomQualifier.
		 */
		stopWatchingForRooms(roomQualifier?:string):void
		{
			let recursive = false;
			// null means whole server
			if (roomQualifier == null)
			{
				roomQualifier = '';
				recursive = true;
			}

			const msgMan = this.orbiter.getMessageManager();
			msgMan.sendUPC(UPC.STOP_WATCHING_FOR_ROOMS, roomQualifier, recursive.toString());
		}

		private stopWatchingForRoomsResultListener(e:RoomManagerEvent):void
		{
			const qualifier = e.getRoomIdQualifier();
			if (e.getStatus() == Status.SUCCESS && qualifier)
			{
				const unwatchedQualifierIndex = this.watchedQualifiers.indexOf(qualifier);
				if (unwatchedQualifierIndex != -1)
				{
					this.watchedQualifiers.splice(unwatchedQualifierIndex, 1);
				}
			}
		}

		/**
		 * Asks the server to send a notification any time a room with the
		 * specified qualifier is created or removed. The notifications trigger
		 * either a RoomManagerEvent.ROOM_ADDED event or a
		 * RoomManagerEvent.ROOM_REMOVED event. Clients typically use
		 * watchForRooms() to create an application lobby, where a dynamic list of
		 * rooms is presented to the user for selection.
		 *
		 * The result of a watchForRooms() request is returned via
		 * RoomManagerEvent.WATCH_FOR_ROOMS_RESULT.
		 *
		 * @param roomQualifier The roomID qualifier to watch (e.g., "examples.chat.sports"). To
		 *                      watch for rooms with the unnamed qualifier, set roomQualifier to the
		 *                      empty string (""). To watch for all rooms on the server, omit.
		 */
		watchForRooms(roomQualifier?:string):void
		{
			let recursive = false;

			// null means watch the whole server
			if (roomQualifier == null)
			{
				roomQualifier = '';
				recursive = true;
			}

			const msgMan = this.orbiter.getMessageManager();
			msgMan.sendUPC(UPC.WATCH_FOR_ROOMS, roomQualifier, recursive.toString());
		}

		private watchForRoomsResultListener(e:RoomManagerEvent):void
		{
			const qualifier = e.getRoomIdQualifier();

			if (e.getStatus() == Status.SUCCESS && qualifier)
			{
				this.watchedQualifiers.push(qualifier);
			}
		}
	}
}

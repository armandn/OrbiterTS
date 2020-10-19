namespace net.user1.orbiter
{
	/**
	 * RoomManagerEvent is a simple data class used to pass information from an application's
	 * RoomManager to registered event-listeners when a room-management event occurs. The
	 * RoomManagerEvent class also defines constants representing the available room-management
	 * events.
	 */
	export class RoomManagerEvent extends net.user1.events.Event
	{
		/**
		 * Dispatched when the server reports the result of an attempt to create a room by the
		 * current client. To determine the result of the attempt, use getStatus(), which has the
		 * following possible return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.ROOM_EXISTS
		 *
		 * Note that RoomManagerEvent.CREATE_ROOM_RESULT is triggered only when the current client
		 * attempts to create a room, not when other clients attempt to create rooms, and not when
		 * the the current client gains knowledge of a room. To respond to the creation of rooms by
		 * other clients, use watchForRooms() and the RoomManagerEvent.ROOM_ADDED event.
		 */
		static readonly CREATE_ROOM_RESULT = 'CREATE_ROOM_RESULT';

		/**
		 * Dispatched when the server reports the result of a remove-room attempt by the current
		 * client. To determine the result of the attempt, use getStatus(), which has the following
		 * possible return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.ROOM_NOT_FOUND
		 * - Status.AUTHORIZATION_REQUIRED
		 * - Status.AUTHORIZATION_FAILED
		 */
		static readonly REMOVE_ROOM_RESULT = 'REMOVE_ROOM_RESULT';

		/**
		 * Dispatched when the current client gains knowledge of a new room. The current client
		 * gains knowledge of a room in the following circumstances.
		 * - the current client joins a room it is not already observing
		 * - the current client observes a room it is not already in
		 * - a room with a qualifier that is being watched by the current client is added to the
		 *   server
		 *
		 * Note the difference between ROOM_ADDED and CREATE_ROOM_RESULT: ROOM_ADDED indicates that
		 * the RoomManager has gained awareness of a room; CREATE_ROOM_RESULT merely tells the
		 * current client the result of an attempt to create a server-side room.
		 */
		static readonly ROOM_ADDED = 'ROOM_ADDED';

		/**
		 * Dispatched whenever the RoomManager gains or loses knowledge of a room, as described
		 * under RoomManagerEvent.ROOM_ADDED and RoomManagerEvent.ROOM_REMOVED.
		 *
		 * To determine the new number of rooms, use RoomManagerEvent's getNumRooms() method or
		 * RoomManager's getNumRooms() method.
		 */
		static readonly ROOM_COUNT = 'ROOM_COUNT';

		/**
		 * Dispatched when the current client loses knowledge of a new room. The current client
		 * loses knowledge of a room in the following circumstances.
		 * - the current client leaves a room it is not observing
		 * - the current client stops observing a room it is not in
		 * - a room with a qualifier that is being watched by the current client is removed from the
		 *   server
		 * - an attempt by the current client to remove a room succeeds
		 */
		static readonly ROOM_REMOVED = 'ROOM_REMOVED';

		/**
		 * Dispatched when the server reports the result of a stop-watching-for-rooms attempt by the
		 * current client. To determine the result of the attempt, use getStatus(), which has the
		 * following possible return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.NOT_WATCHING
		 */
		static readonly STOP_WATCHING_FOR_ROOMS_RESULT = 'STOP_WATCHING_FOR_ROOMS_RESULT';

		/**
		 * Dispatched when the server reports the result of a watch-for-rooms attempt by the current
		 * client. To determine the result of the attempt, use getStatus(), which has the following
		 * possible return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.ALREADY_WATCHING
		 */
		static readonly WATCH_FOR_ROOMS_RESULT = 'WATCH_FOR_ROOMS_RESULT';

		constructor(type:string,
		            private readonly roomID?:string,
		            private readonly status?:Status,
		            private readonly roomIdQualifier?:string,
		            private readonly room?:Room,
		            private readonly numRooms:number=-1)
		{
			super(type);
		}

		/**
		 * Returns the total number of rooms known to the current client.
		 *
		 * The getNumRooms() method applies to the RoomManagerEvent.ROOM_COUNT event only.
		 */
		getNumRooms():number
		{
			return this.numRooms;
		}

		/**
		 * Returns a reference to the Room object to which this event pertains.
		 * For example, for the RoomManagerEvent.ROOM_ADDED event, getRoom()
		 * returns a reference to the room that was added.
		 */
		getRoom():Room|null
		{
			return this.room ?? null;
		}

		/**
		 * Returns the full room ID of the room to which this event pertains.
		 * The "full room ID" is the qualified identifier for the room;
		 * for example, for a room with the qualified id "examples.chat",
		 * this method would return "examples.chat".
		 */
		getRoomID():string|null
		{
			if (this.room)
			{
				return this.room.getRoomID();
			}
			else
			if (this.roomID == null)
			{
				return null;
			}
			else
			{
				const qualifier = this.getRoomIdQualifier();

				return qualifier ? `${qualifier}.${this.roomID}`: this.roomID;
			}
		}

		/**
		 * Returns the qualifier ID of the room to which this event pertains.
		 *
		 * For example, for a room with the fully qualified id "examples.chat",
		 * this method would return "examples".
		 */
		getRoomIdQualifier():string|null
		{
			if (this.roomIdQualifier == null && this.room != null)
			{
				return this.room.getQualifier();
			}
			else
			{
				return this.roomIdQualifier ?? null;
			}
		}

		/**
		 * Returns the simple room ID of the room to which this event pertains.
		 * The "simple room ID" is the unqualified identifier for the room;
		 * for example, for a room with the fully qualified id "examples.chat",
		 * this method would return "chat".
		 */
		getSimpleRoomID():string|null
		{
			if (this.roomID == null && this.room != null)
			{
				return this.room.getSimpleRoomID();
			}
			else
			{
				return this.roomID ?? null;
			}
		}

		/**
		 * Returns the status of the operation to which this event pertains.
		 *
		 * The getStatus() method's return value is always one of the Status class's constants. For
		 * example, when a RoomManagerEvent.WATCH_FOR_ROOMS_RESULT event occurs for a room the
		 * current client is already watching, getStatus() returns the value of
		 * Status.ALREADY_WATCHING.
		 *
		 * For a list of specific status values that are available for a particular RoomManagerEvent
		 * event, see that event's documentation.
		 */
		getStatus():Status|null
		{
			return this.status ?? null;
		}

		toString():string
		{
			return '[object RoomManagerEvent]';
		}
	}
}

namespace net.user1.orbiter
{
	/**
	 * RoomClassRegistry maintains a catalog of the classes that are used
	 * to represent the rooms in an application. By default, rooms are
	 * represented by the Room class. To specify a custom class for a room
	 * with a given ID, use setRoomClass() before creating, joining, or
	 * observing the room.
	 */
	export class RoomClassRegistry
	{
		private readonly registry:{[roomID:string]:new ()=>{}} = {};

		constructor()
		{
		}

		/**
		 * Specifies the class that will be used to represent the room with the
		 * specified roomID. If the current client joins or observes the
		 * specified room, RoomManager will create an instance of the specified
		 * roomClass, and that instance will be returned by all [[RoomManager]] methods
		 * that provide access to the room. The specified roomClass must extend
		 * the built-in Room class.
		 */
		setRoomClass(roomID:string, roomClass:new ()=>{})
		{
			this.registry[roomID] = roomClass;
		}

		/**
		 * Removes the current custom class association for the specified roomID.
		 */
		clearRoomClass(roomID:string):void
		{
			delete this.registry[roomID];
		}

		/**
		 * Returns the current custom class association for the specified roomID.
		 */
		getRoomClass(roomID:string):any
		{
			return this.registry[roomID] ? this.registry[roomID] : Room;
		}
	}
}

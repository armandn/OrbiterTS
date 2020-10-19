namespace net.user1.orbiter
{
	/**
	 * A simple data container describing the configuration settings for a room. Configuration
	 * settings for an existing room can be accessed via Room's getRoomSettings() method.
	 */
	export class RoomSettings
	{
		/**
		 * The maximum number of clients allowed in the room at the same time.
		 * Use -1 for no maximum. Defaults to -1.
		 */
		maxClients?:number  = -1;

		/**
		 * The password required to join the room. To allow clients to join and observe the room
		 * without a password, set to the empty string (""). To leave the room's password unchanged,
		 * set to null. The password variable applies to assigning room settings only, and is always
		 * null on RoomSettings objects returned by Room's getRoomSettings() method.
		 */
		password?:string;

		/**
		 * Indicates whether the room should remove itself when it becomes empty (all its clients
		 * leave). Defaults to true. When false, the room is permanent, and must be deleted from the
		 * server manually (a client can issue a manual request to remove a room via RoomManager's
		 * removeRoom() method). If removeOnEmpty is true, and no client enters the room within 5
		 * minutes, the room is automatically deleted by the server.
		 */
		removeOnEmpty?:boolean = true;

		/**
		 * Returns a string representation of the room settings, suitable for sending to the server
		 * via the u24 UPC. This method is used internally.
		 */
		serialize():string
		{
			return [Tokens.REMOVE_ON_EMPTY_ATTR, this.removeOnEmpty ?? true,
				    Tokens.MAX_CLIENTS_ATTR,     this.maxClients    ?? -1,
				    Tokens.PASSWORD_ATTR,        this.password      ?? ''].join(Tokens.RS);
		}
	}
}

namespace net.user1.orbiter.snapshot
{
	/**
	 * The RoomListSnapshot class is used to load a list of fully qualified roomIDs for all rooms on
	 * the server or all rooms with a given qualifier.
	 *
	 * The list of room IDs retrieved by RoomListSnapshot is a one-time snapshot of the state of the
	 * server, and is not kept up to date after it is loaded. To update a RoomListSnapshot object to
	 * match latest the state of the server, pass that object to [[Orbiter.updateSnapshot]] method.
	 */
	export class RoomListSnapshot extends Snapshot
	{
		protected roomList?:string[];

		/**
		 * @param qualifier The room id qualifier of the rooms that should be included in the list.
		 *                  For a server-wide room list, supply null for qualifier and true for
		 *                  recursive. For a list of rooms with no qualifier, supply null for
		 *                  qualifier and false for recursive. For a list of rooms with the
		 *                  qualifier "chat.sports", supply "chat.sports" for qualifier and false
		 *                  for recursive. In Reactor 1.0.0, recursion is supported when qualifier
		 *                  is null only.
		 *
		 * @param recursive Indicates whether the room list for this snapshot should include rooms
		 *                  directly qualified by the specified qualifier only, or also all rooms
		 *                  qualified by all child qualifiers of the specified qualifier.
		 */
		constructor(protected qualifier?:string,
		            protected recursive:boolean=false)
		{
			super();

			this.method = UPC.GET_ROOMLIST_SNAPSHOT;
			this.args = [qualifier, recursive ? 'true' : 'false'];
		}

		/**
		 * Returns the qualifier of the rooms that are included in this snapshot.
		 */
		getQualifier():string|null
		{
			return this.qualifier ?? null;
		}

		/**
		 * Indicates whether the room list for this snapshot includes rooms directly qualified by
		 * the specified qualifier only, or also all rooms qualified by all child qualifiers of the
		 * specified qualifier.
		 */
		getRecursive():boolean
		{
			return this.recursive;
		}

		/**
		 * Returns an array of the fully qualified roomIDs of the rooms with the qualifier specified
		 * by this snapshot.
		 */
		getRoomList():string[]|null
		{
			return this.roomList?.slice() ?? null;
		}

		/**
		 * @internal
		 */
		setQualifier(value?:string):void
		{
			this.qualifier = value;
		}

		/**
		 * @internal
		 */
		setRecursive(value:boolean):void
		{
			this.recursive = value;
		}

		/**
		 * @internal
		 */
		setRoomList(value:string[]):void
		{
			this.roomList = value;
		}
	}
}

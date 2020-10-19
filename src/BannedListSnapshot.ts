namespace net.user1.orbiter.snapshot
{
	/**
	 * The BannedListSnapshot class is used to load the server's current list of banned client
	 * addresses. The list of banned addresses retrieved by BannedListSnapshot is a one-time
	 * snapshot of the state of the server, and is not kept up to date after it is loaded.
	 * To update a BannedListSnapshot object to match latest the state of the server, pass that
	 * object to `updateSnapshot()` method.
	 */
	export class BannedListSnapshot extends Snapshot
	{
		private bannedList?:string[];

		constructor()
		{
			super();
			this.method = UPC.GET_BANNED_LIST_SNAPSHOT;
		}

		/**
		 * Returns an array of the banned addresses on the server.
		 * @return {string[] | null}
		 */
		getBannedList():string[]|null
		{
			return this.bannedList?.slice() ?? null;
		}

		/**
		 * @internal
		 * @param {string[]} value
		 */
		setBannedList(value:string[]):void
		{
			this.bannedList = value;
		}
	}
}


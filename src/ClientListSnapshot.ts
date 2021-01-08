namespace net.user1.orbiter.snapshot
{
	/**
	 * The ClientListSnapshot class is used to load a list of clientIDs for the clients currently on
	 * the server. For any client that is logged in, both a clientID and a userID are included in
	 * the list.
	 *
	 * The list of client IDs retrieved by ClientListSnapshot is a one-time snapshot of the state of
	 * the server, and is not kept up to date after it is loaded.
	 */
	export class ClientListSnapshot extends Snapshot
	{
		private clientList?:{clientID:string, userID:string|null}[];

		constructor(target?:net.user1.events.EventDispatcher)
		{
			super(target);
			this.method = UPC.GET_CLIENTLIST_SNAPSHOT;
		}

		/**
		 * @internal
		 * @param {{clientID:string, userID:string | null}[]} value
		 */
		setClientList(value:{clientID:string, userID:string|null}[]):void
		{
			this.clientList = value;
		}

		/**
		 * Returns an array of generic data objects containing the clientIDs and, for logged in
		 * clients, the userIDs of the clients on the server.
		 * For clients that are not logged in, the value of the userID variable is null.
		 * @return {{clientID:string, userID:string | null}[] | null}
		 */
		getClientList():{clientID:string, userID:string|null}[]|null
		{
			return this.clientList?.slice() ?? null;
		}
	}
}

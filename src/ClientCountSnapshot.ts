namespace net.user1.orbiter.snapshot
{
	/**
	 * The ClientCountSnapshot class is used to retrieve the number of clients currently on the
	 * server.
	 */
	export class ClientCountSnapshot extends Snapshot
	{
		private count:number = 0;

		constructor()
		{
			super();

			this.method = UPC.GET_CLIENTCOUNT_SNAPSHOT;
			this.hasStatus = true;
		}

		/**
		 * @internal
		 * @param {number} value
		 */
		setCount(value:number):void
		{
			this.count = value;
		}

		/**
		 * Returns the total number of clients on the server. To refresh the count, pass this
		 * ClientCountSnapshot object to [[Orbiter.updateSnapshot]] method.
		 */
		getCount():number
		{
			return this.count;
		}
	}
}

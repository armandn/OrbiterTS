namespace net.user1.orbiter.snapshot
{
	/**
	 * The NodeListSnapshot class is used to load a list of the Union Server nodes connected to the
	 * current server. By default, access to the current server's node list requires administrator
	 * privileges.
	 *
	 * The list of node IDs retrieved by NodeListSnapshot is a one-time snapshot of the state of the
	 * server, and is not kept up to date after it is loaded. To update a NodeListSnapshot object to
	 * match latest the state of the server, pass that object to [[Orbiter.updateSnapshot]] method.
	 */
	export class NodeListSnapshot extends Snapshot
	{
		private nodeList?:string[];

		constructor()
		{
			super();
			this.method = UPC.GET_NODELIST_SNAPSHOT;
		}

		/**
		 * @internal
		 */
		setNodeList(value?:string[]):void
		{
			this.nodeList = value;
		}

		/**
		 * Returns an array of the node IDs for the Union Server nodes connected to the current
		 * server.
		 */
		getNodeList():string[]|null
		{
			return this.nodeList?.slice() ?? null;
		}
	}
}

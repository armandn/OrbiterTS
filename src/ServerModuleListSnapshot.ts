namespace net.user1.orbiter.snapshot
{
	/**
	 * The ServerModuleListSnapshot class is used to load the server's current list of active server
	 * modules (not to be confused with room modules). By default, only administrator clients can
	 * load the server's module list.
	 *
	 * The following code demonstrates:
	 *
	 * The list of modules retrieved by ServerModuleListSnapshot is a one-time snapshot of the state
	 * of the server, and is not kept up to date after it is loaded. To update a
	 * ServerModuleListSnapshot object to match latest the state of the server, pass that object to
	 * [[Orbiter.updateSnapshot]] method.
	 */
	export class ServerModuleListSnapshot extends Snapshot
	{
		private moduleList?:ModuleDefinition[];

		constructor()
		{
			super();
			this.method = UPC.GET_SERVERMODULELIST_SNAPSHOT;
		}

		/**
		 * @internal
		 * @param {net.user1.orbiter.ModuleDefinition[]} value
		 */
		setModuleList(value:ModuleDefinition[]):void
		{
			this.moduleList = value;
		}

		/**
		 * Returns an array of the server modules active on the server.
		 */
		getModuleList():ModuleDefinition[]|null
		{
			return this.moduleList?.slice() ?? null;
		}
	}
}

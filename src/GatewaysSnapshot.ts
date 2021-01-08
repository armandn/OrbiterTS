namespace net.user1.orbiter.snapshot
{
	/**
	 * The GatewaysSnapshot class is used to retrieve a per-gateway summary of connection and
	 * bandwidth statistics. By default, access to gateway data requires administrator privileges.
	 *
	 * GatewaysSnapshot represents a one-time snapshot of the state of the server, and is not kept
	 * up to date after it is loaded.
	 */
	export class GatewaysSnapshot extends Snapshot
	{
		private gateways?:Gateway[];

		constructor(target?:net.user1.events.EventDispatcher)
		{
			super(target);
			this.method = UPC.GET_GATEWAYS_SNAPSHOT;
		}

		/**
		 * @internal
		 * @param {net.user1.orbiter.Gateway[]} value
		 */
		setGateways(value:Gateway[]):void
		{
			this.gateways = value;
		}

		/**
		 * Returns an array of Gateway objects providing information about the gateways on the
		 * server.
		 */
		getGateways():Gateway[]|null
		{
			return this.gateways?.slice() ?? null;
		}
	}
}

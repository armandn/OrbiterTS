namespace net.user1.orbiter
{
	/**
	 * A simple data class providing information about a gateway deployed on Union Server. Each
	 * gateway provides Union clients with a unique means of connecting to Union Server.
	 */
	export class Gateway
	{
		/**
		 * The gateway's id.
		 */
		public id?:string;

		/**
		 * The gateway's type.
		 */
		public type?:string;

		/**
		 * An object whose properties specify the number of connections to the gateway, broken down
		 * by connection type. Connection types are determined by each gateway. For every gateway,
		 * one of the categories is always guaranteed to be "TOTAL". The "TOTAL" connection category
		 * indicates the total raw number of lifetime connections to the specified gateway,
		 * including all connection types.
		 */
		public lifetimeConnectionsByCategory?:any;

		/**
		 * An object whose properties specify the number of Union clients that have connected to the
		 * gateway, broken down by client type.
		 */
		public lifetimeClientsByType?:any;

		/**
		 * An object whose properties specify the number of Union clients that have connected to the
		 * gateway, broken down by UPC version.
		 */
		public lifetimeClientsByUPCVersion?:any;

		/**
		 * An object whose properties specify the attributes defined for the gateway.
		 */
		public attributes?:any;

		/**
		 * The number of raw connections per second currently being made to the gateway.
		 */
		public connectionsPerSecond:number = 0;

		/**
		 * The highest ever value recorded for connectionsPerSecond.
		 */
		public maxConnectionsPerSecond:number = 0;

		/**
		 * The number of clients per second currently connecting to the gateway.
		 */
		public clientsPerSecond:number = 0;

		/**
		 * The highest ever value recorded for clientsPerSecond.
		 */
		public maxClientsPerSecond:number = 0;

		/**
		 * A GatewayBandwidth object describing the bandwidth usage and throughput for the gateway.
		 */
		public bandwidth?:GatewayBandwidth;
	}
}

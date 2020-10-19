namespace net.user1.orbiter
{
	/**
	 * A simple data class providing information about bandwidth usage and throughput for a gateway
	 * deployed on Union Server.
	 */
	export class GatewayBandwidth
	{
		/**
		 * The average number of bytes received by this gateway from all clients, per second, since
		 * the server started.
		 */
		public averageRead:number = 0;

		/**
		 * The average number of bytes sent to clients via this gateway, per second, since the
		 * server started.
		 */
		public averageWritten:number = 0;

		/**
		 * The number of bytes received by this gateway from all clients in the one-second period
		 * immediately preceding the request that generated this bandwidth-statistics object (i.e.,
		 * "current incoming bytes per second").
		 */
		public intervalRead:number = 0;

		/**
		 * The number of bytes sent by this gateway to all clients in the one-second period
		 * immediately preceding the request that generated this bandwidth-statistics object (i.e.,
		 * "current outgoing bytes per second").
		 */
		public intervalWritten:number = 0;

		/**
		 * The total number of bytes that have been received by this gateway from all clients since
		 * the server started.
		 */
		public lifetimeRead:number = 0;

		/**
		 * The total number of bytes that have been sent to clients via this gateway since the
		 * server started.
		 */
		public lifetimeWritten:number = 0;

		/**
		 * The maximum number of bytes ever received by this gateway from all clients in any
		 * one-second period since the server started.
		 */
		public maxIntervalRead:number = 0;

		/**
		 * The maximum number of bytes ever sent by this gateway to all clients in any one-second
		 * period since the server started.
		 */
		public maxIntervalWritten:number = 0;

		/**
		 * The number of bytes scheduled for transmission to clients currently connected to the
		 * server via this gateway (i.e., outgoing buffered bytes).
		 */
		public scheduledWrite:number = 0;
	}
}

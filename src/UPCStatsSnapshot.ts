namespace net.user1.orbiter.snapshot
{
	/**
	 * The UPCStatsSnapshot class is used to retrieve statistics about the UPC messages that have
	 * been processed or are waiting to be processed by Union Server. For example,
	 */
	export class UPCStatsSnapshot extends Snapshot
	{
		private totalUPCsProcessed:number = 0;
		private numUPCsInQueue:number = 0;
		private lastQueueWaitTime:number = 0;
		private longestUPCProcesses?:UPCProcessingRecord[];

		constructor(target?:net.user1.events.EventDispatcher)
		{
			super(target);

			this.method = UPC.GET_UPC_STATS_SNAPSHOT;
			this.hasStatus = true;
		}

		/**
		 * Returns the amount of time the most-recently processed message spent in the message queue
		 * before being processed. To refresh this value to reflect the latest state of the server,
		 * pass this UPCStatsSnapshot object to [[Orbiter.updateSnapshot]] method.
		 */
		getLastQueueWaitTime():number
		{
			return this.lastQueueWaitTime;
		}

		/**
		 * Returns a list of the messages that took the longest amount of time to process since the
		 * server started. To refresh this value to reflect the latest state of the server, pass
		 * this UPCStatsSnapshot object to [[Orbiter.updateSnapshot]] method.
		 */
		getLongestUPCProcesses():UPCProcessingRecord[]|null
		{
			return this.longestUPCProcesses?.slice() ?? null;
		}

		/**
		 * Returns the number of UPC messages currently waiting to be processed by Union Server.
		 * To refresh this value to reflect the latest state of the server, pass this
		 * UPCStatsSnapshot object to [[Orbiter.updateSnapshot]] method.
		 */
		getNumUPCsInQueue():number
		{
			return this.numUPCsInQueue;
		}

		/**
		 * Returns the total number of UPC messages Union Server has processed since the server
		 * started. To refresh this value to reflect the latest state of the server, pass this
		 * UPCStatsSnapshot object to [[Orbiter.updateSnapshot]] method.
		 */
		getTotalUPCsProcessed():number
		{
			return this.totalUPCsProcessed;
		}

		/**
		 * @internal
		 */
		setLastQueueWaitTime(value:number):void
		{
			this.lastQueueWaitTime = value;
		}

		/**
		 * @internal
		 */
		setLongestUPCProcesses(value:UPCProcessingRecord[]):void
		{
			this.longestUPCProcesses = value;
		}

		/**
		 * @internal
		 */
		setNumUPCsInQueue(value:number):void
		{
			this.numUPCsInQueue = value;
		}

		/**
		 * @internal
		 */
		setTotalUPCsProcessed(value:number):void
		{
			this.totalUPCsProcessed = value;
		}
	}
}

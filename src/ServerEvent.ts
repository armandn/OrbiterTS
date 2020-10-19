namespace net.user1.orbiter
{
	/**
	 * ServerEvent is a simple data class used to pass information from an application's Server
	 * object to registered event-listeners when a server event occurs. The ServerEvent class also
	 * defines constants representing the available server events.
	 */
	export class ServerEvent extends net.user1.events.Event
	{
		/**
		 * Dispatched when the server reports the result of a reset-UPC-stats attempt by the current
		 * client.
		 *
		 * To determine the result of the attempt, use `getStatus()`, which has the following
		 * possible return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.PERMISSION_DENIED
		 */
		static readonly RESET_UPC_STATS_RESULT = 'RESET_UPC_STATS_RESULT';

		/**
		 * Dispatched when the server reports the result of a stop-watching-for-processed-UPCs
		 * attempt by the current client.
		 *
		 * To determine the result of the attempt, use `getStatus()`, which has the following
		 * possible return values:
		 * * Status.SUCCESS
		 * * Status.ERROR
		 * * Status.NOT_WATCHING
		 * * Status.PERMISSION_DENIED
		 */
		static readonly STOP_WATCHING_FOR_PROCESSED_UPCS_RESULT = 'STOP_WATCHING_FOR_PROCESSED_UPCS_RESULT';

		/**
		 * Dispatched when the server sends the current server time in response to an earlier
		 * invocation of Server's syncTime() method by the current client. Listeners for
		 * `ServerEvent.TIME_SYNC` can retrieve the approximate time on the server via Server's
		 * `getServerTime()` method.
		 */
		static readonly TIME_SYNC = 'TIME_SYNC';

		/**
		 * Dispatched when the current client is watching for "processed UPC messages" and the
		 * server finishes processing an inbound UPC message. To watch for processed UPC messages,
		 * use the Server class's `watchForProcessedUPCs()`
		 */
		static readonly UPC_PROCESSED = 'UPC_PROCESSED';

		/**
		 * Dispatched when the server reports the result of a watch-for-processed-UPCs  attempt by
		 * the current client.
		 *
		 * To determine the result of the attempt, use `getStatus()`, which has the following
		 * possible return values:
		 * * Status.SUCCESS
		 * * Status.ERROR
		 * * Status.ALREADY_WATCHING
		 * * Status.PERMISSION_DENIED
		 */
		static readonly WATCH_FOR_PROCESSED_UPCS_RESULT = 'WATCH_FOR_PROCESSED_UPCS_RESULT';

		constructor(type:string,
		            private upcProcessingRecord?:UPCProcessingRecord|null,
		            private status?:string)
		{
			super(type);
		}

		/**
		 * Returns the status of the operation to which this event pertains.
		 *
		 * The `getStatus()` method's return value is always one of the Status class's constants.
		 * For example, if the `Server.WATCH_FOR_PROCESSED_UPCS_RESULT` event occurs in response to
		 * a successful watch-for-processed-UPCs attempt, `getStatus()` will return the value of
		 * `Status.SUCCESS`.
		 */
		getStatus():string|undefined
		{
			return this.status;
		}

		/**
		 * Returns the UPCProcessingRecord object for a UPC that was processed by Union Server.
		 * Applies to the `ServerEvent.UPC_PROCESSED` event only.
		 */
		getUPCProcessingRecord():UPCProcessingRecord|null|undefined
		{
			return this.upcProcessingRecord;
		}

		toString():string
		{
			return '[object ServerEvent]';
		}
	}
}

namespace net.user1.orbiter
{
	/**
	 * A data container describing server-side processing-statistics for a single UPC message
	 * received and then processed by Union Server. UPCProcessingRecord objects are used by
	 * UPCStatsSnapshot and the ServerEvent.UPC_PROCESSED event.
	 */
	export class UPCProcessingRecord
	{
		/**
		 * The raw source string of the processed UPC message.
		 */
		public UPCSource:string|null = null;

		/**
		 * The address of the client that sent the processed UPC to the server;
		 * the address is typically an IP address.
		 */
		public fromClientAddress:string|null = null;

		/**
		 * The clientID of the client that sent the processed UPC to the server.
		 */
		public fromClientID:string|null = null;

		/**
		 * The userID of the client that sent the processed UPC to the server.
		 * Available if the client is logged in only.
		 */
		public fromUserID:string|null = null;

		/**
		 * The number of milliseconds that elapsed between the time the server began processing the
		 * UPC message and the time the server completed processing the UPC message.
		 */
		public processingDuration:number = NaN;

		/**
		 * The UTC time at which the server finished processing the UPC message, in
		 * "milliseconds from January 1 1970"-format.
		 */
		public processingFinishedAt:number = NaN;

		/**
		 * The UTC time at which the server began processing the UPC message, in
		 * "milliseconds from January 1 1970"-format.
		 */
		public processingStartedAt:number = NaN;

		/**
		 * The number of milliseconds that the message spent in the message queue before the server
		 * began processing it.
		 */
		public queueDuration:number = NaN;

		/**
		 * The UTC time at which the server queued the UPC message for processing, in "milliseconds
		 * from January 1 1970"-format.
		 */
		public queuedAt:number = NaN;

		constructor()
		{
		}

		deserialize(serializedRecord:string):void
		{
			const recordParts:string[]            = [],
			      numSignificantSeparators:number = 6;

			let thisSeparatorIndex:number     = 0,
			    previousSeparatorIndex:number = -1;

			// Don't use split because the source might contain the record separator
			for (let i = 0; i < numSignificantSeparators; i++)
			{
				thisSeparatorIndex =
					serializedRecord.indexOf(Tokens.RS, previousSeparatorIndex + 1);
				recordParts.push(
					serializedRecord.substring(previousSeparatorIndex + 1, thisSeparatorIndex));
				previousSeparatorIndex = thisSeparatorIndex;
			}
			recordParts.push(serializedRecord.substring(thisSeparatorIndex + 1));

			this.deserializeParts(recordParts[0], recordParts[1], recordParts[2], recordParts[3],
			                      recordParts[4], recordParts[5], recordParts[6]);
		}

		deserializeParts(fromClientID:string, fromUserID:string, fromClientAddress:string,
		                         queuedAt:string, processingStartedAt:string,
		                         processingFinishedAt:string, source:string)
		{
			const escapedCDStart = /<!\(\[CDATA\[/gi,
			      escapedCDEnd = /\]\]\)>/gi;

			this.fromClientID = fromClientID;
			this.fromUserID = fromUserID;
			this.fromClientAddress = fromClientAddress;
			this.processingStartedAt = parseFloat(processingStartedAt);
			this.processingFinishedAt = parseFloat(processingFinishedAt);
			this.processingDuration = this.processingFinishedAt - this.processingStartedAt;
			this.queuedAt = parseFloat(queuedAt);
			this.queueDuration = this.processingStartedAt - this.queuedAt;
			this.UPCSource = source.replace(escapedCDStart,'<![CDATA[').replace(escapedCDEnd,']]>');
		}
	}
}

namespace net.user1.orbiter
{
	/**
	 * Provides a variety of networking and performance statistics for a Orbiter object. To access
	 * the Statistics object, first invoke [[Orbiter.enableStatistics]] method, then retrieve the
	 * Statistics object via getStatistics()
	 */
	export class Statistics
	{
		private orbiter!:Orbiter;

		private connection?:Connection;
		private lastTick:number = NaN;
		private lastTotalMessages:number = 0;
		private messagesPerSecond:number = 0;
		private peakMessagesPerSecond:number = 0;
		private statsIntervalID:number = -1;

		constructor(orbiter:Orbiter)
		{
			this.init(orbiter);
		}

		private clearStats():void
		{
			this.lastTick = 0;
			this.lastTotalMessages = 0;
			this.messagesPerSecond = 0;
			this.peakMessagesPerSecond = 0;
		}

		getCurrentNumClientsConnected():number
		{
			return this.orbiter.getClientManager().getNumClients();
		}

		getLifetimeNumClientsConnected():number
		{
			return this.orbiter.getClientManager().getLifetimeNumClientsKnown();
		}

		getMessagesPerSecond():number
		{
			return this.messagesPerSecond;
		}

		getPeakMessagesPerSecond():number
		{
			return this.peakMessagesPerSecond;
		}

		getTotalMessages():number
		{
			return this.getTotalMessagesReceived() + this.getTotalMessagesSent();
		}

		getTotalMessagesReceived():number
		{
			return this.orbiter.getMessageManager().getNumMessagesReceived();
		}

		getTotalMessagesSent():number
		{
			return this.orbiter.getMessageManager().getNumMessagesSent();
		}

		private init(orbiter:Orbiter):void
		{
			this.setOrbiter(orbiter);
			this.start();
		}

		/**
		 * @internal
		 */
		setOrbiter(orbiter:Orbiter):void
		{
			// Register new orbiter
			this.orbiter = orbiter;
		}

		/**
		 * Starts tracking statistics for the current connection.
		 */
		start():void
		{
			this.stop();

			this.statsIntervalID = setInterval(this.statsTimerListener, 1000);

			this.lastTick = new Date().getTime();
			this.lastTotalMessages = this.getTotalMessages();
		}

		private statsTimerListener(e:Event):void
		{
			// Check elapsed time
			const now = new Date().getTime(),
			      elapsed = now - this.lastTick;

			this.lastTick = now;

			// Calculate number of messages sent and received since last tick
			const totalMessages = this.getTotalMessages(),
			      tickNumMsgs = totalMessages - this.lastTotalMessages;

			this.lastTotalMessages = totalMessages;
			this.messagesPerSecond = Math.round((1000 / elapsed) * tickNumMsgs);

			if (this.messagesPerSecond > this.peakMessagesPerSecond)
			{
				this.peakMessagesPerSecond = this.messagesPerSecond;
			}
		}

		/**
		 * Stops tracking statistics for the current connection.
		 */
		stop():void
		{
			clearInterval(this.statsIntervalID);
			this.clearStats();
		}
	}
}

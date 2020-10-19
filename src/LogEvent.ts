namespace net.user1.logger
{
	/**
	 * LogEvent is a simple data class used to pass information from an application's Logger to
	 * registered event-listeners when a log event occurs. A log event is triggered when a message
	 * is added to the log via debug(), info(), warn(), error, or fatal(). The LogEvent class also
	 * defines a constant representing the log events: LogEvent.UPDATE and LogEvent.LEVEL_CHANGE.
	 *
	 * To register for a log event, use the [[Logger.addEventListener]] method.
	 */
	export class LogEvent extends net.user1.events.Event
	{
		/**
		 * Dispatched when the log's level is changed via [[Logger.setLevel]] method.
		 * To access the new level, use getLevel(), which returns one of the following
		 * values: Logger.FATAL, Logger.ERROR, Logger.WARN, Logger.INFO, or Logger.DEBUG.
		 */
		static LEVEL_CHANGE = 'LEVEL_CHANGE';

		/**
		 * Dispatched when a new message is added to the log. To add a message to the log, use one
		 * of the following Logger class methods: debug(), info(), warn(), error(), or fatal().
		 */
		static UPDATE = 'UPDATE';

		constructor(type:string,
		            private readonly message?:string,
		            private readonly level?:string,
		            private readonly timeStamp?:string)
		{
			super(type);
		}

		/**
		 * If this event is LogEvent.UPDATE, returns the severity level for the log entry;
		 * if this event is LogEvent.LEVEL_CHANGE, returns the log's new severity level.
		 *
		 * @return One of Logger.FATAL, Logger.ERROR, Logger.WARN, Logger.INFO,
		 *         or Logger.DEBUG.
		 */
		getLevel():string|null
		{
			return this.level ?? null;
		}

		/**
		 * Returns the text of the log message. Available for the LogEvent.UPDATE event only.
		 */
		getMessage():string|null
		{
			return this.message ?? null;
		}

		/**
		 * Returns a human-readable string indicating the time of the log entry.
		 */
		getTimeStamp():string|null
		{
			return this.timeStamp ?? null;
		}

		toString():string
		{
			return '[object LogEvent]';
		}
	}
}

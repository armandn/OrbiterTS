///<reference path="NumericFormatter.ts"/>
namespace net.user1.logger
{
	import NumericFormatter = net.user1.utils.NumericFormatter;

	/**
	 * The Logger class manages Orbiter's client-side log, which records client/server
	 * communications and events of general interest for the purposes of debugging. To access
	 * Orbiter's Logger instance, use the [[Orbiter.getLog]] method.
	 *
	 * To read the log's history of log entries, use the getHistory() method. To be notified
	 * whenever a new message is added to the log, use addEventListener() to register for the
	 * LogEvent.UPDATE event.
	 *
	 * To add new messages to the log, use the fatal(), error(), warn(), info(), or debug() methods.
	 * An application's most important log messages should be added via fatal(); least important
	 * messages should be added via debug().
	 */
	export class Logger extends net.user1.events.EventDispatcher
	{
		static readonly DEBUG = 'DEBUG';
		static readonly ERROR = 'ERROR';
		static readonly FATAL = 'FATAL';
		static readonly INFO = 'INFO';
		static readonly WARN = 'WARN';

		static readonly logLevels = [
			Logger.FATAL, Logger.ERROR, Logger.WARN, Logger.INFO, Logger.DEBUG
		];
		private historyLength:number = 0;
		private logLevel:number = 0;
		private messages:string[] = [];
		private suppressionTerms:string[] = [];
		private timeStampEnabled:boolean = false;

		constructor(historyLength:number = 100)
		{
			super();

			this.setHistoryLength(historyLength);
			this.enableTimeStamp();
			this.setLevel(Logger.INFO);
		}

		/**
		 * Forces the log to ignore entries containing the specified term.
		 * @param term The term to match.
		 */
		addSuppressionTerm(term:string):void
		{
			this.debug(`Added suppression term. Log messages containing '${term}' will now be ignored.`);
			this.suppressionTerms.push(term);
		}

		/**
		 * Sends a message to the log, with severity "DEBUG".
		 */
		debug(msg:string):void
		{
			this.addEntry(4, net.user1.logger.Logger.DEBUG, msg);
		}

		/**
		 * Hides the time stamp on subsequent messages.
		 */
		disableTimeStamp():void
		{
			this.timeStampEnabled = false;
		}

		/**
		 * Adds a time stamp to all subsequent messages.
		 */
		enableTimeStamp():void
		{
			this.timeStampEnabled = true;
		}

		/**
		 * Sends a message to the log, with severity "ERROR".
		 */
		error(msg:string):void
		{
			this.addEntry(1, net.user1.logger.Logger.ERROR, msg);
		}

		/**
		 * Sends a message to the log, with severity "FATAL".
		 */
		fatal(msg:string):void
		{
			this.addEntry(0, net.user1.logger.Logger.FATAL, msg);
		}

		/**
		 * Returns all messages in the log's history.
		 */
		getHistory():string[]
		{
			return this.messages.slice(0);
		}

		/**
		 * Returns the number of messages that are kept in the log's history. Defaults to 100.
		 */
		getHistoryLength():number
		{
			return this.historyLength;
		}

		/**
		 * Returns the human-readable message filter level for the log.
		 */
		getLevel():string
		{
			return net.user1.logger.Logger.logLevels[this.logLevel];
		}

		/**
		 * Sends a message to the log, with severity "INFO".
		 */
		info(msg:string):void
		{
			this.addEntry(3, net.user1.logger.Logger.INFO, msg);
		}

		/**
		 * Instructs the log to stop ignoring entries containing the specified term.
		 *
		 * @param term The term to match.
		 * @return true if the term was removed; false if the term was not found.
		 */
		removeSuppressionTerm(term:string):boolean
		{
			const termIndex = this.suppressionTerms.indexOf(term);
			if (termIndex != -1)
			{
				this.suppressionTerms.splice(termIndex, 1);
				this.debug(`Removed suppression term. Log messages containing '${term}' will now be shown.`);
				return true;
			}
			return false;
		}

		/**
		 * Sets the message filter level for the log. The supplied level must be
		 * one of the following Logger constants: Logger.FATAL, Logger.ERROR,
		 * Logger.WARN, Logger.INFO, or Logger.DEBUG. Log levels are ranked in order,
		 * with FATAL being most severe and DEBUG being least severe. Messages that
		 * are less severe than the filter level set via setLevel() are excluded from
		 * the log. For example, if the filter level is set to Logger.DEBUG, all messages
		 * are included in the log. If the filter level is set to Logger.WARN, messages
		 * sent via Logger's debug() and info() methods are excluded from the log,
		 * but messages sent via Logger's error(), warn(), and fatal() methods are
		 * included in the log. The default log level is Logger.INFO (exclude DEBUG
		 * messages only).
		 */
		setLevel(level:string):void
		{
			if (level != undefined)
			{
				for (let i = 0; i < Logger.logLevels.length; i++)
				{
					if (Logger.logLevels[i].toLowerCase() == level.toLowerCase())
					{
						this.logLevel = i;
						this.dispatchEvent(new LogEvent(LogEvent.LEVEL_CHANGE, undefined, level));
						return;
					}
				}
			}

			this.warn('Invalid log level specified: ' + level);
		}

		toString():string
		{
			return '[object Logger]';
		}

		/**
		 * Sends a message to the log, with severity "WARN".
		 */
		warn(msg:string):void
		{
			this.addEntry(2, net.user1.logger.Logger.WARN, msg);
		}

		private addEntry(level:number, levelName:string, msg:string):void
		{
			let timeStamp = '',
			    time:Date;

			// Abort if the log's level is lower than the message's level.
			if (this.logLevel < level)
			{
				return;
			}

			// Don't log messages if they contain any of the suppression terms.
			for (let i = this.suppressionTerms.length; --i >= 0;)
			{
				if (msg.indexOf(this.suppressionTerms[i]) != -1)
				{
					return;
				}
			}

			if (this.timeStampEnabled)
			{
				time = new Date();
				timeStamp = time.getMonth() + 1 + '/' + String(time.getDate()) + '/' + String(time.getFullYear()).substr(2) + ' ' + NumericFormatter.dateToLocalHrMinSecMs(time) + ' UTC' + (time.getTimezoneOffset() >= 0 ? '-' : '+') + Math.abs(time.getTimezoneOffset() / 60);
			}

			// Log the message.
			this.addToHistory(levelName, msg, timeStamp);

			const e = new LogEvent(LogEvent.UPDATE, msg, levelName, timeStamp);
			this.dispatchEvent(e);
		}

		private addToHistory(level:string, msg:string, timeStamp:string):void
		{
			this.messages.push(`${timeStamp}${timeStamp == '' ? '' : ' '}${level}: ${msg}`);
			if (this.messages.length > this.historyLength)
			{
				this.messages.shift();
			}
		}

		/**
		 * Specifies the number of messages that should be kept in the log's history.
		 */
		setHistoryLength(newHistoryLength:number):void
		{
			this.historyLength = newHistoryLength;

			if (this.messages.length > this.historyLength)
			{
				this.messages.splice(this.historyLength);
			}
		}
	}
}

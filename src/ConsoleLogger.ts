namespace net.user1.logger
{
	/**
	 * @internal
	 */
	export class ConsoleLogger
	{
		constructor(private log:Logger)
		{
			this.log.addEventListener(LogEvent.UPDATE, net.user1.logger.ConsoleLogger.updateListener, this);

			// Print all messages already in the log
			const history = this.log.getHistory();
			for (let i = 0; i < history.length; i++)
			{
				net.user1.logger.ConsoleLogger.out(history[i]);
			}
		}

		private static updateListener(e:LogEvent):void
		{
			const timeStamp   = e.getTimeStamp(),
			      level       = e.getLevel(),
			      bufferSpace = (level == Logger.INFO || level == Logger.WARN) ? " " : "";

			net.user1.logger.ConsoleLogger.out(`${timeStamp}${timeStamp == "" ? "" : " "}${e.getLevel()}: ${bufferSpace}${e.getMessage()}`);
		}

		private static out(value:string):void
		{
			console?.log(value);
		}

		dispose():void
		{
			this.log.removeEventListener(LogEvent.UPDATE, net.user1.logger.ConsoleLogger.updateListener, this);

			// @ts-ignore
			this.log = null;
		}
	}
}

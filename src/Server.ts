namespace net.user1.orbiter
{
	import Logger = net.user1.logger.Logger;

	/**
	 * Provides access to global server data and functions, and a means of communicating with server
	 * modules. To access the Server object, use getServer()
	 */
	export class Server extends net.user1.events.EventDispatcher
	{
		private log:Logger;
		private version:string = '';
		private upcVersion!:VersionNumber;
		private localAgeAtLastSync:number = NaN;
		private lastKnownServerTime:number = NaN;
		private _isWatchingForProcessedUPCs:boolean = false;

		constructor(private readonly orbiter:Orbiter)
		{
			super();
			this.log = this.orbiter.getLog();
			this.orbiter.addEventListener(OrbiterEvent.READY, this.readyListener, this);
		}

		/**
		 * @internal
		 */
		cleanup():void
		{
			this.log.info('[SERVER] Cleaning resources.');
			this.setIsWatchingForProcessedUPCs(false);
		}

		/**
		 * Asks the server to remove all current module class definitions from memory. Subsequently
		 * instantiated modules will use the newly loaded module class definitions, allowing module
		 * developers to update Union Server's modules at runtime without restarting the server.
		 * Note that currently running modules are not reloaded. For example, if a room module is
		 * already active for a room, `clearModuleCache()` will not affect that module. If the
		 * active module's class file has changed and `clearModuleCache()` is invoked, then the new
		 * class definition will not be used until the next time the room is removed and recreated.
		 *
		 * The `clearModuleCache()` method does not affect script modules. Union Server always uses
		 * the latest version of all script modules on disk, so there is no script module cache to
		 * clear.
		 */
		clearModuleCache():void
		{
			this.orbiter.getMessageManager().sendUPC(UPC.CLEAR_MODULE_CACHE);
		}

		/**
		 * @internal
		 */
		dispatchResetUPCStatsResult(status:string):void
		{
			this.dispatchEvent(new ServerEvent(ServerEvent.RESET_UPC_STATS_RESULT, null, status));
		}

		/**
		 * @internal
		 */
		dispatchStopWatchingForProcessedUPCsResult(status:string):void
		{
			this.dispatchEvent(new ServerEvent(ServerEvent.STOP_WATCHING_FOR_PROCESSED_UPCS_RESULT, null, status));
		}

		/**
		 * @internal
		 */
		dispatchUPCProcessed(record:UPCProcessingRecord):void
		{
			this.dispatchEvent(new ServerEvent(ServerEvent.UPC_PROCESSED, record));
		}

		/**
		 * @internal
		 */
		dispatchWatchForProcessedUPCsResult(status:string):void
		{
			this.dispatchEvent(new ServerEvent(ServerEvent.WATCH_FOR_PROCESSED_UPCS_RESULT, null, status));
		}

		/**
		 * @internal
		 */
		fireTimeSync():void
		{
			this.dispatchEvent(new ServerEvent(ServerEvent.TIME_SYNC));
		}

		/**
		 * Returns the approximate current time on the server in UTC, using "milliseconds from
		 * January 1 1970" format. The time is approximated by adding the following two values:
		 * - The last time sent by the server (either the connection time or the last response to
		 *   `syncTime()`).
		 * - The number of milliseconds elapsed on the client side since the server's time was last
		 *   received

		 * To retrieve the most accurate possible approximation, first call `syncTime()`, then call
		 * `getServerTime()` from within the `ServerEvent.TIME_SYNC` callback.
		 */
		getServerTime():number
		{
			const self = this.orbiter.self();
			let lastServerTime      = NaN,
			    estimatedServerTime = NaN;

			if (self != null)
			{
				lastServerTime = isNaN(this.lastKnownServerTime) ? self.getConnectTime() ?? 0 : this.lastKnownServerTime;

				estimatedServerTime = isNaN(lastServerTime) ? NaN : (lastServerTime + (new Date().getTime() - this.localAgeAtLastSync));
			}

			if (estimatedServerTime == 0)
				this.log.warn('Server time requested, but is unknown.');

			return estimatedServerTime;
		}

		/**
		 * Returns the version of the UPC protocol in use by Union Server.
		 */
		getUPCVersion():VersionNumber
		{
			return this.upcVersion;
		}

		/**
		 * Returns the version of the Union Server to which Orbiter is currently connected.
		 */
		getVersion():string
		{
			return this.version;
		}

		/**
		 * Indicates whether the current client is currently watching for processed UPCs.
		 */
		isWatchingForProcessedUPCs():boolean
		{
			return this._isWatchingForProcessedUPCs;
		}

		private readyListener(e:OrbiterEvent):void
		{
			this.orbiter.getMessageManager().addMessageListener(UPC.SERVER_TIME_UPDATE, this.u50);
			this.localAgeAtLastSync = new Date().getTime();
		}

		/**
		 * Asks Union Server to reset server-side UPC-processing statistics. If the request is
		 * granted, Union Server clears its list of the longest UPC-message-processing times. The
		 * statistics-reset is reflected in any subsequent UPCStatsSnapshot retrieval. By default,
		 * `resetUPCStats()` requires administrator privileges.
		 */
		resetUPCStats():void
		{
			this.orbiter.getMessageManager().sendUPC(UPC.RESET_UPC_STATS);
		}

		/**
		 * Sends a message to the entire server. To receive the message, recipient clients must
		 * register a message listener via MessageManager's addMessageListener() method.
		 *
		 * @param messageName  The name of the message to invoke.
		 * @param includeSelf Indicates whether to send the message to the current client (i.e., the
		 *                    client that invoked sendMessage()). Defaults to false (don't echo to
		 *                    the sender).
		 * @param filters Specifies one or more filters for the message. A filter specifies a
		 *                requirement that each client must meet in order to receive the message.
		 *                For example, a filter might indicate that only those clients with the
		 *                attribute "team" set to "red" should receive the message. For complete
		 *                details, see the Filter class. If filters is null, all clients on the
		 *                server receive the message.
		 * @param rest    An optional comma-separated list of string arguments for the message.
		 *                These will be passed to any listeners registered to receive the message.
		 *                See MessageManager's addMessageListener() method.
		 */
		sendMessage(messageName:string, includeSelf:boolean=false, filters?:net.user1.orbiter.filters.Filter, ...rest:string[]):void
		{
			if (messageName == null || messageName == '')
			{
				this.log.warn('Server.sendMessage() failed. No messageName supplied.');
				return;
			}

			const msgMan = this.orbiter.getMessageManager(),
			      args = [
						      net.user1.orbiter.UPC.SEND_MESSAGE_TO_SERVER,
						      messageName,
						      includeSelf.toString(),
						      filters?.toXMLString() ?? ''
						];

			msgMan.sendUPC(UPC.SEND_MESSAGE_TO_SERVER, messageName, includeSelf.toString(), filters?.toXMLString() ?? '', ...rest);
		}

		/**
		 * Sends the specified message to the specified server module.
		 * @param moduleID         The ID of the module to which the message will be sent. Modules
		 *                         are assigned IDs in the server's union.xml configuration file.
		 * @param messageName      The name of the message to send.
		 * @param messageArguments The message arguments, specified as dynamic instance variables on
		 *                         a generic object.
		 */
		sendModuleMessage(moduleID:string, messageName:string, messageArguments:{[key:string]:string}):void
		{
			const sendupcArgs = [];
			for (let arg in messageArguments)
			{
				sendupcArgs.push(arg + Tokens.RS + messageArguments[arg]);
			}

			this.orbiter.getMessageManager().sendUPC(UPC.SEND_SERVERMODULE_MESSAGE, moduleID, messageName, ...sendupcArgs);
		}

		setIsWatchingForProcessedUPCs(value:boolean):void
		{
			this._isWatchingForProcessedUPCs = value;
		}

		/**
		 * @internal
		 * @param {net.user1.orbiter.VersionNumber} value
		 */
		setUPCVersion(value:VersionNumber):void
		{
			this.upcVersion = value;
		}

		/**
		 * @internal
		 * @param {string} value
		 */
		setVersion(value:string):void
		{
			this.version = value;
		}

		/**
		 * Asks the server to stop sending UPC-processing notifications. By default,
		 * `stopWatchingForProcessedUPCs()` requires administrator privileges.
		 */
		stopWatchingForProcessedUPCs():void
		{
			this.orbiter.getMessageManager().sendUPC(UPC.STOP_WATCHING_FOR_PROCESSED_UPCS);
		}

		/**
		 * Asks the server to send the current time. When the time is received,
		 * `ServerEvent.TIME_SYNC` fires. Use `getServerTime()` to retrieve the current approximate
		 * time on the server (i.e., the last sync time plus elapsed time on the client). If
		 * `syncTime()` has never been called, `getServerTime()` returns the client connection time
		 * plus time elapsed on the client.
		 */
		syncTime():void
		{
			const msgMan = this.orbiter.getMessageManager();
			msgMan.sendUPC(net.user1.orbiter.UPC.SYNC_TIME);
		}

		private u50(newTime:string):void
		{
			this.lastKnownServerTime = Number(newTime);
			this.localAgeAtLastSync = new Date().getTime();
			this.fireTimeSync();
		}

		/**
		 * Asks the server to notify the current client upon processing any UPC message.
		 * Notifications trigger the `ServerEvent.UPC_PROCESSED` event. Details about each message
		 * processed are provided in a `UPCProcessingRecord` accessible via the ServerEvent's
		 * `getUPCProcessingRecord()` method. By default, `watchForProcessedUPCs()` requires
		 * administrator privileges.
		 */
		watchForProcessedUPCs():void
		{
			this.orbiter.getMessageManager()
			    .sendUPC(net.user1.orbiter.UPC.WATCH_FOR_PROCESSED_UPCS);
		}
	}
}

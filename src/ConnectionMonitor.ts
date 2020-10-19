namespace net.user1.orbiter
{
	/**
	 * The ConnectionMonitor class provides an application heartbeat and automatic disconnection and
	 * reconnection services. By default, the ConnectionMonitor sends a heartbeat every 10 seconds,
	 * and uses it to calculate the client's ping time. If no server response is received for over
	 * 60 seconds (the default), the ConnectionMonitor automatically closes the client connection.
	 * Applications that wish to automatically reconnect after a connection failure must set the
	 * "reconnect frequency" via `setAutoReconnectFrequency()`. ConnectionMonitor does not
	 * automatically reconnect by default.
	 *
	 * Note that the ConnectionMonitor class need not be instantiated directly; instead, each
	 * Orbiter object creates a ConnectionMonitor instance automatically. To retrieve a given
	 * Orbiter object's ConnectionMonitor instance, use the [[Orbiter.getConnectionMonitor]] method.
	 *
	 * The ConnectionMonitor class can detect, and then automatically recover from, a dropped
	 * internet connection.
	 */
	export class ConnectionMonitor
	{
		/**
		 * The default value for the maximum number of reconnection attempts the
		 * ConnectionMonitor will make when automatic reconnection is enabled;
		 * defaults to -1, meaning never stop attempting to reconnect if automatic
		 * reconnection is enabled.
		 */
		static readonly DEFAULT_AUTORECONNECT_ATTEMPT_LIMIT = -1;

		/**
		 * The ConnectionMonitor's default automatic reconnection frequency
		 * setting; defaults to -1 milliseconds, meaning don't attempt to reconnect.
		 */
		static readonly DEFAULT_AUTORECONNECT_FREQUENCY = -1;

		/**
		 * The ConnectionMonitor's default connection-timeout setting; defaults
		 * to 60000 milliseconds (one minute).
		 */
		static readonly DEFAULT_CONNECTION_TIMEOUT = 60000;

		/**
		 * The ConnectionMonitor's default heartbeat setting
		 */
		static readonly DEFAULT_HEARTBEAT_FREQUENCY = 10000;

		/**
		 * The ConnectionMonitor's minimum heartbeat setting
		 */
		static readonly MIN_HEARTBEAT_FREQUENCY = 20;

		private autoReconnectAttemptLimit:number = -1;
		private autoReconnectDelayFirstAttempt:boolean = false;
		private autoReconnectFrequency:number = -1;
		private autoReconnectMaxMS:number = 0;
		private autoReconnectMinMS:number = 0;
		private autoReconnectTimeoutID:number = -1;
		private connectionTimeout:number = 0;
		private disposed:boolean = false;
		private heartBeatFrequency:number = -1;
		private heartbeatCounter:number = 0;
		private heartbeatEnabled:boolean = true;
		private heartbeatIntervalID:number = -1;
		private heartbeats:UDictionary<number> = {}; // Use a dictionary instead of an array because responses might come back out of order
		private log:net.user1.logger.Logger;
		private msgManager:MessageManager;
		private oldestHeartbeat:number = 0;
		private sharedPing:boolean = false;

		constructor(private orbiter:Orbiter)
		{
			// Instance variables

			this.autoReconnectTimeoutID = -1;

			this.msgManager = orbiter.getMessageManager();
			this.log = orbiter.getLog();

			this.orbiter.addEventListener(OrbiterEvent.READY, this.connectReadyListener, this);
			this.orbiter.addEventListener(OrbiterEvent.CLOSE, this.connectCloseListener, this);
			this.disableHeartbeatLogging();
		}

		/**
		 * Disables the client-side heartbeat. When the heartbeat is disabled, client
		 * ping time is not calculated, and client-side connection loss (due to,
		 * for example, a disconnected network cable) may go undetected.
		 */
		disableHeartbeat():void
		{
			this.log.info('[CONNECTION_MONITOR] Heartbeat disabled.');
			this.heartbeatEnabled = false;
			this.stopHeartbeat();
		}

		/**
		 * Prevents heartbeat-related messages from appearing in the client-side log.
		 */
		disableHeartbeatLogging():void
		{
			this.log.addSuppressionTerm('<A>CLIENT_HEARTBEAT</A>');
			this.log.addSuppressionTerm('<A>_PING</A>');
			this.log.addSuppressionTerm('[_PING]');
			this.log.addSuppressionTerm('<![CDATA[_PING]]>');
		}

		/**
		 * Permanently disables this ConnectionMonitor.
		 */
		dispose():void
		{
			this.disposed = true;

			this.stopHeartbeat();
			this.stopReconnect();

			// @ts-ignore
			this.heartbeats = null;

			this.orbiter.removeEventListener(OrbiterEvent.READY, this.connectReadyListener, this);
			this.orbiter.removeEventListener(OrbiterEvent.CLOSE, this.connectCloseListener, this);
			// @ts-ignore
			this.orbiter = null;
			//this.msgManager.removeMessageListener('u7', this.u7);
			// @ts-ignore
			this.msgManager = null;
			// @ts-ignore
			this.log = null;
		}

		/**
		 * Enables the client-side heartbeat, used to calculate ping time and
		 * to detect connection loss. Note that ConnectionMonitor's heartbeat is
		 * enabled by default, so enableHeartbeat() is required only when resuming a
		 * heartbeat that has been disabled via [[disableHeartbeat]].
		 */
		enableHeartbeat():void
		{
			this.log.info('[CONNECTION_MONITOR] Heartbeat enabled.');
			this.heartbeatEnabled = true;
			this.startHeartbeat();
		}

		/**
		 * Allows heartbeat-related messages to appear in the client-side log.
		 */
		enableHeartbeatLogging():void
		{
			this.log.removeSuppressionTerm('<A>CLIENT_HEARTBEAT</A>');
			this.log.removeSuppressionTerm('<A>_PING</A>');
			this.log.removeSuppressionTerm('[_PING]');
			this.log.removeSuppressionTerm('<![CDATA[_PING]]>');
		}

		/**
		 * Returns the number of times Orbiter will attempt to reconnect to Union Server
		 * when automatic reconnection is enabled.
		 */
		getAutoReconnectAttemptLimit():number
		{
			return this.autoReconnectAttemptLimit;
		}

		/**
		 * Returns the number of milliseconds between reconnection attempts made when
		 * the connection to Union Server is lost. The return of
		 * getAutoReconnectFrequency() is always an integer between the minMS and maxMS
		 * values supplied to the most recent call to setAutoReconnectFrequency(),
		 * inclusive.
		 */
		getAutoReconnectFrequency():number
		{
			return this.autoReconnectFrequency;
		}

		/**
		 * Returns the maximum round-trip time allowed for a heartbeat before the
		 * client considers the connection lost and forces a disconnection.
		 */
		getConnectionTimeout():number
		{
			return this.connectionTimeout;
		}

		/**
		 * Returns the number of milliseconds between application heartbeats.
		 */
		getHeartbeatFrequency():number
		{
			return this.heartBeatFrequency;
		}

		/**
		 * Indicates whether the current client's ping is currently shared with other clients.
		 */
		isPingShared():boolean
		{
			return this.sharedPing;
		}

		/**
		 * Sets the monitor to its default configuration.
		 */
		restoreDefaults():void
		{
			this.setAutoReconnectFrequency(ConnectionMonitor.DEFAULT_AUTORECONNECT_FREQUENCY);
			this.setAutoReconnectAttemptLimit(ConnectionMonitor.DEFAULT_AUTORECONNECT_ATTEMPT_LIMIT);
			this.setConnectionTimeout(ConnectionMonitor.DEFAULT_CONNECTION_TIMEOUT);
			this.setHeartbeatFrequency(ConnectionMonitor.DEFAULT_HEARTBEAT_FREQUENCY);
		}

		/**
		 * Specifies the number of times Orbiter should attempt to reconnect to
		 * Union Server when automatic reconnection is enabled. Defaults to -1
		 * (no limit), which causes Orbiter to keep retrying to connect indefinitely
		 * until a connection is established. To enable automatic reconnection, use
		 * [[ConnectionMonitor.setAutoReconnectFrequency]] method.
		 */
		setAutoReconnectAttemptLimit(attempts:number):void
		{
			if (attempts < -1 || attempts == 0)
			{
				this.log.warn(`[CONNECTION_MONITOR] Invalid Auto-reconnect attempt limit specified: ${attempts}. Limit must -1 or greater than 1.`);
				return;
			}

			this.autoReconnectAttemptLimit = attempts;

			if (attempts == -1)
			{
				this.log.info('[CONNECTION_MONITOR] Auto-reconnect attempt limit set to none.');
			}
			else
			{
				this.log.info(`[CONNECTION_MONITOR] Auto-reconnect attempt limit set to ${attempts} attempt(s).`);
			}
		}

		/**
		 * Specifies the number of milliseconds between reconnection attempts made when
		 * the connection to Union Server is lost. When minMS is a positive integer
		 * and maxMS is greater than minMS, the actual number of milliseconds between
		 * reconnection attempts is selected randomly upon disconnection, as an
		 * integer between minMS and maxMS. The randomly selected reconnection
		 * frequency is used until the next successful disconnection. For example,
		 * if minMS is 7000, maxMS is 20000, and the randomly selected delay
		 * following a disconnection is 9000, then connection attempts will occur at
		 * 9000 ms, 18,000 ms, 27,000 ms, and so on until the client successfully
		 * reconnects. If the client disconnects again, a new value between 7000
		 * and 20000 will be selected as the reconnection frequency. Must be
		 * greater than 0. Values under 5000 ms are not recommended.
		 *
		 * The random selection of reconnection frequency prevents heavy
		 * simultaneous connection load during application outages. Without
		 * random reconnection frequency selection, if Union Server forcibly
		 * disconnected enough clients at the same time, and those clients were
		 * configured to attempt reconnection upon disconnection, the simultaneous
		 * reconnection attempts made by the disconnected clients could stress
		 * Union Server beyond capacity. Load can be reduced by configuring clients
		 * to reconnect after a random delay within a specified range rather than
		 * at identical intervals.
		 *
		 * If minMS is set to -1 (the default), ConnectionMonitor will not
		 * automatically attempt to reconnect to Union Server. If an automatic
		 * reconnect attempt is currently in progress when a new reconnect attempt
		 * is scheduled to start, the existing attempt will be aborted before the
		 * new attempt starts. Therefore, on a typical internet connection, where
		 * a connection to Union server can take anywhere from 50 milliseconds to
		 * 10 seconds, setting minMS to anything lower than 5000
		 * milliseconds can cause potentially successful connection attempts to
		 * be prematurely aborted. Use caution when applying low automatic
		 * reconnection frequencies.
		 *
		 * @param minMS The minimum number of milliseconds that must elapse between attempts.
		 *
		 * @param maxMS The maximum number of milliseconds that can elapse between reconnection
		 *              attempts. When not specified, maxMS defaults to the value specified by minMS
		 *              (i.e., no random value will be selected). Must be greater than or equal to
		 *              maxMS.
		 *
		 * @param delayFirstAttempt: When true, upon first disconnection after a successful
		 *                           connection, the client will wait the amount of time specified
		 *                           by minMS and maxMS before attempting to reconnect. When false,
		 *                           upon first disconnection after a successful connection, the
		 *                           client will attempt to reconnect immediately.
		 */
		setAutoReconnectFrequency(minMS:number, maxMS?:number, delayFirstAttempt?:boolean):void
		{
			maxMS = (typeof maxMS == 'undefined') ? -1 : maxMS;
			delayFirstAttempt = (typeof delayFirstAttempt == 'undefined') ? false : delayFirstAttempt;

			if (minMS == 0 || minMS < -1)
			{
				this.log.warn(`[CONNECTION_MONITOR] Invalid auto-reconnect minMS specified: [${minMS}]. Value must not be zero or less than -1. Value adjusted to [-1] (no reconnect).`);
				minMS = -1;
			}
			if (minMS == -1)
			{
				this.stopReconnect();
			}
			else
			{
				if (maxMS == -1)
				{
					maxMS = minMS;
				}
				if (maxMS < minMS)
				{
					this.log.warn(`[CONNECTION_MONITOR] Invalid auto-reconnect maxMS specified: [${maxMS}]. Value of maxMS must be greater than or equal to minMS. Value adjusted to [${minMS}].`);
					maxMS = minMS;
				}
			}

			this.autoReconnectDelayFirstAttempt = delayFirstAttempt;
			this.autoReconnectMinMS = minMS;
			this.autoReconnectMaxMS = maxMS;

			this.log.info(`[CONNECTION_MONITOR] Assigning auto-reconnect frequency settings: [minMS: ${minMS}, maxMS: ${maxMS}, delayFirstAttempt: ${delayFirstAttempt.toString()}].`);
			if (minMS > 0 && minMS < 1000)
			{
				this.log.info(`[CONNECTION_MONITOR] RECONNECT FREQUENCY WARNING: ${minMS} minMS specified. Current frequency will cause ${(Math.floor((1000 / minMS) * 10) / 10).toString()} reconnection attempts per second.`);
			}
			this.selectReconnectFrequency();
		}

		/**
		 * Sets the maximum round-trip time allowed for a heartbeat before the client considers the
		 * connection lost and forces a disconnection. Defaults to 60 seconds (60000 ms).
		 *
		 * The connection timeout is checked immediately before each heartbeat is sent. At
		 * heartbeat-send time, if the oldest heartbeat has not received a response and the
		 * connection timeout has elapsed, Orbiter disconnects.
		 *
		 * @param milliseconds The maximum round-trip time allowed for a single heartbeat message,
		 *                     in milliseconds.
		 */
		setConnectionTimeout(milliseconds:number):void
		{
			if (milliseconds > 0)
			{
				this.connectionTimeout = milliseconds;
				this.log.info(`[CONNECTION_MONITOR] Connection timeout set to ${milliseconds} ms.`);
			}
			else
			{
				this.log.warn(`[CONNECTION_MONITOR] Invalid connection timeout specified: ${milliseconds}. Frequency must be greater than zero.`);
			}
		}

		/**
		 * Sets the frequency of the application's "heartbeat". For each heartbeat, the client
		 * attempts to send a message to itself via the server. If the attempt succeeds, the client
		 * sets its current ping time to the message round-trip time.
		 *
		 * The ConnectionMonitor's heartbeat frequency defaults to one heartbeat every ten seconds.
		 * To disable the ConnectionMonitor's heartbeat completely, invoke [[disableHeartbeat]].
		 *
		 * When heartbeating is enabled in an application, if the ConnectionMonitor's current
		 * connection timeout is set to a positive value, then failure to receive a heartbeat
		 * message within the specified connection timeout triggers an automatic client-side
		 * disconnect.
		 *
		 * @param milliseconds The number of milliseconds between heartbeats.
		 */
		setHeartbeatFrequency(milliseconds:number):void
		{
			if (milliseconds >= ConnectionMonitor.MIN_HEARTBEAT_FREQUENCY)
			{
				this.heartBeatFrequency = milliseconds;
				this.log.info(`[CONNECTION_MONITOR] Heartbeat frequency set to ${milliseconds} ms.`);

				// Log a warning for low heartbeat frequencies...
				if (milliseconds >= ConnectionMonitor.MIN_HEARTBEAT_FREQUENCY && milliseconds < 1000)
				{
					this.log.info(`[CONNECTION_MONITOR] HEARTBEAT FREQUENCY WARNING: ${milliseconds} ms. Current frequency will generate ${Math.floor((1000 / milliseconds) * 10) / 10} messages per second per connected client.`);
				}

				// If the connection is ready, then restart
				// the heartbeat when the heartbeat frequency changes.
				if (this.orbiter.isReady())
				{
					this.startHeartbeat();
				}
			}
			else
			{
				this.log.warn(`[CONNECTION_MONITOR] Invalid heartbeat frequency specified: ${milliseconds}. Frequency must be ${ConnectionMonitor.MIN_HEARTBEAT_FREQUENCY} or greater.`);
			}
		}

		/**
		 * Specifies whether the current client's ping should automatically be shared with
		 * other clients. By default, a client's ping time is not shared with
		 * other clients. When this client's ping is shared, other clients can
		 * retrieve its value via [[Client.getPing]] method.
		 */
		sharePing(share:boolean):void
		{
			this.sharedPing = share;
		}

		private connectCloseListener(e:OrbiterEvent):void
		{
			this.stopHeartbeat();

			const numAttempts = this.orbiter.getConnectionManager().getConnectAttemptCount();
			if (numAttempts == 0)
			{
				this.selectReconnectFrequency();
			}

			if (this.autoReconnectFrequency > -1)
			{
				if (this.autoReconnectTimeoutID != -1)
				{
					return;
				}
				else
				{
					// Defer reconnection until after all other listeners have processed the
					// CLOSE event
					//var self = this;
					setTimeout(()=>
					           {
						           // If another listener disposed of Orbiter, or disabled autoreconnect, quit
						           if (!this.disposed && this.autoReconnectFrequency != -1)
						           {
							           this.log.warn('[CONNECTION_MONITOR] Disconnection detected.');
							           if (this.autoReconnectDelayFirstAttempt && ((numAttempts == 0) || (numAttempts == 1 && this.orbiter.getConnectionManager().getReadyCount() == 0)))
							           {
								           this.log.info(`[CONNECTION_MONITOR] Delaying reconnection attempt by ${this.autoReconnectFrequency} ms...`);
								           this.scheduleReconnect(this.autoReconnectFrequency);
							           }
							           else
							           {
								           this.doReconnect();
							           }
						           }
					           }, 1);
				}
			}
		}

		private connectReadyListener(e:OrbiterEvent):void
		{
			this.msgManager.addMessageListener(Messages.CLIENT_HEARTBEAT, this.heartbeatMessageListener, this);
			this.startHeartbeat();
			this.stopReconnect();
		}

		private doReconnect():void
		{
			const numActualAttempts = this.orbiter.getConnectionManager().getConnectAttemptCount();
			let numReconnectAttempts;

			if (this.orbiter.getConnectionManager().getReadyCount() == 0)
			{
				numReconnectAttempts = numActualAttempts - 1;
			}
			else
			{
				numReconnectAttempts = numActualAttempts;
			}

			if (this.autoReconnectAttemptLimit != -1 && numReconnectAttempts > 0 && numReconnectAttempts % (this.autoReconnectAttemptLimit) == 0)
			{
				this.log.warn(`[CONNECTION_MONITOR] Automatic reconnect attempt limit reached. No further automatic connection attempts will be made until the next manual connection attempt.`);
				return;
			}

			this.scheduleReconnect(this.autoReconnectFrequency);

			this.log.warn(`[CONNECTION_MONITOR] Attempting automatic reconnect. (Next attempt in ${this.autoReconnectFrequency}ms.)`);
			this.orbiter.connect();
		}

		private heartbeatMessageListener(fromClientID:string, id:string):void
		{
			const ping = new Date().getTime() - this.heartbeats[parseInt(id)];
			this.orbiter.self()?.setAttribute('_PING', ping.toString(), undefined, this.sharedPing);
			delete this.heartbeats[parseInt(id)];
		}

		private heartbeatTimerListener():void
		{
			if (!this.orbiter.isReady())
			{
				this.log.info('[CONNECTION_MONITOR] Orbiter is not connected. Stopping heartbeat.');
				this.stopHeartbeat();
				return;
			}

			const now = new Date().getTime();

			this.heartbeats[this.heartbeatCounter] = now;
			this.orbiter.getMessageManager().sendUPC('u2', Messages.CLIENT_HEARTBEAT, this.orbiter.getClientID(), '', this.heartbeatCounter.toString());
			this.heartbeatCounter++;

			// Assign the oldest heartbeat
			if (net.user1.utils.ObjectUtil.len(this.heartbeats) == 1)
			{
				this.oldestHeartbeat = now;
			}
			else
			{
				this.oldestHeartbeat = Number.MAX_VALUE;
				for (const p in this.heartbeats)
				{
					if (this.heartbeats.hasOwnProperty(p) && this.heartbeats[p] < this.oldestHeartbeat)
					{
						this.oldestHeartbeat = this.heartbeats[p];
					}
				}
			}
			// Close connection if too much time has passed since the last response
			let timeSinceOldestHeartbeat = now - this.oldestHeartbeat;
			if (timeSinceOldestHeartbeat > this.connectionTimeout)
			{
				this.log.warn(`[CONNECTION_MONITOR] No response from server in ${timeSinceOldestHeartbeat}ms. Starting automatic disconnect.`);
				this.orbiter.disconnect();
			}
		}

		private reconnectTimerListener():void
		{
			this.stopReconnect();
			if (this.orbiter.getConnectionManager().connectionState == ConnectionState.NOT_CONNECTED)
			{
				this.doReconnect();
			}
		}

		private scheduleReconnect(milliseconds:number):void
		{
			// Reset the timer
			this.stopReconnect();
			this.autoReconnectTimeoutID = setTimeout(()=>this.reconnectTimerListener(), milliseconds);
		}

		private selectReconnectFrequency():void
		{
			if (this.autoReconnectMinMS == -1)
			{
				this.autoReconnectFrequency = -1;
			}
			else if (this.autoReconnectMinMS == this.autoReconnectMaxMS)
			{
				this.autoReconnectFrequency = this.autoReconnectMinMS;
			}
			else
			{
				this.autoReconnectFrequency = getRandInt(this.autoReconnectMinMS, this.autoReconnectMaxMS);
				this.log.info(`[CONNECTION_MONITOR] Random auto-reconnect frequency selected: [${this.autoReconnectFrequency}] ms.`);
			}

			function getRandInt(min:number, max:number)
			{
				return min + Math.floor(Math.random() * (max + 1 - min));
			}
		}

		private startHeartbeat():void
		{
			if (!this.heartbeatEnabled)
			{
				this.log.info('[CONNECTION_MONITOR] Heartbeat is currently disabled. Ignoring start request.');
				return;
			}

			this.stopHeartbeat();

			this.heartbeats = {};

			this.heartbeatIntervalID = setInterval(()=>this.heartbeatTimerListener(), this.heartBeatFrequency);
		}

		private stopHeartbeat():void
		{
			clearInterval(this.heartbeatIntervalID);
			// @ts-ignore
			this.heartbeats = undefined;
		}

		private stopReconnect():void
		{
			clearTimeout(this.autoReconnectTimeoutID);
			this.autoReconnectTimeoutID = -1;
		}

	}
}

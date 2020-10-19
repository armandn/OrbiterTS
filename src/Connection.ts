namespace net.user1.orbiter
{
	/**
	 * Connection is the abstract superclass of [[HTTPConnection]] and [[WebSocketConnection]];
	 * it is used internally, and is not intended for direct use by developers. For information on
	 * communication with Union Server, see connect() method, the WebSocketConnection class and the
	 * HTTPDirectConnection and HTTPIFrameConnection classes.
	 *
	 * The Connection class dispatches the following events:
	 * - ConnectionEvent.BEGIN_CONNECT
	 * - ConnectionEvent.BEGIN_HANDSHAKE
	 * - ConnectionEvent.READY
	 * - ConnectionEvent.CONNECT_FAILURE
	 * - ConnectionEvent.CLIENT_KILL_CONNECT
	 * - ConnectionEvent.SERVER_KILL_CONNECT
	 * - ConnectionEvent.DISCONNECT
	 * - ConnectionEvent.RECEIVE_UPC
	 * - ConnectionEvent.SEND_DATA
	 * - ConnectionEvent.RECEIVE_DATA
	 * - ConnectionEvent.SESSION_TERMINATED
	 * - ConnectionEvent.SESSION_NOT_FOUND
	 */
	export class Connection extends net.user1.events.EventDispatcher implements IConnection
	{
		protected connectionState:number;
		protected connectionType?:string;
		protected disposed:boolean = false;
		protected host?:string;
		protected orbiter?:Orbiter;
		protected port?:number;
		protected requestedHost?:string;

		private connectAbortCount:number = 0;
		private connectAttemptCount:number = 0;
		private mostRecentConnectAchievedReady:boolean = false;
		private mostRecentConnectTimedOut:boolean = false;
		private readyCount:number = 0;
		private readyTimeout:number = 0;
		private readyTimeoutID:number = 0;

		constructor(host?:string, port?:number, private type?:string)
		{
			super();

			this.setServer(host, port);
			this.connectionState = ConnectionState.NOT_CONNECTED;
		}

		applyAffinity(data?:any):void
		{
			const affinityAddress = this.orbiter?.getConnectionManager().getAffinity(this.requestedHost ?? '');
			if (affinityAddress == this.requestedHost)
			{
				this.orbiter?.getLog().info(`${this.toString()} No affinity address found for requested host [${this.requestedHost}]. Using requested host for next connection attempt.`);
			}
			else
			{
				this.orbiter?.getLog().info(`${this.toString()} Applying affinity address [${affinityAddress}] for supplied host [${this.requestedHost}].`);
			}
			this.host = affinityAddress;
		}

		/**
		 * Attempts to connect to Union Server at the current host and port. The result of the
		 * attempt is reported via ConnectionEvent.READY and ConnectionEvent.CONNECT_FAILURE events.
		 *
		 * The connect() method is not normally intended for direct use.
		 */
		connect():void
		{
			this.disconnect();
			this.applyAffinity();
			this.orbiter?.getLog().info(`${this.toString()} Attempting connection...`);
			this.connectAttemptCount++;
			this.mostRecentConnectAchievedReady = false;
			this.mostRecentConnectTimedOut = false;
			this.connectionState = ConnectionState.CONNECTION_IN_PROGRESS;
			// Start the ready timer. Ready state must be achieved before the timer
			// completes or the connection will auto-disconnect.
			this.startReadyTimer();
			this.dispatchBeginConnect();
		}

		/**
		 * Closes the connection to Union Server.
		 *
		 * The disconnect() method is not normally intended for direct use.
		 */
		disconnect():void
		{
			const state:number = this.connectionState;

			if (state != ConnectionState.NOT_CONNECTED)
			{
				this.deactivateConnection();

				if (state == ConnectionState.CONNECTION_IN_PROGRESS)
				{
					this.connectAbortCount++;
					this.dispatchConnectFailure('Client closed connection before READY state was achieved.');
				}
				else
				{
					this.dispatchClientKillConnect();
				}
			}
		}

		/**
		 * Returns the host on which the connection will be opened or has been opened.
		 * @return {string | null} The host name or ip, as a string.
		 */
		getHost():string|null
		{
			return this.host ?? this.getRequestedHost();
		}

		/**
		 * Returns the port on which the connection will be opened or has been opened.
		 * @return {number | null} A number from 1 to 65535.
		 */
		getPort():number|null
		{
			return this.port ?? null;
		}

		/**
		 * Returns the host that was requested for this connection via setServer(). If that host is
		 * a load balancing DNS server, the actual host used for the connection (as returned by
		 * getHost()) might differ from the requested host.
		 * @return {string | null} The requested host name or ip, as a string.
		 */
		getRequestedHost():string|null
		{
			return this.requestedHost ?? null;
		}

		/**
		 * Returns the type of the connection, as one of the types specified by the ConnectionType
		 * class.
		 * @return {string | null} A string representing the connection type.
		 */
		getType():string|null
		{
			return this.connectionType ?? null;
		}

		/**
		 * Indicates whether this connection is currently in a "ready" state.
		 * @return {boolean}
		 */
		isReady():boolean
		{
			return this.connectionState == net.user1.orbiter.ConnectionState.READY;
		}

		/**
		 * Indicates whether this connection is considered valid. Valid connections are those that
		 * are currently in a "ready" state, or are currently disconnected but successfully achieved
		 * a "ready" state in the most recent connection attempt.
		 * @return {boolean}
		 */
		isValid():boolean
		{
			if (this.mostRecentConnectAchievedReady)
			{
				this.orbiter?.getLog().debug(`${this} Connection is valid because its last connection attempt succeeded.`);
				return true;
			}

			if (this.connectAttemptCount == 0)
			{
				this.orbiter?.getLog().debug(`${this} Connection is valid because it has either never attempted to connect, or has not attempted to connect since its last successful connection.`);
				return true;
			}

			if ((this.connectAttemptCount > 0) &&
			    (this.connectAttemptCount == this.connectAbortCount) &&
			    !this.mostRecentConnectTimedOut)
			{
				this.orbiter?.getLog().debug(`${this} Connection is valid because either all connection attempts ever or all connection attempts since its last successful connection were aborted before the ready timeout was reached.`);
				return true;
			}

			this.orbiter?.getLog().debug(`${toString()} Connection is not valid; its most recent connection failed to achieve a ready state.`);
			return false;
		}

		/**
		 * Sends the specified data to Union Server.
		 * The send() method is not intended for direct use.
		 * @param data
		 */
		send(data:any)
		{
		}

		/**
		 * Assigns the Orbiter object for which this IConnection will provide server communication
		 * services. This method is invoked automatically by the ConnectionManager when the
		 * Connection object is added to the ConnectionManager's connection list.
		 * @param {Orbiter} orbiter
		 */
		setOrbiter(orbiter:Orbiter):void
		{
			if (this.orbiter)
			{
				this.orbiter.getMessageManager().removeMessageListener('u63', this.u63);
				this.orbiter.getMessageManager().removeMessageListener('u66', this.u66);
				this.orbiter.getMessageManager().removeMessageListener('u84', this.u84);
				this.orbiter.getMessageManager().removeMessageListener('u85', this.u85);
			}
			this.orbiter = orbiter;
		}

		/**
		 * Assigns the host and port to use with the connect() method.
		 * @param {string} host The server address (typically an IP address or domain name).
		 * @param {number} port A port number between 1 and 65536. Note that ports from 1-7 are
		 *                      normally reserved for use by the operating system!
		 */
		setServer(host?:string, port?:number):void
		{
			this.requestedHost = host;

			// Check for valid ports
			if (port && (port < 1 || port > 65536))
			{
				throw new Error(`Illegal port specified [${port}]. Must be greater than 0 and less than 65537.`);
			}
			this.port = port;
		}

		toString():string
		{
			return `[${this.connectionType}, requested host: ${this.requestedHost}, host: ${this.host ?? ''}, port: ${this.port}]`;
		}

		protected beginReadyHandshake():void
		{
			this.dispatchBeginHandshake();

			if (!this.orbiter) return;

			if (!this.orbiter.getMessageManager().hasMessageListener('u63', this.u63))
			{
				this.orbiter.getMessageManager().addMessageListener('u63', this.u63, this);
				this.orbiter.getMessageManager().addMessageListener('u66', this.u66, this);
				this.orbiter.getMessageManager().addMessageListener('u84', this.u84, this);
				this.orbiter.getMessageManager().addMessageListener('u85', this.u85, this);
			}

			this.sendHello();
		}

		protected deactivateConnection():void
		{
			this.connectionState = ConnectionState.NOT_CONNECTED;
			this.stopReadyTimer();
			this.orbiter?.setSessionID('');
		}

		protected dispatchConnectFailure(status:string):void
		{
			this.dispatchEvent(new ConnectionEvent(ConnectionEvent.CONNECT_FAILURE, undefined, undefined, this, status));
		}

		protected dispatchReceiveData(data:any):void
		{
			this.dispatchEvent(new ConnectionEvent(ConnectionEvent.RECEIVE_DATA, undefined, data, this));
		}

		protected dispatchSendData(data:any):void
		{
			this.dispatchEvent(new ConnectionEvent(ConnectionEvent.SEND_DATA, undefined, data, this));
		}

		protected dispatchServerKillConnect():void
		{
			this.dispatchEvent(new ConnectionEvent(ConnectionEvent.SERVER_KILL_CONNECT, undefined, undefined, this));
			this.dispatchEvent(new ConnectionEvent(ConnectionEvent.DISCONNECT, undefined, undefined, this));
		}

		/**
		 * Permanently disables the connection object.
		 */
		dispose():void
		{
			this.disposed = true;
			this.orbiter?.getMessageManager().removeMessageListener('u63', this.u63);
			this.orbiter?.getMessageManager().removeMessageListener('u66', this.u66);
			this.orbiter?.getMessageManager().removeMessageListener('u84', this.u84);
			this.orbiter?.getMessageManager().removeMessageListener('u85', this.u85);
			this.stopReadyTimer();
			this.readyTimeoutID = 0;
			this.orbiter = undefined;
		}

		protected transmitHelloMessage(helloString:string):void
		{
			this.send(helloString);
		}

		protected u66(serverVersion:string,
		              sessionID:string,
		              upcVersion:string,
		              protocolCompatible:string,
		              affinityAddress:string = '',
		              affinityDuration:string = ''):void
		{
			this.orbiter?.setSessionID(sessionID);
		}

		private buildHelloMessage():string
		{
			if (!this.orbiter) return '';

			const sys:System = this.orbiter.getSystem();
			return `<U><M>u65</M><L><A>${sys.getClientType()}</A><A>${typeof navigator != 'undefined' ?
			                                                          navigator.userAgent + ';' :
			                                                          ''}${sys.getClientVersion()
			                                                                  .toStringVerbose()}</A><A>${sys.getUPCVersion()
			                                                                                                 .toString()}</A></L></U>`;
		}

		private dispatchBeginConnect():void
		{
			this.dispatchEvent(new ConnectionEvent(ConnectionEvent.BEGIN_CONNECT, undefined, undefined, this));
		}

		private dispatchBeginHandshake():void
		{
			this.dispatchEvent(new ConnectionEvent(ConnectionEvent.BEGIN_HANDSHAKE, undefined, undefined, this));
		}

		private dispatchClientKillConnect():void
		{
			this.dispatchEvent(new ConnectionEvent(ConnectionEvent.CLIENT_KILL_CONNECT, undefined, undefined, this));
			this.dispatchEvent(new ConnectionEvent(ConnectionEvent.DISCONNECT, undefined, undefined, this));
		}

		private dispatchReady():void
		{
			this.dispatchEvent(new ConnectionEvent(ConnectionEvent.READY, undefined, undefined, this));
		}

		private dispatchSessionNotFound():void
		{
			this.dispatchEvent(new ConnectionEvent(ConnectionEvent.SESSION_NOT_FOUND, undefined, undefined, this));
		}

		private dispatchSessionTerminated():void
		{
			this.dispatchEvent(new ConnectionEvent(ConnectionEvent.SESSION_TERMINATED, undefined, undefined, this));
		}

		private getReadyCount():number
		{
			return this.readyCount;
		}

		private readyTimerListener():void
		{
			this.stopReadyTimer();
			if (this.connectionState == ConnectionState.CONNECTION_IN_PROGRESS)
			{
				this.orbiter?.getLog().warn(`[CONNECTION] ${this.toString()} Failed to achieve ready state after ${this.readyTimeout}ms. Aborting connection...`);
				this.mostRecentConnectTimedOut = true;
				this.disconnect();
			}
		}

		private sendHello():void
		{
			const helloString:string = this.buildHelloMessage();
			this.orbiter?.getLog().debug(`${this.toString()} Sending CLIENT_HELLO: ${helloString}`);
			this.transmitHelloMessage(helloString);
		}

		private startReadyTimer():void
		{
			this.stopReadyTimer();
			this.readyTimeout = this.orbiter?.getConnectionManager().getReadyTimeout() ?? 0;
			this.readyTimeoutID = setTimeout(()=>this.readyTimerListener(), this.readyTimeout);
		}

		private stopReadyTimer():void
		{
			if (this.readyTimeoutID != -1)
			{
				clearTimeout(this.readyTimeoutID);
			}
		}

		private u63():void
		{
			this.stopReadyTimer();
			this.connectionState = ConnectionState.READY;
			this.mostRecentConnectAchievedReady = true;
			this.readyCount++;
			this.connectAttemptCount = 0;
			this.connectAbortCount = 0;
			this.dispatchReady();
		}

		private u84():void
		{
			this.dispatchSessionTerminated();
		}

		private u85():void
		{
			this.dispatchSessionNotFound();
		}
	}
}

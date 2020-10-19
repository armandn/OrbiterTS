namespace net.user1.orbiter
{
	/**
	 * The HTTPConnection class is used by Orbiter to communicate with Union Server over HTTP.
	 * Normally, developers need not use the HTTPConnection class directly, and should instead make
	 * connections via the [[Orbiter.connect]] method. However, the HTTPConnection class is required
	 * for fine-grained connection configuration, such as defining failover connections for multiple
	 * Union servers running at different host addresses (see the example in the
	 * [[ConnectionManager]] main class entry).
	 *
	 * By default, Orbiter uses the [[WebSocketConnection]] class, not the HTTPConnection class,
	 * to communicate with Union Server. The HTTPConnection class is primarily used for backup
	 * connections required when a main WebSocketConnection connection is blocked by a firewall.
	 * However, on a very heavily loaded server with limited persistent socket connections
	 * available, communicating with Union Server over HTTP -- which uses short-lived socket
	 * connections -- can improve performance at the expense of realtime responsiveness. To reduce
	 * server load when communicating over HTTP, use [[HTTPConnection.setSendDelay]] method to
	 * decrease the frequency of Orbiter's requests for updates from Union Server. Developers that
	 * wish to use HTTP connections as the primary form of communication with Union Server must do
	 * so by manually configuring connections via the [[ConnectionManager.addConnection]] method.
	 */
	export class HTTPConnection extends Connection
	{
		protected url:string = '';

		/**
		 * The default send-delay used for new HTTPConnection objects. For details, see
		 * [[setSendDelay]].
		 */
		static readonly DEFAULT_SEND_DELAY = 300;

		protected sendDelayTimerEnabled:boolean = true;
		protected messageQueue:string[] = [];

		protected retryDelay:number = 500;
		protected retryHelloTimeoutID:number = -1;
		protected retryIncomingTimeoutID:number = -1;
		protected retryOutgoingTimeoutID:number = -1;

		protected helloResponsePending:boolean = false;
		protected outgoingResponsePending:boolean = false;

		protected sendDelayTimeoutID:number= -1;
		protected sendDelayTimerRunning:boolean = false;
		protected sendDelay:number = HTTPConnection.DEFAULT_SEND_DELAY;



		doDispose():void {}
		doRequestDeactivation():void {}
		doRetryHello():void {}
		doRetryIncoming():void {}
		doRetryOutgoing():void {}
		doSendHello(data:string):void {}
		doSendIncoming():void {}
		doSendOutgoing(data:string):void {}

		constructor(host?:string, port?:number, type:string=ConnectionType.HTTP)
		{
			super(host, port, type);
			
			this.addEventListener(ConnectionEvent.SESSION_TERMINATED, this.sessionTerminatedListener, this);
			this.addEventListener(ConnectionEvent.SESSION_NOT_FOUND,  this.sessionNotFoundListener,   this);
		}

		/**
		 * @internal
		 */
		applyAffinity(data:any):void
		{
			super.applyAffinity();
			this.buildURL();
		}

		protected buildURL():void
		{
			this.url = `http://${this.host}:${this.port}`;
		}

		connect():void
		{
			super.connect();
		}

		protected deactivateConnection():void
		{
			this.orbiter?.getLog().debug(`[CONNECTION] ${this.toString()} Deactivating...`);

			this.connectionState = ConnectionState.DISCONNECTION_IN_PROGRESS;
			this.stopSendDelayTimer();
			if (this.retryHelloTimeoutID != -1)
			{
				this.orbiter?.getLog().debug(`[CONNECTION] ${this.toString()} Cancelling scheduled hello-request retry.`);
				clearTimeout(this.retryHelloTimeoutID);
				this.retryHelloTimeoutID = -1;
			}

			if (this.retryIncomingTimeoutID != -1)
			{
				this.orbiter?.getLog().debug(`[CONNECTION] ${this.toString()} Cancelling scheduled incoming-request retry.`);
				clearTimeout(this.retryIncomingTimeoutID);
				this.retryIncomingTimeoutID = -1;
			}

			if (this.retryOutgoingTimeoutID != -1)
			{
				this.orbiter?.getLog().debug(`[CONNECTION] ${this.toString()} Cancelling scheduled outgoing-request retry.`);
				clearTimeout(this.retryOutgoingTimeoutID);
				this.retryOutgoingTimeoutID = -1;
			}
			this.deactivateHTTPRequests();
			super.deactivateConnection();
		}

		setServer(host:string, port:number):void
		{
			try
			{
				super.setServer(host, port);
			}
			finally
			{
				this.buildURL();
			}
		}

		toString():string
		{
			return `[${this.connectionType}, requested host: ${this.requestedHost}, host: ${this.host}, port: ${this.port}, send-delay: ${this.getSendDelay()}]`;
		}

		/**
		 * Permanently disables this object.
		 */
		dispose():void
		{
			this.doDispose();
			this.stopSendDelayTimer();
			super.dispose();
		}

		protected deactivateHTTPRequests():void
		{
			this.orbiter?.getLog().debug(`[CONNECTION] ${this.toString()} Closing all pending HTTP requests.`);
			this.doRequestDeactivation();
			this.helloResponsePending = false;
			this.outgoingResponsePending = false;
		}

		private flushMessageQueue():void
		{
			if (!this.outgoingResponsePending)
			{
				this.openNewOutgoingRequest(this.messageQueue.join(''));
				this.messageQueue = [];
			}
			else
			{
				// AN OUTGOING RESPONSE IS STILL PENDING, SO DON'T SEND A NEW ONE
			}
		}

		/**
		 * Returns this connection's send-delay. For details, see setSendDelay().
		 */
		getSendDelay():number
		{
			return this.sendDelay;
		}

		helloCompleteListener(data:string):void
		{
			if (this.disposed) return;

			if (this.helloResponsePending)
			{
				this.helloResponsePending = false;
				this.processIncomingData(data);

				// Don't immediately open a request in the complete handler due to Win IE bug
				setTimeout(()=>this.openNewIncomingRequest(), 0);
			}
			else
			{
				if (this.connectionState == ConnectionState.NOT_CONNECTED)
				{
					this.orbiter?.getLog().error(`[CONNECTION]${toString()} u66 (SERVER_HELLO) received, but client is not connected. Ignoring.`);
				}
				else
				{
					this.orbiter?.getLog().error(`[CONNECTION]${toString()} Redundant u66 (SERVER_HELLO) received. Ignoring.`);
				}
			}
		}

		helloErrorListener():void
		{
			if (this.disposed) return;

			// There's already a retry scheduled
			if (this.retryHelloTimeoutID != -1) return;

			// The connection attempt has been aborted
			if (this.connectionState != ConnectionState.CONNECTION_IN_PROGRESS)
			{
				this.orbiter?.getLog().error(`[CONNECTION]${this.toString()} u65 (CLIENT_HELLO) request failed. Connection is no longer in progress, so no retry scheduled.`);
				return;
			}

			this.orbiter?.getLog().error(`[CONNECTION]${this.toString()} u65 (CLIENT_HELLO) request failed. Retrying in ${this.retryDelay}ms.`);

			// Retry
			this.retryHelloTimeoutID = setTimeout(()=>
			                                      {
				                                      this.retryHelloTimeoutID = -1;
				                                      this.doRetryHello();
			                                      }, this.retryDelay);
		}

		incomingCompleteListener(data:string):void
		{
			if (this.disposed ||
			    this.connectionState == ConnectionState.NOT_CONNECTED ||
			    this.connectionState == ConnectionState.DISCONNECTION_IN_PROGRESS)
			{
				// Incoming request complete, but connection is closed. Ignore content.
				return;
			}

			// Don't immediately open a request in the complete handler due to Win IE bug
			setTimeout(()=>{
				           this.processIncomingData(data);
				           // A message listener might have closed this connection in response to
				           // an incoming message. Do not open a new incoming request unless the
				           // connection is still open.
				           if (this.disposed ||
				               this.connectionState == ConnectionState.NOT_CONNECTED ||
				               this.connectionState == ConnectionState.DISCONNECTION_IN_PROGRESS)
				           {
					           return;
				           }
				           this.openNewIncomingRequest();
			           }, 0);
		}

		incomingErrorListener():void
		{
			if (this.disposed) return;

			// There's already a retry scheduled
			if (this.retryIncomingTimeoutID != -1) return;

			// The connection has been closed
			if (this.connectionState == ConnectionState.NOT_CONNECTED ||
			    this.connectionState == ConnectionState.DISCONNECTION_IN_PROGRESS)
			{
				this.orbiter?.getLog().error(`[CONNECTION]${this.toString()} Incoming request failed. Connection is closed, so no retry scheduled.`);
				return;
			}

			this.orbiter?.getLog().error(`[CONNECTION]${this.toString()} Incoming request failed. Retrying in ${this.retryDelay}ms.`);

			// Retry
			this.retryIncomingTimeoutID = setTimeout(()=>
			                                         {
				                                         this.retryIncomingTimeoutID = -1;
				                                         if (this.disposed ||
				                                             this.connectionState == ConnectionState.NOT_CONNECTED ||
				                                             this.connectionState == ConnectionState.DISCONNECTION_IN_PROGRESS)
				                                         {
					                                         return;
				                                         }
				                                         this.doRetryIncoming();
			                                         }, this.retryDelay);
		}

		private openNewIncomingRequest():void
		{
			this.doSendIncoming();
		}

		private openNewOutgoingRequest(data:string):void
		{
			this.dispatchSendData(data);
			this.outgoingResponsePending = true;
			this.doSendOutgoing(data);

			if (this.sendDelayTimerEnabled)
			{
				this.startSendDelayTimer();
			}
		}

		outgoingCompleteListener():void
		{
			if (this.disposed) return;

			this.outgoingResponsePending = false;

			if (!this.sendDelayTimerRunning && this.messageQueue.length > 0)
			{
				// Don't immediately open a request in the complete handler due to Win IE bug
				setTimeout(()=>this.flushMessageQueue(), 0);
			}
		}

		outgoingErrorListener():void
		{
			if (this.disposed) return;

			// There's already a retry scheduled
			if (this.retryOutgoingTimeoutID != -1) return;

			// The connection has been closed
			if (this.connectionState == ConnectionState.NOT_CONNECTED ||
			    this.connectionState == ConnectionState.DISCONNECTION_IN_PROGRESS)
			{
				this.orbiter?.getLog().error(`[CONNECTION]${this.toString()} Outgoing request failed. Connection is closed, so no retry scheduled.`);
				return;
			}

			this.orbiter?.getLog().error(`[CONNECTION]${this.toString()} Outgoing request failed. Retrying in ${this.retryDelay}ms.`);

			this.retryOutgoingTimeoutID = setTimeout(()=>
			                                         {
				                                         this.retryOutgoingTimeoutID = -1;
				                                         if (this.disposed ||
				                                             this.connectionState == ConnectionState.NOT_CONNECTED ||
				                                             this.connectionState == ConnectionState.DISCONNECTION_IN_PROGRESS)
				                                         {
					                                         return;
				                                         }
				                                         this.doRetryOutgoing();
			                                         }, this.retryDelay);
		}

		private processIncomingData(data:string):void
		{
			if (this.disposed) return;

			this.dispatchReceiveData(data);

			const upcs:string[] = [];
			let upcEndTagIndex = data.indexOf('</U>');
			// Empty responses are valid.
			if (upcEndTagIndex == -1 && data.length > 0)
			{
				this.orbiter?.getLog().error(`Invalid message received. No UPC found: [${data}]`);
				if (!this.isReady())
				{
					// If invalid XML is received prior to achieving ready, then this
					// probably isn't a Union server, so disconnect.
					this.disconnect();
					return;
				}
			}

			while (upcEndTagIndex != -1)
			{
				upcs.push(data.substring(0, upcEndTagIndex + 4));
				data = data.substring(upcEndTagIndex + 4);
				upcEndTagIndex = data.indexOf('</U>');
			}
			for (let i = 0; i < upcs.length; i++)
			{
				this.dispatchEvent(new ConnectionEvent(
					ConnectionEvent.RECEIVE_UPC, upcs[i]));
			}
		}

		send(data:string):void
		{
			// If the timer isn't running...
			if (!this.sendDelayTimerRunning)
			{
				// ...it is either disabled or expired. Either way, it's time to
				// attempt to flush the queue.
				this.messageQueue.push(data);
				this.flushMessageQueue();
			}
			else
			{
				// The send-delay timer is running, so we can't send yet. Just queue the message.
				this.messageQueue.push(data);
			}
		}

		private sendDelayTimerListener()
		{
			this.sendDelayTimerRunning = false;
			if (this.messageQueue.length > 0)
			{
				this.flushMessageQueue();
			}
			else
			{
				// No messages in queue, so take no action.
			}
		}

		private sessionNotFoundListener(e:Event):void
		{
			this.deactivateConnection();

			if (this.connectionState == ConnectionState.CONNECTION_IN_PROGRESS)
			{
				this.dispatchConnectFailure(`Client attempted to reestablish an expired session or establish an unknown session.`);
			}
			else
			{
				this.dispatchServerKillConnect();
			}
		}

		private sessionTerminatedListener(e:Event):void
		{
			this.deactivateConnection();

			if (this.connectionState == ConnectionState.CONNECTION_IN_PROGRESS)
			{
				this.dispatchConnectFailure('Server terminated session before READY state was achieved.');
			}
			else
			{
				this.dispatchServerKillConnect();
			}
		}

		setRetryDelay(milliseconds:number):void
		{
			if (milliseconds > -1)
			{
				if (milliseconds != this.retryDelay)
				{
					this.retryDelay = milliseconds;
					this.orbiter?.getLog().debug(`[CONNECTION] ${this.toString()} Retry delay set to: [${milliseconds}].`);
				}
			}
			else
			{
				throw new Error(`[CONNECTION]${this.toString()} Invalid retry delay specified: [${milliseconds}].`);
			}
		}

		/**
		 * Increases or decreases the connection's batch-message send rate, or disables
		 * batch-sending entirely. Orbiter's HTTPConnection class uses a batch-message-sending
		 * system that reduces server load and client-side HTTP-request volume. In the default
		 * configuration, when an HTTPConnection sends messages via an HTTP request to Union Server,
		 * it starts a countdown known as the "send-countdown". The duration of the send-countdown
		 * is known as the "send-delay" (configurable via the setSendDelay() method). Until both the
		 * send-countdown expires and the response to the HTTP request is received, all outbound
		 * messages are queued. The queue is flushed when both the outbound HTTP request has
		 * completed and the send-countdown (if any) has expired.
		 *
		 * Orbiter's batch-message-sending system is part of Union's "binary request" HTTP
		 * communications model, which balances two principles: on one hand, for maximum
		 * responsiveness, Orbiter always maintains an open HTTP request to Union Server (used to
		 * receive incoming messages from the server); on the other hand, for maximum efficiency,
		 * when an outgoing HTTP response is already pending, Orbiter never sends another request,
		 * and when no outgoing HTTP response is pending, Orbiter never sends messages to Union
		 * Server more frequently than the specified send-delay.
		 *
		 * The default send-delay is defined by [[HTTPConnection.DEFAULT_SEND_DELAY]], and is
		 * appropriate for the vast majority of applications. However, applications that require a
		 * reduced server load can opt for less frequent message delivery by increasing the
		 * send-delay. Conversely, applications that require maximum responsiveness can opt for more
		 * frequent message delivery by decreasing the send-delay, or by setting the send-delay to
		 * -1, which disables the message queue entirely. When the message queue is disabled, a new
		 * outgoing HTTP request will be opened any time there are messages to send and there is no
		 * outgoing request already pending.
		 *
		 * __Warning__: disabling the send-delay or setting it to a value lower than 200
		 * milliseconds can result high server load. When setting send-delay to a custom value, be
		 * sure to test application behaviour thoroughly.
		 *
		 * @param milliseconds The batched message send-delay, in milliseconds. Defaults to
		 *                     [[HTTPConnection.DEFAULT_SEND_DELAY]].
		 */
		setSendDelay(milliseconds:number):void
		{
			if (milliseconds > 0)
			{
				if ((milliseconds != this.sendDelay))
				{
					this.sendDelay = milliseconds;
					this.orbiter?.getLog().debug(`[CONNECTION] ${this.toString()} Send delay set to: [${milliseconds}].`);
				}
				this.sendDelayTimerEnabled = true;
			}
			else if (milliseconds == -1)
			{
				this.orbiter?.getLog().debug(`[CONNECTION] ${toString()} Send delay disabled.`);
				this.sendDelayTimerEnabled = false;
				this.stopSendDelayTimer();
			}
			else
			{
				throw new Error(`[CONNECTION]${this.toString()} Invalid send-delay specified: [${milliseconds}].`);
			}
		}

		private startSendDelayTimer():void
		{
			this.stopSendDelayTimer();

			this.sendDelayTimerRunning = true;
			this.sendDelayTimeoutID = setTimeout(()=>this.sendDelayTimerListener(), this.sendDelay);
		}

		private stopSendDelayTimer():void
		{
			this.sendDelayTimerRunning = false;
			if (this.sendDelayTimeoutID != -1)
			{
				clearTimeout(this.sendDelayTimeoutID);
			}
			this.sendDelayTimeoutID = -1;
		}

		/**
		 * Transmits the client hello to the server, bypassing the usual [[send]] call because the
		 * first request has no session id, so the Binary Request Communication Model cannot yet be
		 * used.
		 */
		transmitHelloMessage(helloString:string):void
		{
			this.dispatchSendData(helloString);
			this.helloResponsePending = true;
			this.doSendHello(helloString);
		}
	}
}

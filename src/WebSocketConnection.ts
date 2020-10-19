namespace net.user1.orbiter
{
	/**
	 * The WebSocketConnection class is used by Orbiter to communicate with Union Server over a
	 * persistent TCP/IP socket. Normally, developers need not use the WebSocketConnection class
	 * directly, and should instead make connections via the Orbiter class's connect() method.
	 * However, the WebSocketConnection class is required for fine-grained connection configuration,
	 * such as defining failover socket connections for multiple Union Servers running at different
	 * host addresses.
	 *
	 * By default, Orbiter uses WebSocketConnection connections to communicate with Union Server.
	 * WebSocketConnection connections offer faster response times than HTTP connections, but occupy
	 * an operating-system-level socket continuously for the duration of the connection. If a
	 * WebSocketConnection connection cannot be established (due to, say, a restrictive firewall),
	 * Orbiter automatically attempts to communicate using HTTP requests sent via an
	 * HTTPDirectConnection or HTTPIFrameConnection. Developers can override Orbiter's default
	 * connection failover system by manually configuring connections using the ConnectionManager
	 * class and Orbiter's disableHTTPFailover() method.
	 *
	 * For secure WebSocket and HTTP communications, see SecureWebSocketConnection,
	 * SecureHTTPDirectConnection, and SecureHTTPIFrameConnection.
	 */
	export class WebSocketConnection extends Connection
	{
		private socket?:WebSocket;

		constructor(host?:string, port?:number, type:string = ConnectionType.WEBSOCKET)
		{
			super(host, port, type);
		}

		connect():void
		{
			super.connect();

			// Attempt to connect
			try
			{
				this.getNewSocket();
			}
			catch (e)
			{
				// Socket could not be opened
				this.deactivateConnection();
				this.dispatchConnectFailure(e.toString());
			}
		}

		protected deactivateConnection():void
		{
			this.orbiter?.getLog().debug(`[CONNECTION] ${this.toString()} Deactivating...`);
			this.connectionState = net.user1.orbiter.ConnectionState.DISCONNECTION_IN_PROGRESS;
			this.deactivateSocket(this.socket);
			super.deactivateConnection.call(this);
		}

		dispose():void
		{
			super.dispose();
			this.deactivateSocket(this.socket);
		}

		send(data?:any):void
		{
			this.dispatchSendData(data);
			this.socket?.send(data);
		}

		getNewSocket():void
		{
			// Deactivate the old socket
			this.deactivateSocket(this.socket);

			// Create the new socket
			this.socket = new WebSocket(this.buildURL());

			// Register for socket events
			this.socket.onopen = (e:Event)=>this.connectListener(e);
			this.socket.onmessage = (e:MessageEvent)=>this.dataListener(e);
			this.socket.onclose = (e:CloseEvent)=>this.closeListener(e);
			this.socket.onerror = (e:Event)=>this.ioErrorListener(e);
		}

		protected buildURL():string
		{
			return `ws://${this.host}:${this.port}`;
		}

		private closeListener(e:Event):void
		{
			if (this.disposed) return;

			const state = this.connectionState;
			this.deactivateConnection();

			if (state == ConnectionState.CONNECTION_IN_PROGRESS)
			{
				this.dispatchConnectFailure('WebSocket onclose: Server closed connection before READY state was achieved.');
			}
			else
			{
				this.dispatchServerKillConnect();
			}
		}

		private connectListener(e:Event):void
		{
			if (this.disposed) return;

			this.orbiter?.getLog().debug(`${this.toString()} Socket connected.`);
			this.beginReadyHandshake();
		}

		private dataListener(dataEvent:MessageEvent):void
		{
			if (this.disposed) return;

			const data:string = dataEvent.data;
			this.dispatchReceiveData(data);

			if (data.indexOf('<U>') == 0)
			{
				this.dispatchEvent(new ConnectionEvent(ConnectionEvent.RECEIVE_UPC, data));
			}
			else
			{
				// The message isn't UPC. Must be an error...
				this.orbiter?.getLog().error(`${this.toString()} Received invalid message (not UPC or malformed UPC): ${data}`);
			}
		}

		private deactivateSocket(oldSocket?:WebSocket):void
		{
			if (!oldSocket) return;

			if (this.socket)
			{
				this.socket.onopen = null;
				this.socket.onmessage = null;
				this.socket.onclose = null;
				this.socket.onerror = null;
			}

			try
			{
				oldSocket.close();
			}
			catch (e)
			{
				// Do nothing
			}

			this.socket = undefined;
		}

		private ioErrorListener(e:Event):void
		{
			if (this.disposed) return;

			const state = this.connectionState;
			this.deactivateConnection();

			// Note: when Union closes the connection, Firefox 7 dispatches onerror, not
			// onclose, so treat onerror like an onclose event
			if (state == net.user1.orbiter.ConnectionState.CONNECTION_IN_PROGRESS)
			{
				this.dispatchConnectFailure('WebSocket onerror: Server closed connection before READY state was achieved.');
			}
			else
			{
				this.dispatchServerKillConnect();
			}
		}
	}
}

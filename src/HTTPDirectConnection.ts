type XDomainRequest = any;

namespace net.user1.orbiter
{
	/**
	 * The HTTPDirectConnection class is used to communicate with Union Server over HTTP; it uses
	 * CORS to bypass cross-origin restrictions when Union Server is hosted on a domain that does
	 * not match the domain at which the Orbiter client is hosted. Normally, developers need not use
	 * the HTTPDirectConnection class directly, and should instead make connections via the Orbiter
	 * class's connect() method. However, the HTTPDirectConnection class is required for
	 * fine-grained connection configuration, such as defining failover connections for multiple
	 * Union Servers running at different host addresses.
	 *
	 * By default, Orbiter uses the WebSocketConnection class, not the HTTPDirectConnection class,
	 * to communicate with Union Server. The HTTPDirectConnection class is used as a backup
	 * connection when the primary WebSocketConnection connection is blocked by a firewall.
	 * However, on a very heavily loaded server with limited persistent socket connections
	 * available, communicating with Union Server over HTTP--which uses short-lived socket
	 * connections--can improve performance at the expense of realtime responsiveness. To reduce
	 * server load when communicating over HTTP, use HTTPDirectConnection's setSendDelay() method to
	 * decrease the frequency of Orbiter's requests for updates from Union Server. Developers that
	 * wish to use HTTP connections as the primary form of communication with Union Server must do
	 * so by manually configuring connections via the ConnectionManager class's addConnection()
	 * method.
	 *
	 * In environments that do not support CORS (such as IE8 on Windows), Orbiter conducts HTTP
	 * communications using HTTPIFrameConnection instead of HTTPDirectConnection.
	 */
	export class HTTPDirectConnection extends HTTPConnection
	{
		private outgoingRequestID:number = 0;
		private incomingRequestID:number = 0;

		private lastOutgoingPostData?:string;
		private lastIncomingPostData?:string;
		private lastHelloPostData?:string;

		private pendingRequests:XMLHttpRequest[] = [];

		constructor(host?:string, port?:number, type:string=ConnectionType.HTTP)
		{
			super(host, port, type);
		}

		private createHelloPostData(data:string):string
		{
			return `mode=d&data=${data}`;
		}

		private createIncomingPostData()
		{
			this.incomingRequestID++;
			return `rid=${this.incomingRequestID}&sid=${this.orbiter?.getSessionID()}&mode=c`;
		}

		private createOutgoingPostData(data:string):string
		{
			this.outgoingRequestID++;
			return `rid=${this.outgoingRequestID}&sid=${this.orbiter?.getSessionID()}&mode=s&data=${data}`;
		}

		doDispose():void
		{
			this.deactivateHTTPRequests();
		}

		doRequestDeactivation():void
		{
			for (let i = this.pendingRequests.length; --i >= 0;)
			{
				try
				{
					this.pendingRequests[i].abort();
				}
				catch (e)
				{
					// Do nothing
				}
			}
			this.pendingRequests = [];
		}

		doRetryHello():void
		{
			this.retryHello();
		}

		doRetryIncoming():void
		{
			this.retryIncoming();
		}

		doRetryOutgoing():void
		{
			this.retryOutgoing();
		}

		doSendHello(helloString:string):void
		{
			this.newHelloRequest(helloString);
		}

		doSendIncoming():void
		{
			this.newIncomingRequest();
		}

		doSendOutgoing(data:string):void
		{
			this.newOutgoingRequest(data);
		}

		connect():void
		{
			super.connect();
			this.beginReadyHandshake();
		}

		toString():string
		{
			return `[HTTPDirectConnection, requested host: ${this.requestedHost}, host: ${this.host}, port: ${this.port}, send-delay: ${this.getSendDelay()}]`;
		}

		static helloRequestErrorListener(xhr:XMLHttpRequest, connection:HTTPDirectConnection):void
		{
			connection.removePendingRequest(xhr);
			connection.helloErrorListener();
		}

		static helloRequestReadystatechangeListener(xhr:XMLHttpRequest, connection:HTTPDirectConnection):void
		{
			if (xhr.readyState == 4)
			{
				connection.removePendingRequest(xhr);
				if (xhr.status >= 200 && xhr.status <= 299)
				{
					connection.helloCompleteListener(xhr.responseText);
				}
				else
				{
					connection.helloErrorListener();
				}
			}
		}

		static incomingRequestErrorListener(xhr:XMLHttpRequest, connection:HTTPDirectConnection):void
		{
			connection.removePendingRequest(xhr);
			connection.incomingErrorListener();
		}

		static incomingRequestReadystatechangeListener(xhr:XMLHttpRequest, connection:HTTPDirectConnection):void
		{
			if (xhr.readyState == 4)
			{
				connection.removePendingRequest(xhr);
				if (xhr.status >= 200 && xhr.status <= 299)
				{
					connection.incomingCompleteListener(xhr.responseText);
				}
				else
				{
					connection.incomingErrorListener();
				}
			}
		}

		private newHelloRequest(data:string):void
		{
			this.lastHelloPostData = this.createHelloPostData(encodeURIComponent(data));
			this.transmitRequest(this.lastHelloPostData,
			                     HTTPDirectConnection.helloRequestReadystatechangeListener,
			                     HTTPDirectConnection.helloRequestErrorListener);
		}

		private newIncomingRequest():void
		{
			this.lastIncomingPostData = this.createIncomingPostData();
			this.transmitRequest(this.lastIncomingPostData,
			                     HTTPDirectConnection.incomingRequestReadystatechangeListener,
			                     HTTPDirectConnection.incomingRequestErrorListener);
		}

		private newOutgoingRequest(data:string):void
		{
			this.lastOutgoingPostData = this.createOutgoingPostData(encodeURIComponent(data));
			this.transmitRequest(this.lastOutgoingPostData,
			                     HTTPDirectConnection.outgoingRequestReadystatechangeListener,
			                     HTTPDirectConnection.outgoingRequestErrorListener);
		}

		static outgoingRequestErrorListener(xhr:XMLHttpRequest, connection:HTTPDirectConnection):void
		{
			connection.removePendingRequest(xhr);
			connection.outgoingErrorListener();
		}

		static outgoingRequestReadystatechangeListener(xhr:XMLHttpRequest, connection:HTTPDirectConnection):void
		{
			if (xhr.readyState == 4)
			{
				connection.removePendingRequest(xhr);
				if (xhr.status >= 200 && xhr.status <= 299)
				{
					connection.outgoingCompleteListener();
				}
				else
				{
					connection.outgoingErrorListener();
				}
			}
		}

		private removePendingRequest(request:XMLHttpRequest):void
		{
			for (let i = this.pendingRequests.length; --i >= 0;)
			{
				if (this.pendingRequests[i] === request)
				{
					this.pendingRequests.splice(i, 1);
				}
			}
		}

		private retryHello():void
		{
			this.transmitRequest(this.lastHelloPostData,
			                     HTTPDirectConnection.helloRequestReadystatechangeListener,
			                     HTTPDirectConnection.helloRequestErrorListener);
		}

		retryIncoming():void
		{
			this.transmitRequest(this.lastIncomingPostData,
			                     HTTPDirectConnection.incomingRequestReadystatechangeListener,
			                     HTTPDirectConnection.incomingRequestErrorListener);
		}

		private retryOutgoing():void
		{
			this.transmitRequest(this.lastOutgoingPostData,
			                     HTTPDirectConnection.outgoingRequestReadystatechangeListener,
			                     HTTPDirectConnection.outgoingRequestErrorListener);
		}

		private transmitRequest(data:string|undefined,
		                        readystatechangeListener:(xhr:XDomainRequest|XMLHttpRequest, connection:HTTPDirectConnection)=>void,
		                        errorListener:(xhr:XDomainRequest|XMLHttpRequest, connection:HTTPDirectConnection)=>void):void
		{
			let request:XDomainRequest|XMLHttpRequest;

			const self = this;

			//@ts-ignore
			if (typeof this.XDomainRequest != 'undefined')
			{
				// IE
				//@ts-ignore
				let request:XDomainRequest = new XDomainRequest();

				request.onload = function()
				{
					request.readyState = 4;  // Emulate standards-based API
					request.status = 200;
					readystatechangeListener(this, self);
				}

				request.onerror = function()
				{
					errorListener(this, self);
				}

				request.ontimeout = function()
				{
					errorListener(this, self);
				}

				request.onprogress = ()=>{};
			}
			else
			{
				// All other standards-based browsers
				let request = new XMLHttpRequest();
				this.pendingRequests.push(request);

				request.onreadystatechange = function()
				{
					readystatechangeListener(this, self);
				}

				request.onerror = function()
				{
					errorListener(this, self);
				}
			}
			// Call open before setting header
			request.open('POST', this.url);

			// Standards-based browsers (IE doesn't allow the setting of headers)
			if (typeof request.setRequestHeader != 'undefined')
			{
				request.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
			}
			request.send(data);
		}

	}
}

namespace net.user1.orbiter
{
	export class HTTPIFrameConnection extends net.user1.orbiter.HTTPConnection
	{
		private iframe?:HTMLIFrameElement;
		private iFrameReady:boolean = false;
		private postMessageInited:boolean = false;

		constructor(host?:string, port?:number, type?:string)
		{
			// Invoke superclass constructor
			super(host, port, type || net.user1.orbiter.ConnectionType.HTTP);
		}

		doDispose():void
		{
			this.postToIFrame('dispose');
		}

		doRequestDeactivation():void
		{
			this.postToIFrame('deactivate');
		}

		doRetryHello():void
		{
			this.postToIFrame('retryhello');
		}

		doRetryIncoming():void
		{
			this.postToIFrame('retryincoming');
		}

		doRetryOutgoing():void
		{
			this.postToIFrame('retryoutgoing');
		}

		doSendHello(helloString:string):void
		{
			this.postToIFrame('sendhello', helloString);
		}

		doSendIncoming():void
		{
			this.postToIFrame('sendincoming');
		}

		doSendOutgoing(data:string):void
		{
			this.postToIFrame('sendoutgoing', data);
		}

		connect():void
		{
			this.postMessageInited || this.initPostMessage();

			super.connect();
			this.makeIFrame();
		}

		toString():string
		{
			return `[HTTPIFrameConnection, requested host: ${this.requestedHost}, host: ${this.host}, port: ${this.port}, send-delay: ${this.getSendDelay()}]`;
		}

		initPostMessage():void
		{
			if (this.postMessageInited)
			{
				throw new Error('[HTTPIFrameConnection] Illegal duplicate initialization attempt.');
			}

			const win:Window|undefined = this.orbiter?.window;

			let errorMsg:string = '';

			const postMessageListener =(e:MessageEvent)=>
			{
				// The connection's host might have been reassigned (normally to an ip) due
				// to server affinity in a clustered deployment, so allow for posts from both the
				// requestedHost and the host.
				if (e.origin.indexOf(`//${this.host}${this.port == 80 ? '' : (':' + this.port)}`) == -1 &&
				    e.origin.indexOf(`//${this.requestedHost}${this.port == 80 ? '' : (':' + this.port)}`) == -1)
				{
					this.orbiter?.getLog().error(`[CONNECTION] ${this.toString()} Ignored message from unknown origin: ${e.origin}`);
					return;
				}

				this.processPostMessage(e.data);
			}

			if (!win)
			{
				errorMsg = `[HTTPIFrameConnection] Unable to create connection. No window object found.`;
			}
			else
			{
				if (typeof win.addEventListener != 'undefined')
				{
					// ...the standard way
					win.addEventListener('message', postMessageListener, false);
				}
				else
				{
					// @ts-ignore
					if (typeof win.attachEvent != 'undefined')
					{
						// ...the IE-specific way
						// @ts-ignore
						win.attachEvent('onmessage', postMessageListener);
					}
					else
					{
						errorMsg = `[HTTPIFrameConnection] Unable to create connection. No event listener registration method found on window object.`;
					}
				}
			}

			if (errorMsg)
			{
				this.orbiter?.getLog().error(errorMsg);
				throw new Error(errorMsg);
			}

			this.postMessageInited = true;
		}

		private makeIFrame():void
		{
			if (typeof this.orbiter?.window?.document == 'undefined')
			{
				const errorMsg = `[HTTPIFrameConnection] Unable to create connection. No document object found.`;
				this.orbiter?.getLog().error(errorMsg);
				throw new Error(errorMsg);
			}

			const doc = this.orbiter.window.document;

			this.iFrameReady = false;
			if (this.iframe)
			{
				this.postToIFrame('dispose');
				doc.body.removeChild(this.iframe);
			}

			this.iframe = doc.createElement('iframe');
			this.iframe.width = '0px';
			this.iframe.height = '0px';
			this.iframe.frameBorder = '0';
			this.iframe.style.visibility = 'hidden';
			this.iframe.style.display = 'none';
			this.iframe.src = this.url + '/orbiter';
			doc.body.appendChild(this.iframe);
		}

		private onIFrameReady():void
		{
			this.beginReadyHandshake();
		}

		private postToIFrame(cmd:string, data:string=''):void
		{
			if (this.iframe && this.iFrameReady)
			{
				// In order to post to the iframe, the targetOrigin must match the iframe's origin
				this.iframe?.contentWindow?.postMessage(`${cmd},${data}`, this.iframe.contentWindow.location.href);
			}
		}

		private processPostMessage(postedData:string):void
		{
			const [cmd, data] = postedData.split(',');

			switch (cmd)
			{
				case'ready':
					this.iFrameReady = true;
					this.onIFrameReady();
					break;

				case 'hellocomplete':
					this.helloCompleteListener(data);
					break;

				case 'helloerror':
					this.helloErrorListener();
					break;

				case 'outgoingcomplete':
					this.outgoingCompleteListener();
					break;

				case 'outgoingerror':
					this.outgoingErrorListener();
					break;

				case 'incomingcomplete':
					this.incomingCompleteListener(data);
					break;

				case 'incomingerror':
					this.incomingErrorListener();
					break;
			}
		}

		protected u66(serverVersion:string, sessionID:string, upcVersion:string, protocolCompatible:string)
		{
			super.u66(serverVersion, sessionID, upcVersion, protocolCompatible);
			if (this.iframe)
			{
				this.postToIFrame('sessionid', sessionID);
			}
		}

	}
}

namespace net.user1.orbiter
{
	export class System
	{
		private readonly clientType    = Product.clientType;
		private readonly clientVersion = Product.clientVersion;
		private readonly upcVersion    = Product.upcVersion;
		
		constructor(private readonly window?:Window)
		{
		}

		/**
		 * Indicates the official name of this Union client type.
		 */
		getClientType():string
		{
			return this.clientType;
		}

		/**
		 * Indicates the version and build of Orbiter. Version information is automatically
		 * displayed in the client-side log at startup time, and is sent to the server for logging
		 * at connection time.
		 */
		getClientVersion():VersionNumber
		{
			return this.clientVersion;
		}

		/**
		 * Returns the version of the UPC protocol in use by Orbiter.
		 */
		getUPCVersion():VersionNumber
		{
			return this.upcVersion;
		}

		/**
		 * Returns true if the host environment supports direct cross-origin HTTP requests using
		 * CORS (see: https://www.w3.org/TR/cors/). When hasHTTPDirectConnection() returns true,
		 * then Orbiter can safely use the HTTPDirectConnection class to communicate with Union
		 * Server over HTTP. When hasHTTPDirectConnection() returns false, Orbiter cannot use
		 * HTTPDirectConnection, and must instead use the HTTPIFrameConnection class to communicate
		 * with Union Server over HTTP.
		 *
		 * Note that Orbiter applications that use Orbiter's connect() or setServer() methods to
		 * connect to Union Server do not need to perform a capabilities check via
		 * hasHTTPDirectConnection(). The connect() and setServer() methods check the host
		 * environment's capabilities automatically, and choose the appropriate connection type for
		 * the environment. The hasHTTPDirectConnection() method is required in one situation only:
		 * when the application explicitly wishes to communicate over HTTP without trying a
		 * WebSocket connection first.
		 **/
		hasHTTPDirectConnection():boolean
		{
			// -If XHR has a "withCredentials" flag then CORS is supported.
			// -In IE, if XDomainRequest is available, and the file wasn't loaded
			//    locally, then CORS is supported
			// -In non-browser environments, assume cross-origin XMLHttpRequests are allowed
			//@ts-ignore
			return (typeof XMLHttpRequest != 'undefined' && typeof new XMLHttpRequest().withCredentials != 'undefined') || (typeof XDomainRequest != 'undefined' && this.window != null && this.window.location.protocol != 'file:') || (this.window == null && typeof XMLHttpRequest != 'undefined');
		}

		/**
		 * Returns true if the host environment supports WebSocket connections. When hasWebSocket()
		 * returns true, then Orbiter can safely use the WebSocketConnection class to communicate
		 * with Union Server over a persistent TCP/IP socket. When hasWebSocket() returns false,
		 * Orbiter cannot use WebSocketConnection, and must instead use HTTP communications (via
		 * either the HTTPDirectConnection class or the HTTPIFrameConnection class).
		 *
		 * Note that Orbiter applications that use Orbiter's connect() or setServer() methods to
		 * connect to Union Server do not need to perform a capabilities check via hasWebSocket().
		 * The connect() and setServer() methods check the host environment's capabilities
		 * automatically, and choose the appropriate connection type for the environment. The
		 * hasWebSocket() method is required in one situation only: when the application explicitly
		 * wishes to determine whether WebSocket is supported for the purpose of application flow
		 * or user feedback.
		 **/
		hasWebSocket():boolean
		{
			// @ts-ignore
			return (typeof WebSocket !== 'undefined' || typeof MozWebSocket !== 'undefined');
		}

		isJavaScriptCompatible():boolean
		{
			// Assume non-browser environments can do cross-origin XMLHttpRequests
			if (!this.window && typeof XMLHttpRequest != 'undefined')
			{
				return true;
			}

			if (this.window)
			{
				// Standards-based browsers that support cross-origin requests
				if (typeof XMLHttpRequest != 'undefined' &&
				    typeof new XMLHttpRequest().withCredentials != 'undefined')
				{
					return true;
				}

				// Versions of IE that support proprietary cross-origin requests
				//@ts-ignore
				if (typeof XDomainRequest != 'undefined' && this.window.location.protocol != 'file:')
				{
					return true;
				}

				// Browsers that can communicate between windows
				if (this.window.postMessage != null)
				{
					return true;
				}
			}

			// This environment has no way to connect to Union Server
			return false;
		}

		toString():string
		{
			return '[object System]';
		}
	}
}

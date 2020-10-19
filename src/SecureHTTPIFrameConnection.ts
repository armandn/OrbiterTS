namespace net.user1.orbiter
{
	export class SecureHTTPIFrameConnection extends net.user1.orbiter.HTTPIFrameConnection
	{
		constructor(host?:string, port?:number)
		{
			// Invoke superclass constructor
			super(host, port, net.user1.orbiter.ConnectionType.SECURE_HTTP);
		}

		buildURL():void
		{
			this.url = `https://${this.host}:${this.port}`;
		}

		toString():string
		{
			return `[SecureHTTPIFrameConnection, requested host: ${this.requestedHost}, host: ${this?.host == null ?? ''}, port: ${this.port}, send-delay: ${this.getSendDelay()}]`;
		}
	}
}

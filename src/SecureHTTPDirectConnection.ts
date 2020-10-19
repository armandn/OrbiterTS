namespace net.user1.orbiter
{
	export class SecureHTTPDirectConnection extends net.user1.orbiter.HTTPDirectConnection
	{
		constructor(host?:string, port?:number)
		{
			// Invoke superclass constructor
			super(host, port, net.user1.orbiter.ConnectionType.SECURE_HTTP);
		}

		protected buildURL():void
		{
			this.url = `https://${this.host}:${this.port}`;
		}

		toString():string
		{
			return `[SecureHTTPDirectConnection, requested host: ${this.requestedHost}, host: ${this.host ?? ''}, port: ${this.port}, send-delay: ${this.getSendDelay()}]`;
		}
	}
}

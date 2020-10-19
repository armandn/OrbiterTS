///<reference path="WebSocketConnection.ts"/>
namespace net.user1.orbiter
{
	/**
	 * The SecureWebSocketConnection class is identical to WebSocketConnection except that it
	 * performs communications over WSS (i.e., an encrypted TLS or SSL socket connection) rather
	 * than plain WebSocket.
	 */
	export class SecureWebSocketConnection extends WebSocketConnection
	{
		constructor(host?:string, port?:number)
		{
			super(host, port, ConnectionType.SECURE_WEBSOCKET);
		}

		protected buildURL():string
		{
			return `wss://${this.host}:${this.port}`;
		}
	}
}

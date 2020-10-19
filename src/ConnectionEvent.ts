namespace net.user1.orbiter
{
	/**
	 * ConnectionEvent is a simple data class used to pass information about a connection event to
	 * registered event-listeners. The ConnectionEvent class also defines constants representing the
	 * available connection events.
	 */
	export class ConnectionEvent extends net.user1.events.Event
	{
		/**
		 * Dispatched when a connection attempt by an IConnection object begins. The
		 * ConnectionEvent.BEGIN_CONNECT event is followed by either a
		 * ConnectionEvent.BEGIN_HANDSHAKE event or a ConnectionEvent.CONNECT_FAILURE event.
		 * It indicates that the individual Connection object has started an attempt to connect to
		 * Union Server.
		 */
		static BEGIN_CONNECT:string = 'BEGIN_CONNECT';

		/**
		 * Dispatched when an IConnection object initiates the "handshake" phase of a Union Server
		 * connection. During the handshake phase, the connection identifies the client to the
		 * server by sending a CLIENT_HELLO UPC message, and then waits for the server's response.
		 * If the connection is successfully initialized, the ConnectionEvent.READY event will
		 * follow. If not, the ConnectionEvent.CONNECT_FAILURE event will follow.
		 */
		static BEGIN_HANDSHAKE:string = 'BEGIN_HANDSHAKE';
		/**
		 * Dispatched when an IConnection object's connection to the server is closed by the client.
		 * The ConnectionEvent.CLIENT_KILL_CONNECT event is always followed by the
		 * ConnectionEvent.DISCONNECT event.
		 */
		static CLIENT_KILL_CONNECT:string = 'CLIENT_KILL_CONNECT';
		/**
		 * Dispatched when a connection attempt by an [[Connection]] object fails.
		 * Common causes of connection failures are:
		 * - No internet connection
		 * - Server not running
		 * - Server not running on specified port
		 * - Firewall has blocked specified port
		 * - Server and client are incompatible
		 * - Server's policy file does not authorize socket connections, and no backup HTTP
		 *   connections are defined
		 */
		static CONNECT_FAILURE:string = 'CONNECT_FAILURE';
		/**
		 * Dispatched when an IConnection object's connection to the server is closed.
		 * The ConnectionEvent.DISCONNECT is always preceded by either the
		 * ConnectionEvent.CLIENT_KILL_CONNECT event or the ConnectionEvent.SERVER_KILL_CONNECT,
		 * which indicate whether the client or server instigated the disconnection.
		 */
		static DISCONNECT:string = 'DISCONNECT';
		/**
		 * Dispatched when a [[Connection]] object achieves a fully initialized connection to the
		 * server. As a convenience, the ConnectionEvent.READY event, in turn, triggers a
		 * [[ConnectionManagerEvent.READY]] event, which triggers a [[OrbiterEvent.READY]] event.
		 */
		static READY:string = 'READY';
		/**
		 * Dispatched whenever any data is received from Union Server by an Connection object.
		 */
		static RECEIVE_DATA:string = 'RECEIVE_DATA';
		/**
		 * Dispatched when a UPC-formatted message is received by an Connection object.
		 */
		static RECEIVE_UPC:string = 'RECEIVE_UPC';

		/**
		 * Dispatched whenever any data is sent to Union Server over an Connection object.
		 */
		static SEND_DATA:string = 'SEND_DATA';
		/**
		 * Dispatched when an IConnection object's connection to the server is closed by the server.
		 * The ConnectionEvent.SERVER_KILL_CONNECT event is always followed by the
		 * ConnectionEvent.DISCONNECT event.
		 */
		static SERVER_KILL_CONNECT:string = 'SERVER_KILL_CONNECT';
		/**
		 * Dispatched when Union Server informs the client that a session id used in a message from
		 * the client refers to an unknown session.
		 */
		static SESSION_NOT_FOUND:string = 'SESSION_NOT_FOUND';
		/**
		 * Dispatched when Union Server informs the client that its session has been terminated.
		 */
		static SESSION_TERMINATED:string = 'SESSION_TERMINATED';

		constructor(public type:string, private upc?:string, private data?:string,
		            private connection?:Connection, private status?:string)
		{
			super(type);
		}

		/**
		 * Returns the data that was sent or received by the connection.
		 * The getData() method is available for the ConnectionEvent.SEND_DATA
		 * and ConnectionEvent.RECEIVE_DATA event only.
		 */
		getData():string|null
		{
			return this.data ?? null;
		}

		/**
		 * Returns the status of the event.
		 *
		 * The getStatus() method is available for the ConnectionEvent.CONNECT_FAILURE event only.
		 */
		getStatus():string|null
		{
			return this.status ?? null;
		}

		/**
		 * Returns the UPC message that was received by the connection.
		 *
		 * The getUPC() method is an internal tool used by MessageManager to extract information
		 * from UPC formatted messages. It is rarely, if ever, required by client developers.
		 *
		 * The getUPC() method is available for the [[ConnectionEvent.RECEIVE_UPC]] event only.
		 */
		getUPC():string|null
		{
			return this.upc ?? null;
		}

		toString():string
		{
			return '[object ConnectionEvent]';
		}

	}
}

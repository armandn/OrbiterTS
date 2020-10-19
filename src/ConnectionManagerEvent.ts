namespace net.user1.orbiter
{
	/**
	 * ConnectionManagerEvent is a simple data class used to pass information about a
	 * connection-manager event to registered event-listeners. The ConnectionManagerEvent class also
	 * defines constants representing the available connection-manager events.
	 */
	export class ConnectionManagerEvent extends net.user1.events.Event
	{
		/**
		 * An event triggered when a connection attempt by the ConnectionManager begins. The
		 * ConnectionManagerEvent.BEGIN_CONNECT event is followed by a
		 * ConnectionManagerEvent.SELECT_CONNECTION event, which indicates the specific Connection
		 * object the ConnectionManager will use for its connection attempt.
		 */
		static readonly BEGIN_CONNECT = 'BEGIN_CONNECT';

		/**
		 * An event triggered when the client closes an active connection.
		 * The ConnectionManagerEvent.CLIENT_KILL_CONNECT event is always followed by the
		 * ConnectionManagerEvent.DISCONNECT event.
		 */
		static readonly CLIENT_KILL_CONNECT = 'CLIENT_KILL_CONNECT';

		/**
		 * An event triggered when the ConnectionManager state changes (e.g., from
		 * "CONNECTION_IN_PROGRESS" to "READY"). For a list of possible states, see
		 * the [[ConnectionState]] class.
		 */
		static readonly CONNECTION_STATE_CHANGE = 'CONNECTION_STATE_CHANGE';

		/**
		 * An event triggered when a connection attempt by the [[ConnectionManager]] fails. Common
		 * causes of connection failures are:
		 * - No internet connection
		 * - Server not running
		 * - Server not running on specified port
		 * - Firewall has blocked specified port from all traffic, including HTTP
		 * - Server and client are incompatible
		 * - Server's policy file does not authorize socket connections, and no backup HTTP
		 *   connections are defined
		 *
		 * The ConnectionManagerEvent.CONNECT_FAILURE event is triggered by the ConnectionManager
		 * class when the ConnectionManager has attempted to connect using all of the connections in
		 * its connection list, and none of them successfully achieved a "ready" state. As a
		 * convenience, when a connection attempt fails, the Orbiter object also dispatches a
		 * OrbiterEvent.CLOSE event.
		 */
		static readonly CONNECT_FAILURE = 'CONNECT_FAILURE';

		/**
		 * An event triggered when either the client or the server closes an active connection. The
		 * ConnectionManagerEvent.DISCONNECT is always preceded by either the
		 * ConnectionManagerEvent.CLIENT_KILL_CONNECT event or the
		 * ConnectionManagerEvent.SERVER_KILL_CONNECT, which indicate whether the client or the
		 * server instigated the disconnection.
		 */
		static readonly DISCONNECT = 'DISCONNECT';

		/**
		 * An event triggered when one of the Connection objects in the [[ConnectionManager]]
		 * connection list achieves a READY state. As a convenience, the
		 * ConnectionManagerEvent.READY event, in turn, always triggers a OrbiterEvent.READY event.
		 * To retrieve a reference to the underlying Connection object that achieved the ready
		 * state, use [[ConnectionManager.getActiveConnection]] method.
		 */
		static readonly READY = 'READY';

		/**
		 * An event triggered when the [[ConnectionManager]] selects an [[Connection]] object for a
		 * connection attempt. Immediately after selecting the connection, the ConnectionManager
		 * attempts to connect it. Next, that individual Connection object dispatches its own
		 * [[ConnectionEvent]] events indicating whether it was able to connect to Union. If the
		 * individual Connection object cannot connect, the ConnectionManager automatically moves
		 * to the next available Connection object. If any of the Connection objects in the
		 * ConnectionManager's list successfully connects, then ConnectionManager triggers a
		 * ConnectionManagerEvent.READY event. If, on the other hand, none of the Connection objects
		 * connects, the ConnectionManager triggers a ConnectionManagerEvent.CONNECT_FAILURE event,
		 * indicating that it could not establish a connection via any of the Connection objects in
		 * its list.
		 */
		static readonly SELECT_CONNECTION = 'SELECT_CONNECTION';

		/**
		 * An event triggered when the server closes an active connection. The
		 * ConnectionManagerEvent.SERVER_KILL_CONNECT event is always followed by the
		 * ConnectionManagerEvent.DISCONNECT event.
		 */
		static readonly SERVER_KILL_CONNECT = 'SERVER_KILL_CONNECT';

		/**
		 * An event triggered when the server terminates a client session.
		 */
		static readonly SESSION_TERMINATED = 'SESSION_TERMINATED';

		constructor(type:string, private connection?:Connection, private status?:string)
		{
			super(type);
		}

		/**
		 * Returns the underlying Connection object to which this event pertains.
		 *
		 * The getConnection() method is available for the following events:
		 * - ConnectionManagerEvent.SELECT_CONNECTION
		 * - ConnectionManagerEvent.CLIENT_KILL_CONNECT
		 * - ConnectionManagerEvent.SERVER_KILL_CONNECT
		 * - ConnectionManagerEvent.DISCONNECT
		 */
		getConnection():Connection|null
		{
			return this.connection ?? null;
		}

		/**
		 * Returns the status of the event.
		 *
		 * The getStatus() method is available for the ConnectionManagerEvent.CONNECT_FAILURE event.
		 */
		getStatus():string|null
		{
			return this.status ?? null;
		}

		/**
		 * @internal
		 * @return {string}
		 */
		toString():string
		{
			return '[object ConnectionManagerEvent]';
		}
	}
}

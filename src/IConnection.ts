namespace net.user1.orbiter
{
	/**
	 * IConnection is the interface that all connection classes must implement in order to connect
	 * to Union. Connection classes are provided by the Orbiter, and are managed by the
	 * [[ConnectionManager]].
	 *
	 * To make a new connection to Union server, use [[Orbiter.connect]] method or
	 * [[ConnectionManager.connect]] method.
	 */
	export interface IConnection
	{
		/**
		 * Attempts to connect to Union Server at the current host and port. The result of the
		 * attempt is reported via [[ConnectionEvent.READY]] and
		 * [[ConnectionEvent.CONNECT_FAILURE]] events.
		 *
		 * The connect() method is not normally intended for direct use. Connections to the server
		 * should instead be made via the Orbiter or ConnectionManager classes.
		 */
		connect():void;

		/**
		 * Closes the connection to Union Server.
		 *
		 * The disconnect() method is not normally intended for direct use. Disconnections from the
		 * server should instead be requested via the Orbiter or ConnectionManager classes.
		 */
		disconnect():void;

		/**
		 * Sends the specified data to Union Server.
		 *
		 * The send() method is not intended for direct use. Data should be sent to the server via
		 * the Orbiter API. See the MessageManager, Room, RoomManager, Client, ClientManager, and
		 * Server classes. To access the raw strings sent via the send() method, register for the
		 * [[ConnectionEvent.SEND_DATA]] event.
		 */
		send(data:any):void;

		/**
		 * Assigns the host and port to use with the connect() method.
		 *
		 * @param   host   The server address (typically an IP address or domain name).
		 * @param   port   A port number between 1 and 65536. Note that ports
		 *                 from 1-7 are normally reserved for use by the operating
		 *                 system, and should therefore not be used by Orbiter
		 *                 applications.
		 */
		setServer(host:string, port:number):void;

		/**
		 * Returns the host on which the connection will be opened or has been opened.
		 *
		 * @return The host name or ip, as a string. For example, "example.com" or "192.168.0.1".
		 */
		getHost():string|null;

		/**
		 * Returns the host that was requested for this connection via [[setServer]]. If that host
		 * is a load balancing DNS server, the actual host used for the connection (as returned by
		 * getHost()) might differ from the requested host.
		 *
		 * @return The requested host name or ip, as a string. For example, "example.com" or
		 *         "192.168.0.1".
		 */
		getRequestedHost():string|null;

		/**
		 * Returns the port on which the connection will be opened or has been opened.
		 *
		 * @return A number from 1 to 65535.
		 */
		getPort():number|null;

		/**
		 * Assigns the Orbiter object for which this IConnection will provide server communication
		 * services. This method is invoked automatically by the ConnectionManager when the
		 * IConnection object is added to the ConnectionManager's connection list.
		 *
		 * @param   orbiter A Orbiter instance.
		 */
		setOrbiter(orbiter:Orbiter):void;

		/**
		 * Returns the type of the connection, as one of the types specified by the ConnectionType
		 * class.
		 *
		 * @return A string representing the connection type.
		 */
		getType():string|null;

		/**
		 * Permanently disables the connection object.
		 */
		dispose():void;

		/**
		 * Indicates whether this connection is currently in a "ready" state.
		 */
		isReady():boolean;

		/**
		 * Indicates whether this connection is considered valid. Valid connections
		 * are those that are currently in a "ready" state, or are currently
		 * disconnected but successfully achieved a "ready" state in the most
		 * recent connection attempt.
		 */
		isValid():boolean;

		/**
		 * @private
		 */
		applyAffinity ():void;

		/**
		 * Provides a string representation of this object.
		 */
		toString():string;
	}
}

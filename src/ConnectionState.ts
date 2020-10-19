namespace net.user1.orbiter
{
	/**
	 * The ClientConnectionState class is an enumeration of constant values representing the state
	 * of a client's current connection to the server.
	 *
	 * To retrieve the current client's connection state, use
	 * [[ConnectionManager.getConnectionState]] method.
	 *
	 * To retrieve the connection state of any other client, use  [[Client.getConnectionState]]
	 * method.
	 *
	 * To retrieve the connection state of a user account, use
	 * [[UserAccount.getConnectionState]] method.
	 */
	export enum ConnectionState
	{
		/**
		 * A connection state indicating that the client's current connection state cannot be
		 * determined. Connection state can become unknown when the current client is made aware of
		 * another client's existence (for example, by joining the same room as the other client),
		 * but then loses verifiable knowledge of the other client (for example, by leaving the
		 * room).
		 */
		UNKNOWN = -1,

		/**
		 * For the current client, NOT_CONNECTED means there is no active connection to Union
		 * Server, and no attempted connection or disconnection is in progress; for a UserAccount
		 * object, NOT_CONNECTED means that the account is not currently logged in.
		 */
		NOT_CONNECTED = 0,

		/**
		 * A connection state indicating that the client has a fully established connection to Union
		 * Server, and has successfully negotiated a client/server handshake.
		 */
		READY                     = 1,

		/**
		 * A connection state indicating that the client is attempting to connect to Union Server,
		 * but has not yet successfully negotiated a client/server handshake.
		 */
		CONNECTION_IN_PROGRESS = 2,

		/**
		 * A connection state indicating that the client has begun the process of disconnecting from
		 * Union Server.
		 */
		DISCONNECTION_IN_PROGRESS = 3,

		/**
		 * A connection state indicating that the client has a fully established connection to Union
		 * Server, has successfully negotiated a client/server handshake, and has successfully
		 * logged into a server-side user account.
		 */
		LOGGED_IN = 4
	}
}


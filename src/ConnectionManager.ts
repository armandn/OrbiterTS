namespace net.user1.orbiter
{
	/**
	 * The ConnectionManager class manages all connections made by an application to Union Server.
	 * In most applications, the ConnectionManager class is not used directly. Instead, connections
	 * to Union Server are made via the [[Orbiter.connect]] method, and disconnections are requested
	 * via the [[Orbiter.disconnect]] method. However, ConnectionManager provides more control over
	 * the connection process than the Orbiter class offers. Specifically, the ConnectionManager
	 * provides the following services:
	 * - Granular access to the following events: [[ConnectionManagerEvent.READY]],
	 *   [[ConnectionManagerEvent.CONNECT_FAILURE]], [[ConnectionManagerEvent.DISCONNECT]],
	 *   [[ConnectionManagerEvent.CLIENT_KILL_CONNECT]],
	 *   [[ConnectionManagerEvent.SERVER_KILL_CONNECT]].
	 *   Note that all of the preceding connection-failure events also trigger
	 *   [[OrbiterEvent.CLOSE]], which provides a single, central location for code that should
	 *   execute whenever the application enters a disconnected state. Applications that simply wish
	 *   to know when the Orbiter object is no longer ready for use need not handle the individual
	 *   ConnectionManagerEvent  events, and instead should listen for OrbiterEvent.CLOSE only.
	 * - Multiple-host connection configuration. For example, suppose an application wishes to
	 *   configure connections to two separate hosts: "example.com" on port 80, and "tryunion.com"
	 *   on  port 80. When the connection to "example.com" is not available, the application should
	 *   connect to "tryunion.com". Instead of connecting via the [[Orbiter.connect]] method, which
	 *   allows multiple ports on a single host only, the application configures its connections via
	 *   the ConnectionManager, as follows:
	 *   ```
	 *       var connectionManager = orbiter.getConnectionManager();
	 *       connectionManager.addConnection(new XMLSocketConnection("example.com", 80));
	 *       connectionManager.addConnection(new XMLSocketConnection("tryunion.com", 80));
	 *       connectionManager.connect();
	 *   ```
	 *   Note, however, that when socket connections are configured manually via addConnection(),
	 *   any desired backup HTTP connections must also be configured manually.
	 * - Low-level connection-data access. The [[ConnectionManager.getActiveConnection]] method
	 *   gives applications direct access to the Connection object used to transmit data between
	 *   Union Server and the Orbiter application. By registering with that object for the
	 *   [[ConnectionEvent.SEND_DATA ]]and [[ConnectionEvent.RECEIVE_DATA]] events, the application
	 *   can access the raw data being sent and received over the connection.
	 *
	 * To access the ConnectionManager, use [[Orbiter.getConnectionManager]] method.
	 */
	export class ConnectionManager extends net.user1.events.EventDispatcher
	{
		static readonly DEFAULT_READY_TIMEOUT = 10000;

		public connectionState:ConnectionState = ConnectionState.NOT_CONNECTED;
		private activeConnection?:Connection;
		private affinityData?:net.user1.utils.LocalData|net.user1.utils.MemoryStore;
		private attemptedConnections?:Connection[];
		private connectAbortCount:number = 0;
		private connectAttemptCount:number = 0;
		private connectFailedCount:number = 0;
		private connections:Connection[] = [];
		private currentConnectionIndex:number = 0;
		private inProgressConnection?:Connection;
		private readyCount:number = 0;
		private readyTimeout:number = 0;

		constructor(private orbiter:Orbiter)
		{
			super();

			this.setReadyTimeout(ConnectionManager.DEFAULT_READY_TIMEOUT);

			// Initialization
			// Make all Orbiter instances in this VM share the same server affinity 
			this.setGlobalAffinity(true);
		}

		/**
		 * Adds a new IConnection object to this ConnectionManager's connection list. The connection
		 * list specifies the connections that should be attempted, in the order they were added,
		 * when connecting to Union Server. To connect to Union Server, use the
		 * [[Orbiter.connect]] method or the [[ConnectionManager.connect]] method.
		 */
		addConnection(connection?:Connection):void
		{
			if (connection)
			{
				this.orbiter.getLog().info(`[CONNECTION_MANAGER] New connection added. ${connection.toString()}.`);
				connection.setOrbiter(this.orbiter);
				this.connections.push(connection);
			}
		}

		/**
		 * Attempts to connect to Union Server using the currently specified
		 * list of connection objects. If any of the connections in the list succeeds,
		 * ConnectionManager dispatches the [[ConnectionManagerEvent.READY]]
		 * event, and the Orbiter object dispatches a [[OrbiterEvent.READY]] event.
		 * If, however, _all_ of the connections in the list fail,
		 * ConnectionManager dispatches the [[ConnectionManagerEvent.CONNECT_FAILURE]]
		 * event, and the Orbiter object dispatches a [[OrbiterEvent.CLOSE]] event.
		 *
		 * Applications that use ConnectionManager's connect() method directly
		 * must first add at least one Connection object to the ConnectionManager.
		 *
		 * Connections are attempted in the order they
		 * were added to the connection list.
		 *
		 * Each time the ConnectionManager moves to the next connection in its
		 * list, it triggers the [[ConnectionManagerEvent.SELECT_CONNECTION]] event.
		 *
		 * Note, however, that the ConnectionManager class's connect() method
		 * is not used directly by most applications. Instead, to connect to the server,
		 * applications typically use the Orbiter class's more convenient connect() method,
		 * which delegates its work to the ConnectionManager class's connect() method.
		 *
		 * However, note that while the Orbiter class's version of connect() is
		 * less verbose than ConnectionManager's connect() method, it cannot specify
		 * multiple hosts for multiple connections.
		 */
		connect():void
		{
			if (this.connections.length == 0)
			{
				this.orbiter.getLog().error('[CONNECTION_MANAGER] No connections defined. Connection request ignored.');
				return;
			}

			this.connectAttemptCount++;
			this.attemptedConnections = [];

			switch (this.connectionState)
			{
				case ConnectionState.CONNECTION_IN_PROGRESS:
					this.orbiter.getLog().info(`[CONNECTION_MANAGER] Connection attempt already in progress. Existing attempt must be aborted before new connection attempt begins...`);
					this.disconnect();
					break;

				case ConnectionState.READY:
					this.orbiter.getLog().info(`[CONNECTION_MANAGER] Existing connection to Union must be disconnected before new connection attempt begins.`);
					this.disconnect();
					break;
			}
			this.setConnectionState(ConnectionState.CONNECTION_IN_PROGRESS);

			this.orbiter.getLog().debug('[CONNECTION_MANAGER] Searching for most recent valid connection.');
			const originalConnectionIndex = this.currentConnectionIndex;
			while (!this.getCurrentConnection()?.isValid())
			{
				this.advance();
				if (this.currentConnectionIndex == originalConnectionIndex)
				{
					// Couldn't find a valid connection, so start the connection with
					// the first connection in the connection list
					this.orbiter.getLog().debug('[CONNECTION_MANAGER] No valid connection found. Starting connection attempt with first connection.');
					this.currentConnectionIndex = 0;
					break;
				}
			}

			this.dispatchBeginConnect();
			this.connectCurrentConnection();
		}

		/**
		 * Terminates any open connection to the server. If the disconnection attempt
		 * succeeds, ConnectionManager dispatches the
		 * [[ConnectionManagerEvent.CLIENT_KILL_CONNECT]] and [[ConnectionManagerEvent.DISCONNECT]]
		 * events, and the Orbiter object dispatches an [[OrbiterEvent.CLOSE]] event.
		 */
		disconnect():void
		{
			if (this.connections.length == 0)
			{
				this.dispatchConnectFailure('No connections defined. Disconnection attempt failed.');
				return;
			}

			switch (this.connectionState)
			{
				// Currently connected
				case ConnectionState.READY:
					this.orbiter.getLog().info(`[CONNECTION_MANAGER] Closing existing connection: ${this.getActiveConnection()?.toString()}`);
					this.setConnectionState(ConnectionState.DISCONNECTION_IN_PROGRESS);
					this.disconnectConnection(this.getActiveConnection() ?? undefined);
					break;

				// Currently attempting to connect
				case ConnectionState.CONNECTION_IN_PROGRESS:
					this.orbiter.getLog().info(`[CONNECTION_MANAGER] Aborting existing connection attempt: ${this.getInProgressConnection()?.toString()}`);
					this.connectAbortCount++;
					this.setConnectionState(ConnectionState.DISCONNECTION_IN_PROGRESS);
					this.disconnectConnection(this.getInProgressConnection() ?? undefined);
					this.orbiter.getLog().info('[CONNECTION_MANAGER] Connection abort complete.');
					break;

				// Currently attempting to disconnect
				case ConnectionState.DISCONNECTION_IN_PROGRESS:
					this.orbiter.getLog().info(`[CONNECTION_MANAGER] Disconnection request ignored. Already disconnecting.`);
					break;
			}
		}

		/**
		 * @internal
		 */
		dispatchSessionTerminated():void
		{
			this.dispatchEvent(new ConnectionManagerEvent(ConnectionManagerEvent.SESSION_TERMINATED));
		}

		/**
		 * Permanently disables this object and releases all of its resources. Once dispose() is
		 * called, the object can never be used again. Use dispose() only when purging an object
		 * from memory.
		 *
		 * To simply disconnect from Union Server, use [[disconnect]], not dispose().
		 */
		dispose():void
		{
			this.removeAllConnections();
			this.attemptedConnections = undefined;
			this.activeConnection = undefined;
			this.inProgressConnection = undefined;

			//@ts-ignore
			this.connections = undefined;
		}

		/**
		 * If a connection is currently connected, getActiveConnection() returns that connection;
		 * otherwise, getActiveConnection() returns null.
		 */
		getActiveConnection():Connection|null
		{
			return this.activeConnection ?? null;
		}

		/**
		 * Returns the actual server address that will be used when a connection to the specified
		 * host is requested. When the current client connects to a Union Server cluster, and the
		 * specified host is a DNS server that forwards connection requests to a server node in the
		 * cluster, getAffinity() returns the address (public name or IP) of that server node.
		 * Similarly, when the current client connects to a DNS server that redirects to a Union
		 * Server instance, getAffinity() returns the address (public name or IP) of that instance.
		 * When the current client connects to a Union Server instance directly, the address
		 * returned by getAffinity() is always identical to the supplied host.
		 */
		getAffinity(host:string):string
		{
			const address = this.affinityData?.read('affinity', host + 'address'),
			      until   = parseFloat(this.affinityData?.read('affinity', host + 'until') ?? '');

			if (address)
			{
				const now = new Date().getTime();
				if (now >= until)
				{
					this.orbiter.getLog().warn(`[CONNECTION_MANAGER] Affinity duration expired for address [${address}], host [${host}]. Removing affinity.`);
					this.clearAffinity(host);
				}
				else
				{
					return address;
				}
			}

			return host;
		}

		/**
		 * Returns an integer indicating the number of times this ConnectionManager object has
		 * aborted an in-progress connection attempt since the last successful connection was made.
		 */
		getConnectAbortCount():number
		{
			return this.connectAbortCount;
		}

		/**
		 * Returns an integer indicating the number of times this ConnectionManager object has
		 * attempted to connect to the server  since the last successful connection was established.
		 */
		getConnectAttemptCount():number
		{
			return this.connectAttemptCount;
		}

		/**
		 * Returns an integer indicating the number of failed connection attempts this
		 * ConnectionManager object has made since the last successful connection was established.
		 * Whenever a successful connection is established, the connect-failed count returns to zero.
		 */
		getConnectFailedCount():number
		{
			return this.connectFailedCount;
		}

		/**
		 * Returns the ConnectionManager's current state. For a list of possible states, see the
		 * [[ConnectionState]] class.
		 */
		getConnectionState():ConnectionState
		{
			return this.connectionState;
		}

		/**
		 * Returns a one-time snapshot of the ConnectionManager's connection list,
		 * as an Array. Each element of the array is an Connection object.
		 */
		getConnections():Connection[]
		{
			return this.connections.slice();
		}

		/**
		 * Returns the connection that would be opened next if [[connect]] were called.
		 */
		getCurrentConnection():Connection|null
		{
			return this.connections[this.currentConnectionIndex];
		}

		/**
		 * If a connection is currently in progress, getInProgressConnection() returns
		 * that connection; otherwise, getInProgressConnection() returns null.
		 */
		getInProgressConnection():Connection|null
		{
			return this.inProgressConnection ?? null;
		}

		/**
		 * Returns an integer indicating the number of times this ConnectionManager object has
		 * successfully established a valid connection to the server. The count is increased when
		 * the [[ConnectionEvent.READY]] event occurs.
		 */
		getReadyCount():number
		{
			return this.readyCount;
		}

		/**
		 * The maximum time each Connection object allows for its setup phase to complete when
		 * attempting to connect to Union Server.
		 */
		getReadyTimeout():number
		{
			return this.readyTimeout;
		}

		/**
		 * Returns a Boolean indicating whether the ConnectionManager currently has an active
		 * connection to Union Server.
		 * @return Returns true if Orbiter is currently connected to the server; false otherwise.
		 */
		isReady():boolean
		{
			return this.connectionState == ConnectionState.READY;
		}

		/**
		 * Removes all Connection objects from this ConnectionManager's connection list. Any
		 * connection that is currently open will be disconnected. Until new connections are added
		 * via [[addConnection]], subsequent calls to [[connect]] or [[disconnect]] will fail.
		 */
		removeAllConnections():void
		{
			if (this.connections.length == 0)
			{
				this.orbiter.getLog().info(`[CONNECTION_MANAGER] removeAllConnections() ignored.  No connections to remove.`);
				return;
			}

			this.orbiter.getLog().info('[CONNECTION_MANAGER] Removing all connections...');
			this.disconnect();
			while (this.connections.length > 0)
			{
				this.removeConnection(this.connections[0]);
			}
			this.currentConnectionIndex = 0;
			this.orbiter.getLog().info('[CONNECTION_MANAGER] All connections removed.');
		}

		/**
		 * Removes the specified Connection object from this ConnectionManager's connection list.
		 * If the connection is currently open, it is disconnected before removal.
		 */
		removeConnection(connection?:Connection):boolean
		{
			if (connection)
			{
				connection.disconnect();
				this.removeConnectionListeners(connection);
				return net.user1.utils.ArrayUtil.remove(this.connections, connection);
			}
			else
			{
				return false;
			}
		}

		/**
		 * @internal
		 */
		setAffinity(host:string, address:string, duration:number):void
		{
			const until = new Date().getTime() + (duration * 60 * 1000);
			// Don't use JSON stringify for affinity values because not all JavaScript
			// environments support JSON natively (e.g., non-browser VMs)
			this.affinityData?.write('affinity', host + 'address', address);
			this.affinityData?.write('affinity', host + 'until', until.toString());

			this.orbiter.getLog().info(`[CONNECTION_MANAGER] Assigning affinity address [${address}] for supplied host [${host}]. Duration (minutes): ${duration}`);
		}

		/**
		 * Sets the ConnectionManager's current state.
		 */
		setConnectionState(state:ConnectionState):void
		{
			let changed = false;
			if (state != this.connectionState)
			{
				changed = true;
			}

			this.connectionState = state;
			if (changed)
			{
				this.dispatchConnectionStateChange();
			}
		}

		/**
		 * Specifies whether the current client's ConnectionManager will use global server affinity
		 * or local server affinity. When enabled is true (default), server affinity is set to
		 * global, and the ConnectionManager uses the affinity value shared by all clients in the
		 * current environment. When enabled is false, server affinity is set to local, and the
		 * ConnectionManager for the current client maintains its own, individual server affinity.
		 *
		 * For example, imagine a client application with two Orbiter instances, both of which
		 * connect to a Union Server cluster. The cluster is accessed via a round-robin DNS server,
		 * pool.example.com, and server affinity is global. The first Orbiter instance connects to
		 * pool.example.com, and is redirected to slave1.example.com. Upon connection, the affinity
		 * address slave1.example.com is assigned for host pool.example.com. Then the second Orbiter
		 * instance connects. Because affinity is global, the second Orbiter instance finds affinity
		 * address slave1.example.com for host pool.example.com, and connects directly to
		 * slave1.example.com, bypassing pool.example.com entirely.
		 *
		 * Now imagine the same application with server affinity set to local. The first Orbiter
		 * instance connects to pool.example.com, and is redirected to slave1.example.com as before.
		 * Upon connection, the affinity address slave1.example.com is assigned for host
		 * pool.example.com. Then the second Orbiter instance connects. Because affinity is local,
		 * the second Orbiter instance has no affinity established for pool.example.com, and
		 * therefore connects to pool.example.com, not slave1.example.com. The pool.example.com DNS
		 * server redirects the second Orbiter instance to slave2.example.com. Upon connection, the
		 * affinity address slave2.example.com is assigned for host pool.example.com in the second
		 * Orbiter instance's affinity map. For the duration specified by the server's affinity
		 * configuration, the first Orbiter instance communicates with slave1.example.com and the
		 * second Orbiter instance communicates with slave2.example.com. Compare with the preceding
		 * global affinity example, where the first Orbiter instance and the second Orbiter instance
		 * both communicate with slave1.example.com.
		 */
		setGlobalAffinity(enabled:boolean):void
		{
			if (enabled)
			{
				this.orbiter.getLog().info(`[CONNECTION_MANAGER] Global server affinity selected. Using current environment's shared server affinity.`);
				this.affinityData = new net.user1.utils.LocalData();
			}
			else
			{
				this.orbiter.getLog().info(`[CONNECTION_MANAGER] Local server affinity selected. The current client will maintain its own, individual server affinity.`);
				this.affinityData = new net.user1.utils.MemoryStore();
			}
		}

		/**
		 * Sets the maximum time each Connection object allows for its setup phase to complete when
		 * attempting to connect to Union Server.
		 *
		 * When an Connection object attempts to connect to Union Server, it starts a "handshake"
		 * process during which client setup tasks (such as issuing a client ID) are performed. If
		 * the setup tasks are not completed within an allowed limit known as the "ready timeout,"
		 * then the Connection object considers the setup process a failure and automatically aborts
		 * the connection attempt. If, on the other hand, the client setup process completes within
		 * the ready-timeout limit, then the Connection object considers the setup process a success
		 * and triggers a [[ConnectionEvent.READY]] event indicating that the connection is ready
		 * for use. The ready timeout defaults to 10 seconds, but can be changed via the
		 * setReadyTimeout() method.
		 *
		 * Once an Connection object achieves a ready state,Orbiter continues to monitor the
		 * connection to the server by sending regular heartbeat messages. By default, one heartbeat
		 * message is sent every 10 seconds, but the heartbeat message frequency is configurable via
		 * [[ConnectionMonitor.setHeartbeatFrequency]] method. If Union Server takes longer than 60
		 * seconds (by default) to respond to single heartbeat, Orbiter will automatically
		 * disconnect. To change the duration that Orbiter will tolerate for a heartbeat response,
		 * use [[ConnectionMonitor.setConnectionTimeout]] method.
		 *
		 * @param milliseconds The time within which a connection must achieve a ready state,
		 *                     in milliseconds.
		 *
		 * The following code lengthens the default ready timeout to 20 seconds. As a result,
		 * Orbiter will automatically disconnect from Union Server when the client-setup process
		 * does not complete within 20 seconds.
		 *
		 * ```
		 *     const orbiter = new Orbiter();
		 *     orbiter.getConnectionManager().setReadyTimeout(20000);
		 * ```
		 */
		setReadyTimeout(milliseconds:number):void
		{
			if (milliseconds > 0)
			{
				this.readyTimeout = milliseconds;
				this.orbiter.getLog().info(`[CONNECTION_MANAGER] Ready timeout set to ${milliseconds} ms.`);
				if (milliseconds < 3000)
				{
					this.orbiter.getLog().warn(`[CONNECTION_MANAGER] Current ready timeout (${milliseconds}) may not allow sufficient time to connect to Union Server over a typical internet connection.`);
				}
			}
			else
			{
				this.orbiter.getLog().warn(`[CONNECTION_MANAGER] Invalid ready timeout specified: ${milliseconds}. Duration must be greater than zero.`);
			}
		}

		private addConnectionListeners(connection:Connection):void
		{
			if (connection)
			{
				connection.addEventListener(ConnectionEvent.READY, this.readyListener, this);
				connection.addEventListener(ConnectionEvent.CONNECT_FAILURE, this.connectFailureListener, this);
				connection.addEventListener(ConnectionEvent.DISCONNECT, this.disconnectListener, this);
				connection.addEventListener(ConnectionEvent.CLIENT_KILL_CONNECT, this.clientKillConnectListener, this);
				connection.addEventListener(ConnectionEvent.SERVER_KILL_CONNECT, this.serverKillConnectListener, this);
			}
		}

		private advance():void
		{
			this.currentConnectionIndex++;
			if (this.currentConnectionIndex == this.connections.length)
			{
				this.currentConnectionIndex = 0;
			}
		}

		private advanceAndConnect():void
		{
			if (!this.connectAttemptComplete())
			{
				this.advance();
				this.connectCurrentConnection();
			}
			else
			{
				// Tried all connections, so give up and dispatch CONNECT_FAILURE
				this.connectFailedCount++;
				this.setConnectionState(ConnectionState.NOT_CONNECTED);
				this.orbiter.getLog().info('[CONNECTION_MANAGER] Connection failed for all specified hosts and ports.');
				this.dispatchConnectFailure(`Connection failed for all specified hosts and ports.`);
			}
		}

		private clearAffinity(host:string):void
		{
			this.affinityData?.remove('affinity', host + 'address');
			this.affinityData?.remove('affinity', host + 'until');
		}

		private clientKillConnectListener(e:ConnectionEvent):void
		{
			this.dispatchClientKillConnect(e.target as unknown as Connection);
			// This event is always followed by a DISCONNECT event
		}

		private connectAttemptComplete():boolean
		{
			return this.attemptedConnections?.length == this.connections.length;
		}

		private connectCurrentConnection():void
		{
			// If there are no Connections defined, fail immediately
			if (this.connections.length == 0)
			{
				this.setConnectionState(ConnectionState.NOT_CONNECTED);
				this.connectFailedCount++;
				this.dispatchConnectFailure('No connections defined. Connection attempt failed.');
				return;
			}

			this.inProgressConnection = this.getCurrentConnection() ?? undefined;

			// If the requested connection has already been attempted this round,
			// ignore it.
			if (this.inProgressConnection && this.attemptedConnections?.indexOf(this.inProgressConnection) != -1)
			{
				this.advanceAndConnect();
				return;
			}

			this.inProgressConnection && this.dispatchSelectConnection(this.inProgressConnection);
			this.orbiter.getLog().info(`[CONNECTION_MANAGER] Attempting connection via ${this.inProgressConnection?.toString()}. (Connection ${(this.attemptedConnections?.length ?? 0) + 1} of ${this.connections.length}. Attempt ${this.connectAttemptCount} since last successful connection).`);
			this.inProgressConnection && this.addConnectionListeners(this.inProgressConnection);
			this.inProgressConnection?.connect();
		}

		private connectFailureListener(e:ConnectionEvent):void
		{
			const failedConnection = e.target as unknown as Connection;

			this.orbiter.getLog().warn(`[CONNECTION_MANAGER] Connection failed for ${failedConnection?.toString()}. Status: [${e.getStatus()}]`);

			this.removeConnectionListeners(failedConnection);
			this.inProgressConnection = undefined;

			if (this.connectionState == ConnectionState.DISCONNECTION_IN_PROGRESS)
			{
				this.dispatchConnectFailure('Connection closed by client.');
			}
			else
			{
				if (failedConnection.getHost() != failedConnection.getRequestedHost())
				{
					this.orbiter.getLog().info(`[CONNECTION_MANAGER] Connection failed for affinity address [${failedConnection.getHost()}]. Removing affinity.`);
					this.clearAffinity(failedConnection.getRequestedHost() ?? '');
				}

				this.attemptedConnections?.push(failedConnection);
				this.advanceAndConnect();
			}
		}

		private disconnectConnection(connection?:Connection):void
		{
			connection?.disconnect();
		}

		private disconnectListener(e:ConnectionEvent):void
		{
			this.setConnectionState(ConnectionState.NOT_CONNECTED);
			this.removeConnectionListeners(e.target as unknown as Connection);
			this.activeConnection = undefined;
			this.dispatchDisconnect(e.target as unknown as Connection);
		}

		private dispatchBeginConnect():void
		{
			this.dispatchEvent(new ConnectionManagerEvent(ConnectionManagerEvent.BEGIN_CONNECT));
		}

		private dispatchClientKillConnect(connection:Connection):void
		{
			this.dispatchEvent(new ConnectionManagerEvent(ConnectionManagerEvent.CLIENT_KILL_CONNECT, connection));
		}

		private dispatchConnectFailure(status:string):void
		{
			this.dispatchEvent(new ConnectionManagerEvent(ConnectionManagerEvent.CONNECT_FAILURE, undefined, status));
		}

		private dispatchConnectionStateChange():void
		{
			this.dispatchEvent(new ConnectionManagerEvent(ConnectionManagerEvent.CONNECTION_STATE_CHANGE));
		}

		private dispatchDisconnect(connection:Connection):void
		{
			this.dispatchEvent(new ConnectionManagerEvent(ConnectionManagerEvent.DISCONNECT, connection));
		}

		private dispatchReady():void
		{
			this.dispatchEvent(new ConnectionManagerEvent(ConnectionManagerEvent.READY));
		}

		private dispatchSelectConnection(connection:Connection):void
		{
			this.dispatchEvent(new ConnectionManagerEvent(ConnectionManagerEvent.SELECT_CONNECTION, connection));
		}

		private dispatchServerKillConnect(connection:Connection):void
		{
			this.dispatchEvent(new ConnectionManagerEvent(ConnectionManagerEvent.SERVER_KILL_CONNECT, connection));
		}

		private readyListener(e:ConnectionEvent):void
		{
			this.setConnectionState(ConnectionState.READY);
			this.inProgressConnection = undefined;
			this.activeConnection = e.target as unknown as Connection;
			this.readyCount++;
			this.connectFailedCount = 0;
			this.connectAttemptCount = 0;
			this.connectAbortCount = 0;
			this.dispatchReady();
		};

		private removeConnectionListeners(connection?:Connection):void
		{
			if (connection)
			{
				connection.removeEventListener(ConnectionEvent.READY, this.readyListener, this);
				connection.removeEventListener(ConnectionEvent.CONNECT_FAILURE, this.connectFailureListener, this);
				connection.removeEventListener(ConnectionEvent.DISCONNECT, this.disconnectListener, this);
				connection.removeEventListener(ConnectionEvent.CLIENT_KILL_CONNECT, this.clientKillConnectListener, this);
				connection.removeEventListener(ConnectionEvent.SERVER_KILL_CONNECT, this.serverKillConnectListener, this);
			}
		}

		private serverKillConnectListener(e:ConnectionEvent):void
		{
			this.dispatchServerKillConnect(e.target as unknown as Connection);
			// This event is always followed by a DISCONNECT event
		}
	}
}

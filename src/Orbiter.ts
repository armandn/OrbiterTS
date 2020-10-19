namespace net.user1.orbiter
{
	import ConsoleLogger = net.user1.logger.ConsoleLogger;
	import Logger = net.user1.logger.Logger;
	import Snapshot = snapshot.Snapshot;

	/**
	 * The Orbiter class is the root class of every Orbiter client application.
	 * It provides basic tools for connecting to Union server, and gives
	 * the application access to the core Orbiter system modules, including:
	 * - [[RoomManager]]
	 * - [[ClientManager]]
	 * - [[MessageManager]]
	 * - [[AccountManager]]
	 * - [[ConnectionManager]]
	 * - [[ConnectionMonitor]]
	 * - [[Statistics]]
	 */
	export class Orbiter extends net.user1.events.EventDispatcher
	{
		private readonly accountMan:AccountManager;
		private readonly clientMan:ClientManager;
		private readonly connectionMan:ConnectionManager;
		private readonly connectionMonitor:ConnectionMonitor;
		private readonly coreMsgListener:CoreMessageListener;
		private readonly log:net.user1.logger.Logger;
		private readonly messageMan:MessageManager;
		private readonly roomMan:RoomManager;
		private readonly server:Server;
		private readonly snapshotMan:SnapshotManager;
		private readonly system:System;

		readonly window?:Window;

		private clientID?:string;
		private consoleLogger?:ConsoleLogger;
		private coreEventLogger:CoreEventLogger;
		private httpFailoverEnabled:boolean;
		private sessionID?:string;
		private statistics?:Statistics;
		private useSecureConnect:boolean = false;

		constructor(configURL:string, traceLogMessages:boolean=true)
		{
			super();

			// Initialization. For non-browser environments, set window to null.
			this.window = typeof window == 'undefined' ? undefined : window;

			// Initialize system versions
			this.system = new System(this.window);

			// Set up the this.log.
			this.log = new net.user1.logger.Logger();

			// Output host version information.
			if (typeof navigator != 'undefined')
			{
				this.log.info(`User Agent: ${navigator.userAgent} ${navigator.platform}`);
			}

			this.log.info(`Union Client Version: ${this.system.getClientType()} ${this.system.getClientVersion().toStringVerbose()}`);
			this.log.info(`Client UPC Protocol Version: ${this.system.getUPCVersion().toString()}`);
			this.consoleLogger = undefined;

			// Set up the connection manager.
			this.connectionMan = new ConnectionManager(this);

			// Set up the room manager.
			this.roomMan = new RoomManager(this);

			// Set up the message manager.
			this.messageMan = new MessageManager(this.log, this.connectionMan);

			// Set up the server
			this.server = new Server(this);

			// Make the account manager.
			this.accountMan = new AccountManager(this.log);

			// Set up the client manager.
			this.clientMan = new ClientManager(this.roomMan, this.accountMan, this.connectionMan, this.messageMan, this.server, this.log);

			// Set up the account manager.
			this.accountMan.setClientManager(this.clientMan);
			this.accountMan.setMessageManager(this.messageMan);
			this.accountMan.setRoomManager(this.roomMan);

			// Set up the snapshot manager.
			this.snapshotMan = new SnapshotManager(this.messageMan);

			// Set up the core message listener
			this.coreMsgListener = new CoreMessageListener(this);

			// Log the core events
			this.coreEventLogger = new CoreEventLogger(this.log, this.connectionMan, this.roomMan, this.accountMan, this.server, this.clientMan, this);

			// Register for ConnectionManager events.
			this.connectionMan.addEventListener(ConnectionManagerEvent.READY,           this.readyListener,          this);
			this.connectionMan.addEventListener(ConnectionManagerEvent.CONNECT_FAILURE, this.connectFailureListener, this);
			this.connectionMan.addEventListener(ConnectionManagerEvent.DISCONNECT,      this.disconnectListener,     this);

			// Set up the connection monitor
			this.connectionMonitor = new ConnectionMonitor(this);
			this.connectionMonitor.restoreDefaults();

			// Register to be notified when a new connection is about to be opened
			this.connectionMan.addEventListener(ConnectionManagerEvent.SELECT_CONNECTION, this.selectConnectionListener, this);

			// Enable HTTP failover connections
			this.httpFailoverEnabled = true;

			if (traceLogMessages)
			{
				this.enableConsole();
			}

			// If the Orbiter wasn't constructed with a config argument...
			if (configURL == null || configURL == '')
			{
				this.log.info('[ORBITER] Initialization complete.');
			}
			else
			{
				// ...otherwise, retrieve system settings from specified config file.
				this.loadConfig(configURL);
			}
		}

		private buildConnection(host:string, port:number, type:string, sendDelay:number):void
		{
			let connection:Connection;

			switch (type)
			{
				case ConnectionType.HTTP:
					if (this.system.hasHTTPDirectConnection())
					{
						connection = new HTTPDirectConnection();
					}
					else
					{
						connection = new HTTPIFrameConnection();
					}
					break;

				case ConnectionType.SECURE_HTTP:
					if (this.system.hasHTTPDirectConnection())
					{
						connection = new SecureHTTPDirectConnection();
					}
					else
					{
						connection = new SecureHTTPIFrameConnection();
					}
					break;

				case ConnectionType.WEBSOCKET:
					connection = new WebSocketConnection();
					break;

				case ConnectionType.SECURE_WEBSOCKET:
					connection = new SecureWebSocketConnection();
					break;

				default:
					throw new Error(`[ORBITER] Error at buildConnection(). Invalid type specified: [${type}]`);
			}

			try
			{
				connection.setServer(host, port);
			}
			catch (e)
			{
				this.log.error(`[CONNECTION] ${connection.toString()} ${e}`);
			}
			finally
			{
				this.connectionMan.addConnection(connection);
				if (connection instanceof HTTPConnection)
				{
					// Set delay after adding connection so the connection object has
					// access to this Orbiter object
					if (sendDelay != null)
					{
						connection.setSendDelay(sendDelay);
					}
				}
			}
		}

		private configErrorListener(e?:Event)
		{
			this.log.fatal('[ORBITER] Configuration file could not be loaded.');
		}

		private configLoadCompleteListener(request:XMLHttpRequest):void
		{
			const config = request.responseXML;
			if ((request.status != 200 && request.status != 0) || config == null)
			{
				this.log.error('[ORBITER] Configuration file failed to load.');
				return;
			}
			this.log.error('[ORBITER] Configuration file loaded.');
			try
			{
				const loglevel = this.getTextForNode(config, 'logLevel');
				if (loglevel != null)
				{
					this.log.setLevel(loglevel);
				}

				const autoreconnectfrequencyNodes = config.getElementsByTagName('autoreconnectfrequency');
				let autoreconnectfrequencyNode = null;
				if (autoreconnectfrequencyNodes.length == 1)
				{
					autoreconnectfrequencyNode = autoreconnectfrequencyNodes[0];
					const nodetext = this.getTextForNode(config, 'autoreconnectfrequency');
					if (nodetext != null && !isNaN(parseInt(nodetext)))
					{
						this.connectionMonitor.setAutoReconnectFrequency(parseInt(nodetext), parseInt(nodetext), (autoreconnectfrequencyNode.getAttribute('delayfirstattempt')?.toLowerCase() == 'true') ?? false);
					}
					else
					{
						this.connectionMonitor.setAutoReconnectFrequency(parseInt(autoreconnectfrequencyNode.getAttribute('minms')??'1000'), parseInt(autoreconnectfrequencyNode.getAttribute('maxms')??'100000'), autoreconnectfrequencyNode.getAttribute('delayfirstattempt') == null ? false : autoreconnectfrequencyNode.getAttribute('delayfirstattempt')?.toLowerCase() == 'true');
					}

					this.connectionMonitor.setAutoReconnectAttemptLimit(parseInt(autoreconnectfrequencyNode.getAttribute('maxattempts')??'100'));
				}

				const connectiontimeout = this.getTextForNode(config, 'connectionTimeout');
				if (connectiontimeout != null)
				{
					this.connectionMonitor.setConnectionTimeout(parseInt(connectiontimeout));
				}

				const heartbeatfrequency = this.getTextForNode(config, 'heartbeatFrequency');
				if (heartbeatfrequency != null)
				{
					this.connectionMonitor.setHeartbeatFrequency(parseInt(heartbeatfrequency));
				}

				const readytimeout = this.getTextForNode(config, 'readyTimeout');
				if (readytimeout != null)
				{
					this.connectionMan.setReadyTimeout(parseInt(readytimeout));
				}

				const connections = config.getElementsByTagName('connection');
				if (connections.length == 0)
				{
					this.log.error(
						'[ORBITER] No connections specified in Orbiter configuration file.');
					return;
				}

				// Make connections
				for (let i = 0; i < connections.length; i++)
				{
					const connection = connections[i],
					      host       = connection.getAttribute('host')                ?? '',
					      port       = parseInt(connection.getAttribute('port')       ?? ''),
					      type       = connection.getAttribute('type')?.toUpperCase() ?? '',
					      secure     = connection.getAttribute('secure')              ?? '',
					      sendDelay  = parseInt(connection.getAttribute('senddelay')  ?? '');

					switch (type)
					{
						// No type means make a socket connection with an http backup
						case null:
							if (secure === 'true')
							{
								this.buildConnection(host, port, ConnectionType.SECURE_WEBSOCKET, -1);
								this.buildConnection(host, port, ConnectionType.SECURE_HTTP, sendDelay);
							}
							else
							{
								this.buildConnection(host, port, ConnectionType.WEBSOCKET, -1);
								this.buildConnection(host, port, ConnectionType.HTTP, sendDelay);
							}
							break;

						case ConnectionType.WEBSOCKET:
							if (secure === 'true')
							{
								this.buildConnection(host, port, ConnectionType.SECURE_WEBSOCKET, -1);
							}
							else
							{
								this.buildConnection(host, port, ConnectionType.WEBSOCKET, -1);
							}
							break;

						case ConnectionType.HTTP:
							if (secure === 'true')
							{
								this.buildConnection(host, port, ConnectionType.SECURE_HTTP, sendDelay);
							}
							else
							{
								this.buildConnection(host, port, ConnectionType.HTTP, sendDelay);
							}
							break;

						default:
							this.log.error(`[ORBITER] Unrecognized connection type in Orbiter configuration file: [${type}]. Connection ignored.`);
					}
				}
			}
			catch (error)
			{
				this.log.error(`[ORBITER] Error parsing connection in Orbiter configuration file: ${request.responseText} ${error.toString()}`);
			}

			this.connect();
		}

		/**
		 * The `connect()` method attempts to connect to Union Server at the specified host and
		 * ports. If no host and ports are specified, Orbiter attempts to connect using the
		 * ConnectionManager's current list of hosts and ports.
		 *
		 * When a connection succeeds and the Orbiter object has been fully
		 * initialized, a OrbiterEvent.READY event is triggered.
		 * A OrbiterEvent.READY listener typically starts the
		 * application in motion, often by creating or joining rooms.
		 * Lower-level connection events can be handled via the application's
		 * [[ConnectionManager]].
		 *
		 * @param host The string name or IP address of the domain on which Union Server is running.
		 *             For more details, see the connect() method.
		 *
		 * @param ports A list of integer ports over which Orbiter should attempt to connect to
		 *              Union Server. Orbiter will attempt to connect over the ports in the order
		 *              specified. For example, if `ports` is set to `9100, 80, 443`, then Orbiter
		 *              will first attempt to connect to Union over port 9100; if the connection
		 *              fails, Orbiter will automatically next attempt to connect over port 80, if
		 *              that fails, Orbiter will attempt to connect to port 443. To add multiple
		 *              hosts (not just multiple ports) to Orbiter's list of failover connections,
		 *              use [[ConnectionManager.addConnection]] method.  Wherever possible, to allow
		 *              maximum connection success by Union clients, Union Server should be run on
		 *              port 80.
		 */
		connect(host?:string, ...ports:string[]):void
		{
			this.useSecureConnect = false;
			this.doConnect(host, ...ports);
		}

		private connectFailureListener(e:Event):void
		{
			// Tell listeners that the connection is now closed.
			this.fireClose();
		}

		disableConsole():void
		{
			if (this.consoleLogger)
			{
				this.consoleLogger.dispose();
				this.consoleLogger = undefined;
			}
		}

		/**
		 * Instructs Orbiter to use persistent socket connections only when attempting
		 * to connect to specified hosts and ports. When HTTP failover is disabled,
		 * Orbiter does not automatically attempt to establish backup HTTP connections if all
		 * persistent socket connection attempts fail.
		 */
		disableHTTPFailover():void
		{
			this.httpFailoverEnabled = false;
		}

		/**
		 * Disables statistics tracking for this Orbiter object.
		 */
		disableStatistics():void
		{
			if (this.statistics != null)
			{
				this.statistics.stop();
			}
		}

		/**
		 * Terminates any open connection to the server. If the disconnection attempt succeeds,
		 * [[ConnectionManager]] dispatches the ConnectionManagerEvent.CLIENT_KILL_CONNECT and
		 * ConnectionManagerEvent.DISCONNECT events, and the Orbiter object dispatches a
		 * OrbiterEvent.CLOSE event.
		 *
		 * The Orbiter class's disconnect() method is a convenience wrapper for the
		 * [[ConnectionManager.disconnect]] method.
		 */
		disconnect():void
		{
			this.connectionMan.disconnect();
		}

		private disconnectListener(e:Event):void
		{
			this.accountMan.cleanup();
			this.roomMan.cleanup();
			this.clientMan.cleanup();
			this.server.cleanup();
			this.fireClose();
		};

		private dispatchConnectRefused(refusal:ConnectionRefusal):void
		{
			this.dispatchEvent(new OrbiterEvent(OrbiterEvent.CONNECT_REFUSED, undefined, refusal));
		}

		/**
		 * Permanently disables this object and releases all of its resources. Once `dispose()` is
		 * called, the object can never be used again. Use `dispose()` only when purging an object
		 * from memory, as is required when unloading an iframe. To simply disconnect an Orbiter
		 * object, use `disconnect()`.
		 */
		dispose():void
		{
			this.log.info('[ORBITER] Beginning disposal of all resources...');
			this.connectionMan.dispose();
			this.roomMan.dispose();
			this.connectionMonitor.dispose();
			this.clientMan.dispose();
			this.messageMan.dispose();
			this.statistics?.stop();

			this.log.info('[ORBITER] Disposal complete.');
		}

		private doConnect(host?:string, ...ports:string[]):void
		{
			if (host)
			{
				const args = [host, ...ports];
				this.setServer(...args);
			}
			this.log.info('[ORBITER] Connecting to Union...');
			this.connectionMan.connect();
		}

		enableConsole():void
		{
			if (!this.consoleLogger)
			{
				this.consoleLogger = new net.user1.logger.ConsoleLogger(this.log);
			}
		}

		/**
		 * Instructs Orbiter to automatically try connecting via HTTP when it is
		 * unable to establish a persistent socket connection over all specified
		 * hosts and ports. HTTP failover is enabled by default. HTTP connections
		 * are less responsive than persistent socket connections, but have a higher
		 * chance of connecting from behind a firewall. For the most granular control
		 * over connection sequence, type, hosts, and ports, use the [[ConnectionManager]]
		 * class directly.
		 */
		enableHTTPFailover():void
		{
			this.httpFailoverEnabled = true;
		}

		/**
		 * Enables statistics tracking for this Orbiter object. To retrieve
		 * statistics, use the getStatistics() method.
		 */
		enableStatistics():void
		{
			if (!this.statistics)
			{
				this.statistics = new Statistics(this);
			}
		}

		private fireClose():void
		{
			this.dispatchEvent(new OrbiterEvent(OrbiterEvent.CLOSE));
		}

		private fireProtocolIncompatible(serverUPCVersion:VersionNumber):void
		{
			this.dispatchEvent(new OrbiterEvent(OrbiterEvent.PROTOCOL_INCOMPATIBLE, serverUPCVersion));
		}

		private fireReady():void
		{
			this.dispatchEvent(new OrbiterEvent(OrbiterEvent.READY));
		}

		/**
		 * Returns a reference to the application's AccountManager instance,
		 * which is automatically created by Orbiter; the AccountManager class
		 * provides a set of services relating to registering and logging-in user
		 * accounts. For complete details see the main class entry for
		 * the AccountManager class.
		 */
		getAccountManager():AccountManager
		{
			return this.accountMan;
		}

		getClientID():string
		{
			return this.self()?.getClientID() ?? '';
		}

		/**
		 * Returns a reference to the application's ClientManager instance,
		 * which is automatically created by Orbiter; the ClientManager class
		 * creates and provides access to Client instances. Client instances
		 * store information about clients on the server, including
		 * client attributes, IP address, ping time, and connection
		 * time. For complete details see the main class entry for
		 * the ClientManager class.
		 */
		getClientManager():ClientManager
		{
			return this.clientMan;
		}

		/**
		 * Returns a reference to the application's ConnectionManager instance,
		 * which is automatically created by Orbiter; the ConnectionManager class
		 * is used to establish a connection to the server.
		 * For complete details see the main class entry for the
		 * ConnectionManager class.
		 */
		getConnectionManager():ConnectionManager
		{
			return this.connectionMan;
		}

		/**
		 * Returns a reference to the application's ConnectionMonitor instance,
		 * which manages heartbeat (ping) and automatic disconnection and
		 * reconnection services.
		 */
		getConnectionMonitor():ConnectionMonitor
		{
			return this.connectionMonitor;
		}

		private getCoreMessageListener():CoreMessageListener
		{
			return this.coreMsgListener;
		}

		/**
		 * Returns a reference to the application debugging log, which describes
		 * operations occurring on the client, and can show low-level
		 * client/server communications.
		 */
		getLog():Logger
		{
			return this.log;
		}

		/**
		 * Returns a reference to the application's MessageManager instance,
		 * which is automatically created by Orbiter; the
		 * MessageManager class provides a set of services relating to
		 * sending messages to and receiving messages from the server. For complete
		 * details see the main class entry for the MessageManager class.
		 */
		getMessageManager():MessageManager
		{
			return this.messageMan;
		}

		/**
		 * Returns a reference to the application's RoomManager, which is created
		 * automatically by Orbiter; the RoomManager class is used to create, destroy,
		 * observe, join, and access rooms.
		 */
		getRoomManager():RoomManager
		{
			return this.roomMan;
		}

		/**
		 * Returns a reference to the application's Server instance,
		 * which is automatically created by Orbiter; the
		 * Server class provides access to global server data and functions.
		 * For complete details
		 * see the main class entry for the Server class.
		 */
		getServer():Server
		{
			return this.server;
		}

		/**
		 * The Union session ID for this Orbiter instance, if available.
		 */
		getSessionID():string
		{
			return this.sessionID == null ? '' : this.sessionID;
		}

		getSnapshotManager():SnapshotManager
		{
			return this.snapshotMan;
		}

		/**
		 * Returns a reference to a Statistics object for this connection,
		 * which provides metrics such as KB/second transfer rate and number of
		 * messages sent and received.
		 *
		 * Due to the performance cost associated with statistics tracking,
		 * the returned Statistics object returned by getStatistics() is
		 * disabled by default, and provides no data. To enable statistics
		 * tracking, invoke the Orbiter class's enableStatistics() method.
		 */
		getStatistics():Statistics|null
		{
			return this.statistics ?? null;
		}

		/**
		 * Returns a reference to the application's System class, whose static
		 * variables provide Orbiter version information.
		 */
		getSystem():System
		{
			return this.system;
		}

		private getTextForNode(tree:Document, tagname:string):string|null
		{
			const nodes = tree.getElementsByTagName(tagname);
			let node;
			if (nodes.length > 0)
			{
				node = nodes[0];
			}

			if (node != null && node.firstChild != null && node.firstChild.nodeValue != null &&
			    node.firstChild.nodeType == 3 && node.firstChild.nodeValue.length > 0)
			{
				return node.firstChild.nodeValue;
			}
			else
			{
				return null;
			}
		}

		/**
		 * Indicates whether Orbiter will automatically try connecting via HTTP when
		 * it is unable to establish a persistent socket connection over all
		 * specified hosts and ports.
		 */
		isHTTPFailoverEnabled():boolean
		{
			return this.httpFailoverEnabled;
		}

		/**
		 * Returns a Boolean indicating whether Orbiter currently has an
		 * active, fully initialized connection to the server.
		 *
		 * @return true if the client is in a ready state; false otherwise.
		 */
		isReady():boolean
		{
			return this.connectionMan.isReady();
		}

		/**
		 * Loads the client-configuration file. When the file load completes, Orbiter automatically
		 * attempts to connect to Union Server using the settings specified by the configuration
		 * file.
		 *
		 * The configuration file has the following format:
		 * ```
		 *     <?xml version="1.0"?>
		 *     <config>
		 *         <connections>
		 *             <connection host="hostNameOrIP1" port="portNumber1" type="connectionType1" senddelay="milliseconds1" secure="false" />
		 *             <connection host="hostNameOrIPn" port="portNumbern" type="connectionTypen" senddelay="millisecondsn" secure="false" />
		 *         </connections>
		 *         <autoreconnectfrequency>frequency</autoreconnectfrequency>
		 *         <connectiontimeout>duration</connectiontimeout>
		 *         <heartbeatfrequency>frequency</heartbeatfrequency>
		 *         <readytimeout>timeout</readytimeout>
		 *         <loglevel>level</loglevel>
		 *     </config>
		 * ```
		 * When the `secure` attribute is true, communication is conducted over WSS or HTTPS using
		 * the environment's TLS implementation.
		 */
		loadConfig(configURL:string):void
		{
			this.log.info(`[ORBITER] Loading config from ${configURL}.`);
			const request = new XMLHttpRequest();

			request.onerror = ()=>this.configErrorListener();
			request.onreadystatechange = (state)=>
			{
				if (request.readyState == 4)
				{
					this.configLoadCompleteListener(request);
				}
			}
			request.open('GET', configURL);
			request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
			request.send(null);
		}

		private readyListener(e:Event)
		{
			this.fireReady();
		}

		/**
		 * The `secureConnect()` method is identical to the `connect()` method, except that it uses
		 * an encrypted connection (TLS or SSL) rather than an unencrypted connection. Before
		 * `secureConnect()` can be used, Union Server must be configured to accept client
		 * communications over a secure gateway, which includes the installation of a server-side
		 * security certificate.
		 */
		secureConnect(host:string, ...ports:string[]):void
		{
			this.useSecureConnect = true;
			const args = [host, ...ports];
			this.doConnect(...args);
		}

		selectConnectionListener(e:Event):void
		{
			this.messageMan.addMessageListener(UPC.SERVER_HELLO,       this.u66, this);
			this.messageMan.addMessageListener(UPC.CONNECTION_REFUSED, this.u164, this);
		}

		/**
		 * Returns a reference to the application's own Client object (i.e., the "current client").
		 */
		self():CustomClient|Client|null
		{
			if (this.clientMan == null || !this.isReady())
			{
				return null;
			}
			else
			{
				let customGlobalClient = this.clientMan.self()?.getCustomClient();
				if (customGlobalClient)
				{
					return customGlobalClient ?? null;
				}
				else
				{
					return this.clientMan.self();
				}
			}
		}

		/**
		 * Specifies the host and port for future connection attempts.
		 * The setServer() method does not attempt to open a new connection;
		 * to connect after specifying the server, use Orbiter's connect() method.
		 *
		 * @param host The string name or IP address of the domain on which
		 * Union Server is running. For more details, see the connect() method.
		 *
		 * @param ports A list of integer ports over which Orbiter should attempt to
		 *              connect to Union Server.
		 */
		setServer(host?:string, ...ports:string[]):void
		{
			if (host != null && ports.length > 0)
			{
				if (this.connectionMan.getConnections().length > 0)
				{
					this.connectionMan.removeAllConnections();
				}

				// Where possible, create WebSocket connections for the specified
				// host and its ports.
				let connectionType:ConnectionType;
				if (this.system.hasWebSocket())
				{
					for (let i = 1; i < arguments.length; i++)
					{
						connectionType = this.useSecureConnect ? ConnectionType.SECURE_WEBSOCKET :
						                                         ConnectionType.WEBSOCKET;
						this.buildConnection(host, arguments[i], connectionType, -1);
					}
				}
				else
				{
					this.log.info('[ORBITER] WebSocket not found in host environment.Trying HTTP.');
				}

				// Next, if failover is enabled or WebSocket is not supported, create
				// HTTPConnections
				if (this.isHTTPFailoverEnabled() || !this.system.hasWebSocket())
				{
					for (let i = 1; i < arguments.length; i++)
					{
						connectionType = this.useSecureConnect ? ConnectionType.SECURE_HTTP :
						                                         ConnectionType.HTTP;
						this.buildConnection(host, arguments[i], connectionType,
						                     HTTPConnection.DEFAULT_SEND_DELAY);
					}
				}
			}
			else
			{
				this.log.error(`[ORBITER] setServer() failed. Invalid host [${host}] or port [${ports.join(',')}].`);
			}
		}

		/**
		 * @internal
		 * @param {string} id
		 */
		setSessionID(id:string):void
		{
			this.sessionID = id;
		}

		private u164(reason:string, description:string):void
		{
			this.connectionMonitor.setAutoReconnectFrequency(-1);
			this.dispatchConnectRefused(new ConnectionRefusal(reason, description));
		}

		private u66(serverVersion:string, sessionID:string, serverUPCVersionString:string,
		            protocolCompatible:string, affinityAddress:string="",
		            affinityDuration:string=""):void
		{
			const serverUPCVersion = new VersionNumber();
			serverUPCVersion.fromVersionString(serverUPCVersionString);
			if (protocolCompatible == 'false')
			{
				this.fireProtocolIncompatible(serverUPCVersion);
			}
		}

		/**
		 * Updates the specified snapshot object with the latest information available on the
		 * server. For details on snapshots, see the [[Snapshot]] class.
		 *
		 * @param snapshot The snapshot object to be updated. Must be an instance of any Snapshot
		 *                 subclass.
		 */
		updateSnapshot(snapshot:Snapshot):void
		{
			this.snapshotMan.updateSnapshot(snapshot);
		}
	}
}

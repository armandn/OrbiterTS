namespace net.user1.orbiter
{
	/**
	 * OrbiterEvent is a simple data class used to pass information from
	 * an application's Orbiter object to registered event-listeners when
	 * a Orbiter event occurs. The OrbiterrEvent class also defines
	 * constants representing the available Orbiter events.
	 */
	export class OrbiterEvent extends net.user1.events.Event
	{
		/**
		 * Dispatched when either the connection to the server is lost
		 * or a connection attempt fails. Individual events for connection
		 * failure and connection closure can be handled separately via the
		 * ConnectionManager class or any class that implements IConnection.
		 */
		static readonly CLOSE = 'CLOSE';

		/**
		 * Dispatched when the client attempts to connect to Union Server, but the
		 * connection is refused. To determine why the client connection was refused,
		 * use getConnectionRefusal().
		 */
		static readonly CONNECT_REFUSED = 'CONNECT_REFUSED';

		/**
		 * Dispatched when the client connects to
		 * a Union Server that conforms to a version of the UPC specification that
		 * does not match the client's UPC version.
		 *
		 * The UPC specification version takes format:
		 * majorNumber.minorNumber.revisionNumber. For example, in the
		 * version number 1.2.0, the majorNumber is 1, the minorNumber is
		 * 2, and the revisionNumber is 0. If the
		 * client's majorNumber, minorNumber, and revisionNumber all match the
		 * server's majorNumber, minorNumber, and revisionNumber, the server is
		 * considered compatible with the client. Otherwise:
		 * - If the server's majorNumber and the client's majorNumber do not match, or the server's
		 *   minorNumber and the client's minorNumber do not match, the Orbiter object triggers a
		 *   OrbiterEvent.PROTOCOL_INCOMPATIBLE event, then the server forcibly disconnects the
		 *   client, triggering a OrbiterEvent.CLOSE event.
		 * - If the server's revisionNumber and the client's revisionNumber do not match, but the
		 *   majorNumber and minorNumber both match, the Orbiter object triggers a
		 *   OrbiterEvent.PROTOCOL_INCOMPATIBLE event, but the server does not disconnect the
		 *   client. The client application must, itself, decide whether to stay connected. The
		 *   application might wish to stay connected if it does not use any features that differ
		 *   between the client's protocol version and the server's protocol version. For example,
		 *   imagine a hypothetical UPC-specification version, 4.5.5, that is succeeded by a minor
		 *   revision 4.5.6. The 4.5.6 revision is identical to its predecessor except that it
		 *   contains a new UPC message, "REMOVE_ALL_ROOMS", that was not present in 4.5.5. All
		 *   4.5.5-compatible client applications can safely communicate with all 4.5.6-compatible
		 *   servers because all 4.5.5 messages are still supported in revision 4.5.6. However, a
		 *   4.5.6-compatible client application, can safely communicate with a 4.5.5-compatible
		 *   server only if it does not use REMOVE_ALL_ROOMS, which is not supported by the
		 *   4.5.5-compatible server. A 4.5.6-compatible client application that uses
		 *   REMOVE_ALL_ROOMS would, hence, be expected  to disconnect itself from a
		 *   4.5.5-compatible server.</li>
		 */
		static readonly PROTOCOL_INCOMPATIBLE = 'PROTOCOL_INCOMPATIBLE';

		/**
		 * Dispatched when a connection to the server has been
		 * established and fully initialized. After READY occurs, the Orbiter
		 * client can begin communicating freely with the server.
		 */
		static readonly READY = 'READY';

		constructor(type:string,
		            private readonly serverUPCVersion?:VersionNumber,
		            private readonly connectionRefusal?:ConnectionRefusal)
		{
			super(type);
		}

		/**
		 * Returns a ConnectionRefusal object describing a connection refusal by
		 * Union Server. Applies to the OrbiterEvent.CONNECT_REFUSED event
		 * only.
		 */
		getConnectionRefusal():ConnectionRefusal|null
		{
			return this.connectionRefusal ?? null;
		}

		/**
		 * Returns the version of the UPC specification in use by the server. Applies to the
		 * OrbiterEvent.PROTOCOL_INCOMPATIBLE event only.
		 */
		getServerUPCVersion():VersionNumber|null
		{
			return this.serverUPCVersion ?? null;
		}

		toString():string
		{
			return '[object OrbiterEvent]';
		}
	}
}

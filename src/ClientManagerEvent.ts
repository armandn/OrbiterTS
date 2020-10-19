namespace net.user1.orbiter
{
	/**
	 * ClientManagerEvent is a simple data class used to pass information from an application's
	 * ClientManager to registered event-listeners when a client-management event occurs. The
	 * ClientManagerEvent class also defines constants representing the available client-management
	 * events.
	 */
	export class ClientManagerEvent extends net.user1.events.Event
	{
		/**
		 * Dispatched when the ClientManager is informed by Union Server that a client address was
		 * banned. This event is available when the ClientManager is watching for banned addresses
		 * only (see watchForBannedAddresses()).
		 */
		static readonly ADDRESS_BANNED = 'ADDRESS_BANNED';

		/**
		 * Dispatched when the ClientManager is informed by Union Server that a client address was
		 * unbanned. This event is available when the ClientManager is watching for banned addresses
		 * only (see watchForBannedAddresses()).
		 */
		static readonly ADDRESS_UNBANNED = 'ADDRESS_UNBANNED';

		/**
		 * Dispatched when the result of an earlier [[Client.ban]]
		 * or [[ClientManager.ban]] request is received.
		 */
		static readonly BAN_RESULT = 'BAN_RESULT';

		/**
		 * Dispatched when the ClientManager is informed by Union Server that a client connected.
		 * This event is available when the ClientManager is watching for clients only
		 * (see watchForClients()).
		 */
		static readonly CLIENT_CONNECTED = 'CLIENT_CONNECTED';

		/**
		 * Dispatched when the ClientManager is informed by Union Server that a client disconnected.
		 * This event is available when the ClientManager is watching for clients (see
		 * watchForClients()) or observing the client that disconnected (see observeClient()) only.
		 */
		static readonly CLIENT_DISCONNECTED = 'CLIENT_DISCONNECTED';

		/**
		 * Dispatched when the result of an earlier [[Client.kick]]
		 * or [[ClientManager.kickClient]] request is received.
		 */
		static readonly KICK_RESULT = 'KICK_RESULT';

		/**
		 * Dispatched when the result of an earlier call to
		 * [[ClientManager.stopWatchingForBannedAddresses]] is received.
		 */
		static readonly STOP_WATCHING_FOR_BANNED_ADDRESSES_RESULT = 'STOP_WATCHING_FOR_BANNED_ADDRESSES_RESULT';

		/**
		 * Dispatched when the ClientManager receives the result of an earlier
		 * stopWatchingForClients() request.
		 *
		 * To determine the result of the attempt, use getStatus(), which has the following possible
		 * return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.NOT_WATCHING
		 */
		static readonly STOP_WATCHING_FOR_CLIENTS_RESULT = 'STOP_WATCHING_FOR_CLIENTS_RESULT';

		/**
		 * Dispatched when the ClientManager's list of clients has finished being synchronized after
		 * a watchForClients() request.
		 */
		static readonly SYNCHRONIZE = 'SYNCHRONIZE';

		/**
		 * Dispatched when the ClientManager's list of clients has finished being synchronized after
		 * a watchForBannedAddresses() request.
		 */
		static readonly SYNCHRONIZE_BANLIST = 'SYNCHRONIZE_BANLIST';

		/**
		 * Dispatched when the result of an earlier ClientManager.unban() request is received.
		 */
		static readonly UNBAN_RESULT = 'UNBAN_RESULT';

		/**
		 * Dispatched when the result of an earlier call to
		 * [[ClientManager.watchForBannedAddresses]] is received.
		 */
		static readonly WATCH_FOR_BANNED_ADDRESSES_RESULT = 'WATCH_FOR_BANNED_ADDRESSES_RESULT';

		/**
		 * Dispatched when the ClientManager receives the result of an earlier watchForClients()
		 * request.
		 *
		 * To determine the result of the request, use getStatus(), which has the following possible
		 * return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.ALREADY_WATCHING
		 */
		static readonly WATCH_FOR_CLIENTS_RESULT = 'WATCH_FOR_CLIENTS_RESULT';

		constructor(public type:string,
		            private readonly clientID?:string,
		            private readonly client?:Client,
		            private readonly address?:string,
		            private readonly status?:Status)
		{
			super(type);
		}

		/**
		 * Returns an address that was either banned or unbanned. This method applies to the
		 * following events:
		 * - ClientManagerEvent.BAN_RESULT
		 * - ClientManagerEvent.UNBAN_RESULT
		 * - ClientManagerEvent.ADDRESS_BANNED
		 * - ClientManagerEvent.ADDRESS_UNBANNED
		 */
		getAddress():string|null
		{
			return this.address ?? null;
		}

		/**
		 * Returns the Client object for the client to which this event pertains. For example, for
		 * the [[ClientManagerEvent.CLIENT_DISCONNECTED]] event, getClient() returns the Client
		 * object for the client that disconnected.
		 */
		getClient():Client|null
		{
			return this.client ?? null;
		}

		/**
		 * Returns the clientID of the client to which this event pertains. For example, for the
		 * [[ClientManagerEvent.CLIENT_CONNECTED]] event, getClientID() returns the clientID of the
		 * client that connected.
		 */
		getClientID():string|null
		{
			return this.clientID ?? null;
		}

		/**
		 * Returns the status of the client-management operation to which this event pertains.
		 *
		 * The getStatus() method's return value is always one of the Status class's constants.
		 * For example, getStatus() might return the value of Status.SUCCESS.
		 *
		 * For a list of specific status values that are available for a particular
		 * ClientManagerEvent event, see that event's documentation.
		 */
		getStatus():Status|null
		{
			return this.status ?? null;
		}

		/**
		 * @internal
		 */
		toString():string
		{
			return '[object ClientManagerEvent]';
		}
	}
}

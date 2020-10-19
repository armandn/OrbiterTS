namespace net.user1.orbiter
{
	/**
	 * ClientEvent is a simple data class used to pass information from a Client object to
	 * registered event-listeners when a client event occurs. The ClientEvent class also defines
	 * constants representing the available client events.
	 *
	 * To register for a client event, use the [[Client.addEventListener]] method.
	 */
	export class ClientEvent extends net.user1.events.Event
	{
		/**
		 * Dispatched when the client that triggered this event joins a room.
		 */
		static readonly JOIN_ROOM = 'JOIN_ROOM';

		/**
		 * Dispatched when the client that triggered this event leaves a room. This event also
		 * occurs when a room containing the target client is removed, forcing the client to leave.
		 */
		static readonly LEAVE_ROOM = 'LEAVE_ROOM';

		/**
		 * Dispatched when the current client observes a client. The client that is now being
		 * observed can be accessed via [[ClientEvent.getClient]] method.
		 */
		static readonly OBSERVE = 'OBSERVE';

		/**
		 * Dispatched when the result of an earlier [[Client.observe]] or
		 * [[ClientManager.observeClient]] request is received.
		 */
		static readonly OBSERVE_RESULT = 'OBSERVE_RESULT';

		/**
		 * Dispatched when the client that triggered this event observes a room.
		 */
		static readonly OBSERVE_ROOM = 'OBSERVE_ROOM';

		/**
		 * Dispatched when the current client stops observing a client. The client that is no longer
		 * being observed can be accessed via [[ClientEvent.getClient]] method.
		 */
		static readonly STOP_OBSERVING = 'STOP_OBSERVING';

		/**
		 * Dispatched when the result of an earlier [[Client.stopObserving]]
		 * or [[ClientManager.stopObservingClient]] request is received.
		 */
		static readonly STOP_OBSERVING_RESULT = 'STOP_OBSERVING_RESULT';

		/**
		 * Dispatched when the client that triggered this event stops observing a room. This event
		 * also occurs when a room containing the client is removed, forcing the client to stop
		 * observing the room.
		 */
		static readonly STOP_OBSERVING_ROOM = 'STOP_OBSERVING_ROOM';

		/**
		 * Dispatched when the client that triggered this event has been synchronized to match the
		 * state of the server due to an earlier observe() request.
		 */
		static readonly SYNCHRONIZE = 'SYNCHRONIZE';

		//TODO remove changedAttr since it's never used

		constructor(type:string,
		            private changedAttr?:Attribute,
		            private room?:Room,
		            private roomID?:string,
		            private client?:Client,
		            private status?:Status,
		            private clientID?:string)
		{
			super(type);
		}

		/**
		 * Returns the Client object pertaining to this client event (for example, the client that
		 * was observed). The getClient() method is required only when the target of the ClientEvent
		 * is ClientManager; when the target of a ClientEvent is a Client object, the event's
		 * `target` property provides access to the Client object.
		 * @return {net.user1.orbiter.Client | null}
		 */
		getClient():Client|null
		{
			return this.client ?? null;
		}

		/**
		 * Returns the clientID of the client to which this event pertains. For example, for the
		 * ClientEvent.JOIN_ROOM event, getClientID() returns the id of the client that joined the
		 * room.
		 * @return {string | null}
		 */
		getClientID():string|null
		{
			if (this.client)
			{
				return this.client.getClientID();
			}
			else
			{
				return this.clientID ?? null;
			}
		}

		/**
		 * Returns the Room object pertaining to this client event (for example, the room that was
		 * joined or left).
		 * @return {net.user1.orbiter.Room | null}
		 */
		getRoom():Room|null
		{
			return this.room ?? null;
		}

		/**
		 * Returns the fully qualified room ID for the Room object pertaining to this client event
		 * (for example, the room that was joined or left).
		 * @return {string | null}
		 */
		getRoomID():string|null
		{
			return this.roomID ?? null;
		}

		/**
		 * Returns the status of the operation to which this event pertains.
		 *
		 * The getStatus() method's return value is always one of the Status class's constants. For
		 * example, if the ClientEvent.JOIN_RESULT event occurs in response to a successful
		 * room-join attempt, getStatus() will return the value of Status.SUCCESS.
		 *
		 * To respond to a status, compare the return of getStatus() to one of the Status constants.
		 *
		 * For a list of specific status values that can be returned during a particular event, see
		 * the documentation for that event.
		 * @return {net.user1.orbiter.Status | null}
		 */
		getStatus():Status|null
		{
			return this.status ?? null;
		}

		/**
		 * @internal
		 * @return {string}
		 */
		toString():string
		{
			return '[object ClientEvent]';
		}
	}
}

namespace net.user1.orbiter
{
	/**
	 * RoomEvent is a simple data class used to pass information from a Room object to registered
	 * event-listeners when a room event occurs. The RoomEvent class also defines constants
	 * representing the available room events.
	 *
	 * To register for a room event, use the [[Room.addEventListener]] method.
	 */
	export class RoomEvent extends net.user1.events.Event
	{
		/**
		 * Dispatched when a client observes a room and the following two conditions are met: 1) the
		 * current client is in or observing the room, 2) the current client has enabled
		 * "observer-list" updates for the room (observer-list updates are disabled by default). To
		 * enable or disable observer-list updates for a room, set the observerList variable on an
		 * UpdateLevels object, and pass that object to one of the following methods:
		 * - Room's join() method
		 * - Room's observe() method
		 * - Room's setUpdateLevels() method
		 * - RoomManager's joinRoom() method
		 * - RoomManager's observeRoom() method
		 */
		static readonly ADD_OBSERVER = 'ADD_OBSERVER';

		/**
		 * Dispatched when a client joins a room and the following two conditions are met: 1) the
		 * current client is in or observing the room, 2) the current client has enabled
		 * "occupant-list" updates for the room (occupant-list updates are enabled by default). To
		 * enable or disable occupant-list updates for a room, set the occupantList variable on an
		 * UpdateLevels object, and pass that object to one of the following methods:
		 * - [[Room.join]] method
		 * - [[Room.observe]] method
		 * - [[Room.setUpdateLevels]] method
		 * - [[RoomManager.joinRoom]] method
		 * - [[RoomManager.observeRoom]] method
		 */
		static readonly ADD_OCCUPANT = 'ADD_OCCUPANT';

		/**
		 * Dispatched when the current client is in or observing the room, and an attribute in which
		 * the current client has expressed interest is removed from any of the room's occupants or
		 * observers. Specifically, RoomEvent.DELETE_CLIENT_ATTRIBUTE is triggered when any of the
		 * following occurs:
		 * - An occupant deletes a room attribute, and the current client has enabled updates for
		 *   shared, room-scoped occupant-attributes (see the [[UpdateLevels]] class's
		 *   sharedOccupantAttributesRoom variable) or for all room-scoped occupant-attributes (see
		 *   the UpdateLevels class's allOccupantAttributesRoom variable).
		 * - An occupant deletes a global attribute, and the current client has enabled
		 *   updates for shared global occupant-attributes (see the UpdateLevels class's
		 *   sharedOccupantAttributesGlobal variable) or for all global occupant-attributes (see the
		 *   UpdateLevels class's allOccupantAttributesGlobal variable).
		 * - An observer deletes a room attribute, and the current client has enabled updates for
		 *   shared, room-scoped observer-attributes (see the UpdateLevels class's
		 *   sharedObserverAttributesRoom variable) or for all room-scoped observer-attributes (see
		 *   the UpdateLevels class's allObserverAttributesRoom variable).
		 * - An observer deletes a global attribute, and the current client has enabled updates for
		 *   shared global observer-attributes (see the UpdateLevels class's
		 *   sharedObserverAttributesGlobal variable) or for all global observer-attributes (see the
		 *   UpdateLevels class's allObserverAttributesGlobal variable).
		 *
		 * To enable or disable occupant or observer attribute updates for a room, first, set any of
		 * the following variables on an UpdateLevels object:
		 * - sharedOccupantAttributesRoom
		 * - sharedOccupantAttributesGlobal
		 * - sharedObserverAttributesRoom
		 * - sharedObserverAttributesGlobal
		 * - allOccupantAttributesRoom
		 * - allOccupantAttributesGlobal
		 * - allObserverAttributesRoom
		 * - allObserverAttributesGlobal
		 *
		 * Then, pass the UpdateLevels object to one of the following methods:
		 * - Room's join() method
		 * - Room's observe() method
		 * - Room's setUpdateLevels() method
		 * - RoomManager's joinRoom() method
		 * - RoomManager's observeRoom() method
		 */
		static readonly DELETE_CLIENT_ATTRIBUTE = 'DELETE_CLIENT_ATTRIBUTE';

		/**
		 * Dispatched when the current client successfully joins a room, either in response to
		 * server-side code or in response to an earlier request made by the current client to join
		 * the room.
		 *
		 * Note that the RoomEvent.JOIN event applies to the current client only. To be notified
		 * when _any_ client joins a room, register for the RoomEvent.ADD_OCCUPANT event.
		 */
		static readonly JOIN = 'JOIN';

		/**
		 * Dispatched when the result of an earlier room-join request by the current client is
		 * received. To determine the result of the request, use getStatus(), which has the
		 * following possible return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.ALREADY_IN_ROOM
		 * - Status.ROOM_NOT_FOUND
		 * - Status.ROOM_FULL
		 * - Status.AUTHORIZATION_REQUIRED
		 * - Status.AUTHORIZATION_FAILED
		 *
		 * If the room-join request was successful, the RoomEvent.JOIN event will also be triggered.
		 */
		static readonly JOIN_RESULT = 'JOIN_RESULT';

		/**
		 * Dispatched when the current client successfully leaves a room, either in response to
		 * server-side code or in response to an earlier request made by the current client to leave
		 * the room.
		 *
		 * Note that the RoomEvent.LEAVE event applies to the current client only. To be notified
		 * when <i>any</i> client leaves a room, register for the RoomEvent.REMOVE_OCCUPANT event.
		 */
		static readonly LEAVE = 'LEAVE';

		/**
		 * Dispatched when the result of an earlier room-leave request by the current client is
		 * received. To determine the result of the request, use getStatus(), which has the
		 * following possible return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.ROOM_NOT_FOUND
		 * - Status.NOT_IN_ROOM
		 * If the leave-join request was successful, the RoomEvent.LEAVE event will also be
		 * triggered.
		 */
		static readonly LEAVE_RESULT = 'LEAVE_RESULT';

		/**
		 * Dispatched when the current client successfully observes a room, either in response to
		 * server-side code or in response to an earlier request made by the current client to
		 * observe the room. Note that RoomEvent.OBSERVE applies to the current client only; to be
		 * notified when other clients observe the room, register for the RoomEvent.ADD_OBSERVER
		 * event.
		 */
		static readonly OBSERVE = 'OBSERVE';

		/**
		 * Dispatched when the number of observers in a room changes while the current client is in
		 * or observing the room and the current client has enabled either "observer-list" updates
		 * or "observer-count" updates for the room (note that neither are enabled by default). To
		 * enable or disable observer-list updates or observer-count updates for a room, set either
		 * the observerList variable or the observerCount variable (respectively) on an UpdateLevels
		 * object, and pass that object to one of the following methods:
		 * - Room's join() method
		 * - Room's observe() method
		 * - Room's setUpdateLevels() method
		 * - RoomManager's joinRoom() method
		 * - RoomManager's observeRoom() method
		 */
		static readonly OBSERVER_COUNT = 'OBSERVER_COUNT';

		/**
		 * Dispatched when the result of an earlier observe-room request by the current client is
		 * received. To determine the result of the request, use getStatus(), which has the
		 * following possible return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.ROOM_NOT_FOUND
		 * - Status.AUTHORIZATION_REQUIRED
		 * - Status.AUTHORIZATION_FAILED
		 * - Status.ALREADY_OBSERVING
		 */
		static readonly OBSERVE_RESULT = 'OBSERVE_RESULT';

		/**
		 * Dispatched when the number of occupants in a room changes while the current client is in
		 * or observing the room and the current client has enabled either "occupant-list" updates
		 * or "occupant-count" updates for the room (note that occupant-list updates are enabled by
		 * default). To enable or disable occupant-list updates or occupant-count updates for a
		 * room, set either the occupantList variable or the occupantCount variable (respectively)
		 * on an UpdateLevels object, and pass that object to one of the following methods:
		 * - Room's join() method
		 * - Room's observe() method
		 * - Room's setUpdateLevels() method
		 * - RoomManager's joinRoom() method
		 * - RoomManager's observeRoom() method
		 */
		static readonly OCCUPANT_COUNT = 'OCCUPANT_COUNT';

		/**
		 * Dispatched when a room that was previously known to the current client becomes unknown.
		 * A room is known when it is cached, joined, observed, or watched by the current client.
		 * For information on the current client's room cache, see RoomManager's
		 * disposeCachedRooms() method.
		 */
		static readonly REMOVED = 'REMOVED';

		/**
		 * Dispatched when a client stops observing a room and the following two conditions are met:
		 * 1) the current client is in or observing the room, 2) the current client has enabled
		 * "observer-list" updates for the room (observer-list updates are disabled by default). To
		 * enable or disable observer-list updates for a room, set the observerList variable on an
		 * UpdateLevels object, and pass that object to one of the following methods:
		 * - Room's join() method
		 * - Room's observe() method
		 * - Room's setUpdateLevels() method
		 * - RoomManager's joinRoom() method
		 * - RoomManager's observeRoom() method
		 */
		static readonly REMOVE_OBSERVER = 'REMOVE_OBSERVER';

		/**
		 * Dispatched when a client leaves a room and the following two conditions are met: 1) the
		 * current client is in or observing the room, 2) the current client has enabled
		 * "occupant-list" updates for the room (occupant-list updates are enabled by default). To
		 * enable or disable occupant-list updates for a room, set the occupantList variable on an
		 * UpdateLevels object, and pass that object to one of the following methods:
		 * - Room's join() method
		 * - Room's observe() method
		 * - Room's setUpdateLevels() method
		 * - RoomManager's joinRoom() method
		 * - RoomManager's observeRoom() method
		 */
		static readonly REMOVE_OCCUPANT = 'REMOVE_OCCUPANT';

		/**
		 * Dispatched when the current client successfully stops observing a room, either in
		 * response to server-side code or in response to an earlier request made by the current
		 * client to stop observing the room.
		 */
		static readonly STOP_OBSERVING = 'STOP_OBSERVING';

		/**
		 * Dispatched when the result of an earlier stop-observing-room request by the current
		 * client is received. To determine the result of the request, use getStatus(), which has
		 * the following possible return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.ROOM_NOT_FOUND
		 * - Status.NOT_OBSERVING
		 */
		static readonly STOP_OBSERVING_RESULT = 'STOP_OBSERVING_RESULT';

		/**
		 * Dispatched when the room has been synchronized to match the state of the server. A room
		 * is synchronized when the current client joins or observes it.
		 */
		static readonly SYNCHRONIZE = 'SYNCHRONIZE';

		/**
		 * Dispatched when the current client is in or observing the room, and an attribute in which
		 * the current client has expressed interest changes on any of the room's occupants or
		 * observers. Specifically, RoomEvent.UPDATE_CLIENT_ATTRIBUTE is triggered when any of the
		 * following occurs:
		 *
		 * - An occupant sets a room attribute, and the current client has enabled updates for
		 *   shared, room-scoped occupant-attributes (see the UpdateLevels class's
		 *   sharedOccupantAttributesRoom variable) or for all room-scoped occupant-attributes (see
		 *   the UpdateLevels class's allOccupantAttributesRoom variable).
		 * - An occupant sets a global attribute, and the current client has enabled updates for
		 *   shared global occupant-attributes (see the UpdateLevels class's
		 *   sharedOccupantAttributesGlobal variable) or for all global occupant-attributes (see the
		 *   UpdateLevels class's allOccupantAttributesGlobal variable).
		 * - An observer sets a room attribute, and the current client has enabled updates for
		 *   shared, room-scoped observer-attributes (see the UpdateLevels class's
		 *   sharedObserverAttributesRoom variable) or for all room-scoped observer-attributes (see
		 *   the UpdateLevels class's allObserverAttributesRoom variable).
		 * - An observer sets a global attribute, and the current client has enabled updates for
		 *   shared global observer-attributes (see the UpdateLevels class's
		 *   sharedObserverAttributesGlobal variable) or for all global observer-attributes (see the
		 *   UpdateLevels class's allObserverAttributesGlobal variable).
		 *
		 * To enable or disable occupant or observer attribute updates for a room, first, set any of
		 * the following variables on an UpdateLevels object:
		 * - sharedOccupantAttributesRoom
		 * - sharedOccupantAttributesGlobal
		 * - sharedObserverAttributesRoom
		 * - sharedObserverAttributesGlobal
		 * - allOccupantAttributesRoom
		 * - allOccupantAttributesGlobal
		 * - allObserverAttributesRoom
		 * - allObserverAttributesGlobal
		 *
		 * Then, pass the UpdateLevels object to one of the following methods:
		 * - Room's join() method
		 * - Room's observe() method
		 * - Room's setUpdateLevels() method
		 * - RoomManager's joinRoom() method
		 * - RoomManager's observeRoom() method
		 */
		static readonly UPDATE_CLIENT_ATTRIBUTE = 'UPDATE_CLIENT_ATTRIBUTE';

		constructor(type:string,
		            private readonly client?:Client|CustomClient,
		            private readonly clientID?:string,
		            private readonly status?:Status,
		            private readonly changedAttr?:Attribute,
		            private readonly numClients:number=0,
		            private readonly roomID?:string)
		{
			super(type);

			this.clientID = clientID == '' ? undefined : clientID;
		}

		/**
		 * Returns an Attribute object containing information about a changed room or client
		 * attribute. This method applies to the following events:
		 * - RoomEvent.UPDATE_CLIENT_ATTRIBUTE
		 * - RoomEvent.DELETE_CLIENT_ATTRIBUTE
		 */
		getChangedAttr():Attribute|null
		{
			return this.changedAttr ?? null;
		}

		/**
		 * Returns a reference to the Client object pertaining to this event. This method applies to
		 * the following events:
		 * - RoomEvent.ADD_OCCUPANT
		 * - RoomEvent.REMOVE_OCCUPANT
		 * - RoomEvent.ADD_OBSERVER
		 * - RoomEvent.REMOVE_OBSERVER
		 * - RoomEvent.UPDATE_CLIENT_ATTRIBUTE
		 * - RoomEvent.DELETE_CLIENT_ATTRIBUTE
		 */
		getClient():Client|CustomClient|null
		{
			return this.client ?? null;
		}

		/**
		 * Returns the id of the client pertaining to this event. This method applies to the
		 * following events:
		 * - RoomEvent.ADD_OCCUPANT
		 * - RoomEvent.REMOVE_OCCUPANT
		 * - RoomEvent.ADD_OBSERVER
		 * - RoomEvent.REMOVE_OBSERVER
		 * - RoomEvent.UPDATE_CLIENT_ATTRIBUTE
		 * - RoomEvent.DELETE_CLIENT_ATTRIBUTE
		 */
		getClientID():string|null
		{
			return this.clientID ?? null;
		}

		/**
		 * Returns the number of clients currently in the room. This method applies to the following
		 * events:
		 * - RoomEvent.CLIENT_COUNT
		 */
		getNumClients():number
		{
			return this.numClients;
		}

		/**
		 * For RoomEvent events dispatched by RoomManager, getRoomID() returns the roomID of the
		 * room pertaining to this event. For example, when RoomManager dispatches the
		 * RoomEvent.JOIN_RESULT event, getRoomID() returns the room ID of the room that the client
		 * attempted to join. For RoomEvent events dispatched by an individual Room object,
		 * getRoomID() always returns null. To retrieve a room ID for events dispatched by an
		 * individual room object, use the Event class's target variable within the RoomEvent event
		 * listener.
		 */
		getRoomID():string|null
		{
			return this.roomID ?? null
		}

		/**
		 * Returns the status of the operation to which this event pertains. The getStatus()
		 * method's return value is always one of the Status class's constants. For example, if the
		 * RoomEvent.JOIN_RESULT event occurs in response to a successful room-join attempt,
		 * getStatus() will return the value of Status.SUCCESS.
		 *
		 * To respond to a status, compare the return of getStatus() to one of the Status constants.
		 */
		getStatus():Status|null
		{
			return this.status ?? null
		}

		toString():string
		{
			return '[object RoomEvent]';
		}

	}
}

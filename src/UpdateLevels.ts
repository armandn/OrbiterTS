namespace net.user1.orbiter
{
	/**
	 * The UpdateLevels class specifies the amount of information a client wishes to receive from
	 * the server about a room it has either joined or is observing. Room update levels are
	 * intended for use with massively multiuser applications, where clients must conserve bandwidth
	 * by minimizing the amount of traffic sent by the server.
	 *
	 * For example, imagine a nation-wide live quiz with 10000 participants in a single room. To
	 * conserve bandwidth and CPU, each participant must disable all updates about all other room
	 * occupants, while receiving aggregated application updates in the form of room messages sent
	 * by a server-side room module. To receive messages sent to the room by room modules only, and
	 * ignore all other updates for the room, each quiz client explicitly sets reduced update levels
	 * when joining the room.
	 */
	export class UpdateLevels
	{
		static readonly FLAG_ALL_ROOM_ATTRIBUTES = 1 << 12;
		static readonly FLAG_OBSERVER_COUNT = 1 << 3;
		static readonly FLAG_OBSERVER_LIST = 1 << 5;
		static readonly FLAG_OBSERVER_LOGIN_LOGOFF = 1 << 11;
		static readonly FLAG_OCCUPANT_COUNT = 1 << 2;
		static readonly FLAG_OCCUPANT_LIST = 1 << 4;
		static readonly FLAG_OCCUPANT_LOGIN_LOGOFF = 1 << 10;
		static readonly FLAG_ROOM_MESSAGES = 1;
		static readonly FLAG_SHARED_OBSERVER_ATTRIBUTES_GLOBAL = 1 << 9;
		static readonly FLAG_SHARED_OBSERVER_ATTRIBUTES_ROOM = 1 << 7;
		static readonly FLAG_SHARED_OCCUPANT_ATTRIBUTES_GLOBAL = 1 << 8;
		static readonly FLAG_SHARED_OCCUPANT_ATTRIBUTES_ROOM = 1 << 6;
		static readonly FLAG_SHARED_ROOM_ATTRIBUTES = 1 << 1;

		/**
		 * When true, the current client is sent an update any time a message is
		 * sent to the target room; defaults to true.
		 *
		 * Updates trigger message listeners registered via the [[Room.addMessageListener]] method.
		 */
		roomMessages:boolean = false;

		/**
		 * When true, the current client is sent an update any time one of the target room's shared
		 * attributes changes or is deleted; defaults to true.
		 *
		 * Updates trigger the following events:
		 * - AttributeEvent.DELETE (via the target room)
		 * - AttributeEvent.UPDATE (via the target room)
		 */
		sharedRoomAttributes:boolean = false;

		/**
		 * When true, the current client is sent an update any time the number of clients in the
		 * target room changes; defaults to false.
		 *
		 * Updates trigger the following events:
		 * -RoomEvent.OCCUPANT_COUNT (via the target room)
		 */
		occupantCount:boolean = false;

		/**
		 * When true, the current client is sent an update any time the number of clients observing
		 * the target room changes; defaults to false.
		 *
		 * Updates trigger the following events:
		 * -RoomEvent.OBSERVER_COUNT (via the target room)
		 */
		observerCount:boolean = false;

		/**
		 * When true, the current client is sent an update any time a client joins or leaves the
		 * target room; defaults to true.
		 *
		 * Updates trigger the following events:
		 * - RoomEvent.ADD_OCCUPANT (via the target room)
		 * - RoomEvent.REMOVE_OCCUPANT (via the target room)
		 */
		occupantList:boolean = false;

		/**
		 * When true, the current client is sent an update any time a client observes or stops
		 * observing the target room; defaults to false.
		 *
		 * Updates trigger the following events:
		 * - RoomEvent.ADD_OBSERVER (via the target room)</li>
		 * - RoomEvent.REMOVE_OBSERVER (via the target room)</li>
		 */
		observerList:boolean = false;

		/**
		 * When true, the current client is sent an update any time an occupant
		 * of the target room sets or deletes a room-scoped shared-attribute;
		 * defaults to true.
		 *
		 * Updates trigger the following events:
		 * - RoomEvent.UPDATE_CLIENT_ATTRIBUTE (via the target room)
		 * - RoomEvent.DELETE_CLIENT_ATTRIBUTE (via the target room)
		 * - AttributeEvent.DELETE (via the client that deleted the attribute)
		 * - AttributeEvent.UPDATE (via the client that set the attribute)
		 */
		sharedOccupantAttributesRoom:boolean = false;

		/**
		 * When true, the current client is sent an update any time an occupant
		 * of the target room sets or deletes a global shared attribute; defaults
		 * to true.
		 *
		 * Updates trigger the following events:
		 * - RoomEvent.UPDATE_CLIENT_ATTRIBUTE (via the target room)
		 * - RoomEvent.DELETE_CLIENT_ATTRIBUTE (via the target room)
		 * - AttributeEvent.DELETE (via the client that deleted the attribute)
		 * - AttributeEvent.UPDATE (via the client that set the attribute)
		 */
		sharedOccupantAttributesGlobal:boolean = false;

		/**
		 * When true, the current client is sent an update any time an observer
		 * of the target room sets or deletes a room-scoped shared-attribute;
		 * defaults to false.
		 *
		 * Updates trigger the following events:
		 * - RoomEvent.UPDATE_CLIENT_ATTRIBUTE (via the target room)
		 * - RoomEvent.DELETE_CLIENT_ATTRIBUTE (via the target room)
		 * - AttributeEvent.DELETE (via the client that deleted the attribute)
		 * - AttributeEvent.UPDATE (via the client that set the attribute)
		 */
		sharedObserverAttributesRoom:boolean = false;

		/**
		 * When true, the current client is sent an update any time an observer
		 * of the target room sets or deletes a global shared attribute;
		 * defaults to false.
		 *
		 * Updates trigger the following events:
		 * - RoomEvent.UPDATE_CLIENT_ATTRIBUTE (via the target room)
		 * - RoomEvent.DELETE_CLIENT_ATTRIBUTE (via the target room)
		 * - AttributeEvent.DELETE (via the client that deleted the attribute)
		 * - AttributeEvent.UPDATE (via the client that set the attribute)
		 */
		sharedObserverAttributesGlobal:boolean = false;

		/**
		 * When true, the current client is sent an update any time an occupant
		 * of the target room logs in or logs off; defaults to true.
		 *
		 * Updates trigger the following events:
		 * - AccountEvent.LOGIN (via the AccountManager and the UserAccount object
		 *   for the client that logged in)
		 * - AccountEvent.LOGOFF (via the AccountManager and the UserAccount object
		 *   for the client that logged off)
		 */
		occupantLoginLogoff:boolean = false;

		/**
		 * When true, the current client is sent an update any time an observer
		 * of the target room logs in or logs off; defaults to true.
		 *
		 * Updates trigger the following events:
		 * - AccountEvent.LOGIN (via the AccountManager and the UserAccount object for the client
		 *   that logged in)
		 * - AccountEvent.LOGOFF (via the AccountManager and the UserAccount object for the client
		 *   that logged off)
		 */
		observerLoginLogoff:boolean = false;

		/**
		 * Identical to the sharedRoomAttributes variable, but also includes non-shared
		 * attributes. Requires administrator privileges; defaults to false.
		 */
		allRoomAttributes:boolean = false;
		
		constructor()
		{
			this.restoreDefaults();
		}

		/**
		 * Sets all update levels to false.
		 */
		clearAll():void
		{
			this.roomMessages = false;
			this.sharedRoomAttributes = false;
			this.occupantCount = false;
			this.observerCount = false;
			this.occupantList = false;
			this.observerList = false;
			this.sharedOccupantAttributesRoom = false;
			this.sharedOccupantAttributesGlobal = false;
			this.sharedObserverAttributesRoom = false;
			this.sharedObserverAttributesGlobal = false;
			this.occupantLoginLogoff = false;
			this.observerLoginLogoff = false;
			this.allRoomAttributes = false;
		}

		/**
		 * Assigns the levels of this UpdateLevels object based on the supplied
		 * integer, whose bits represent the desired new update levels. The fromInt()
		 * method is used internally by Orbiter when receiving room update levels
		 * from Union Server.
		 */
		fromInt(levels:number):void
		{
			this.roomMessages                   = (levels & UpdateLevels.FLAG_ROOM_MESSAGES)                     != 0;
			this.sharedRoomAttributes           = (levels & UpdateLevels.FLAG_SHARED_ROOM_ATTRIBUTES)            != 0;
			this.occupantCount                  = (levels & UpdateLevels.FLAG_OCCUPANT_COUNT)                    != 0;
			this.observerCount                  = (levels & UpdateLevels.FLAG_OBSERVER_COUNT)                    != 0;
			this.occupantList                   = (levels & UpdateLevels.FLAG_OCCUPANT_LIST)                     != 0;
			this.observerList                   = (levels & UpdateLevels.FLAG_OBSERVER_LIST)                     != 0;
			this.sharedOccupantAttributesRoom   = (levels & UpdateLevels.FLAG_SHARED_OCCUPANT_ATTRIBUTES_ROOM)   != 0;
			this.sharedOccupantAttributesGlobal = (levels & UpdateLevels.FLAG_SHARED_OCCUPANT_ATTRIBUTES_GLOBAL) != 0;
			this.sharedObserverAttributesRoom   = (levels & UpdateLevels.FLAG_SHARED_OBSERVER_ATTRIBUTES_ROOM)   != 0;
			this.sharedObserverAttributesGlobal = (levels & UpdateLevels.FLAG_SHARED_OBSERVER_ATTRIBUTES_GLOBAL) != 0;
			this.occupantLoginLogoff            = (levels & UpdateLevels.FLAG_OCCUPANT_LOGIN_LOGOFF)             != 0;
			this.observerLoginLogoff            = (levels & UpdateLevels.FLAG_OBSERVER_LOGIN_LOGOFF)             != 0;
			this.allRoomAttributes              = (levels & UpdateLevels.FLAG_ALL_ROOM_ATTRIBUTES)               != 0;
		}

		/**
		 * Sets all update levels to their default values, as specified in the
		 * documentation for each update level constant.
		 */
		restoreDefaults():void
		{
			this.roomMessages = true;
			this.sharedRoomAttributes = true;
			this.occupantCount = false;
			this.observerCount = false;
			this.occupantList = true;
			this.observerList = false;
			this.sharedOccupantAttributesRoom = true;
			this.sharedOccupantAttributesGlobal = true;
			this.sharedObserverAttributesRoom = false;
			this.sharedObserverAttributesGlobal = false;
			this.occupantLoginLogoff = true;
			this.observerLoginLogoff = false;
			this.allRoomAttributes = false;
		}

		/**
		 * Converts this UpdateLevels object to an integer whose bits represent
		 * the specified update levels. The toInt() method is used internally by Orbiter
		 * when sending room update levels to Union Server.
		 */
		toInt():number
		{
			return (this.roomMessages                   ? UpdateLevels.FLAG_ROOM_MESSAGES                     : 0) |
			       (this.sharedRoomAttributes           ? UpdateLevels.FLAG_SHARED_ROOM_ATTRIBUTES            : 0) |
			       (this.occupantCount                  ? UpdateLevels.FLAG_OCCUPANT_COUNT                    : 0) |
			       (this.observerCount                  ? UpdateLevels.FLAG_OBSERVER_COUNT                    : 0) |
			       (this.occupantList                   ? UpdateLevels.FLAG_OCCUPANT_LIST                     : 0) |
			       (this.observerList                   ? UpdateLevels.FLAG_OBSERVER_LIST                     : 0) |
			       (this.sharedOccupantAttributesRoom   ? UpdateLevels.FLAG_SHARED_OCCUPANT_ATTRIBUTES_ROOM   : 0) |
			       (this.sharedOccupantAttributesGlobal ? UpdateLevels.FLAG_SHARED_OCCUPANT_ATTRIBUTES_GLOBAL : 0) |
			       (this.sharedObserverAttributesRoom   ? UpdateLevels.FLAG_SHARED_OBSERVER_ATTRIBUTES_ROOM   : 0) |
			       (this.sharedObserverAttributesGlobal ? UpdateLevels.FLAG_SHARED_OBSERVER_ATTRIBUTES_GLOBAL : 0) |
			       (this.occupantLoginLogoff            ? UpdateLevels.FLAG_OCCUPANT_LOGIN_LOGOFF             : 0) |
			       (this.observerLoginLogoff            ? UpdateLevels.FLAG_OBSERVER_LOGIN_LOGOFF             : 0) |
			       (this.allRoomAttributes              ? UpdateLevels.FLAG_ALL_ROOM_ATTRIBUTES               : 0);
		}
	}
}

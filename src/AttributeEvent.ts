namespace net.user1.orbiter
{
	/**
	 * AttributeEvent is a simple data class used to pass information from an object to registered
	 * event-listeners when an attribute event occurs. The AttributeEvent class also defines
	 * constants representing the available attribute events.
	 *
	 * To register for an attribute event, use the [[Client]], [[UserAccount]], or [[Room]] class's
	 * addEventListener() method.
	 */
	export class AttributeEvent extends net.user1.events.Event
	{
		/**
		 * Dispatched when an attribute is deleted.
		 */
		static DELETE = 'DELETE';

		/**
		 * Dispatched when the result of an attempt to delete an attribute is received.
		 * To determine the result of the attempt, use getStatus(), which has the following
		 * possible return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.CLIENT_NOT_FOUND (client attributes only)
		 * - Status.ROOM_NOT_FOUND (room attributes only)
		 * - Status.IMMUTABLE
		 * - Status.SERVER_ONLY
		 */
		static DELETE_RESULT = 'DELETE_RESULT';

		/**
		 * Dispatched when the result of an attempt to set an attribute is received.
		 * To determine the result of the attempt, use getStatus(), which has the following
		 * possible return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.DUPLICATE_VALUE (client attributes only)
		 * - Status.CLIENT_NOT_FOUND (client attributes only)
		 * - Status.ROOM_NOT_FOUND (room attributes only)
		 * - Status.IMMUTABLE
		 * - Status.SERVER_ONLY
		 * - Status.EVALUATION_FAILED
		 */
		static SET_RESULT = 'SET_RESULT';

		/**
		 * Dispatched when an attribute changes or is set for the first time.
		 */
		static UPDATE = 'UPDATE';

		constructor(type:string,
		            private readonly changedAttr:Attribute,
		            private readonly status:string|null=null)
		{
			super(type);
		}

		/**
		 * Returns an Attribute object pertaining to this client event. The Attribute object
		 * contains information about a changed attribute.
		 * @return {net.user1.orbiter.Attribute}
		 */
		getChangedAttr():Attribute
		{
			return this.changedAttr;
		}

		/**
		 * Returns the status of the operation to which this event pertains.
		 *
		 * The getStatus() method's return value is always one of the Status class's constants.
		 *
		 * For a list of specific status values that can be returned during a particular event, see
		 * the documentation for that event.
		 * @return {string | null}
		 */
		getStatus():string|null
		{
			return this.status;
		}

		/**
		 * @internal
		 * @return {string}
		 */
		toString():string
		{
			return '[object AttributeEvent]';
		}
	}
}

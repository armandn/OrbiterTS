namespace net.user1.orbiter
{
	/**
	 * A simple data class representing an attribute of a client, a room, or a user account.
	 * Attribute instances represent a changed or deleted attribute, and are passed to event
	 * listeners for the following events:
	 * - [[AttributeEvent.UPDATE]],
	 * - [[AttributeEvent.DELETE]],
	 * - [[RoomEvent.UPDATE_CLIENT_ATTRIBUTE]],
	 * - [[RoomEvent.DELETE_CLIENT_ATTRIBUTE]].
	 */
	export class Attribute
	{
		/**
		 * The IClient object representing the client that set or deleted the attribute, if known.
		 * When the server sets an attribute, byClient is null.
		 */
		private readonly byClient?:Client

		/**
		 * The attribute name.
		 */
		readonly name?:string

		/**
		 * The attribute's old value.
		 */
		readonly oldValue?:string

		/**
		 * The attribute's qualifying room ID. Applies to client attributes only.
		 * Room attributes and global client attributes have the scope null.
		 */
		readonly scope?:string;

		/**
		 * The attribute name.
		 */
		readonly value?:string

		constructor(name?:string, value?:string, oldValue?:string, scope?:string, byClient?:Client)
		{
			this.byClient = byClient;
			this.name     = name;
			this.oldValue = oldValue;
			this.value    = value;
			this.scope    = (scope == Tokens.GLOBAL_ATTR) || (scope == null) ? undefined : scope;
		}

		/**
		 * @internal
		 * @return {string}
		 */
		toString():string
		{
			return `Attribute: ${this.scope ?? '' + '.'}${this.name} = ${this.value}. Old value: ${this.oldValue}`;
		}
	}

}

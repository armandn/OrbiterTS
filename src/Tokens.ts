namespace net.user1.orbiter
{
	/**
	 * A collection of constants representing meaningful tokens in communications with Union Server.
	 */
	export enum Tokens
	{
		/**
		 * The attribute used to represent custom client classes.
		 */
		CUSTOM_CLASS_ATTR    = '_CLASS',

		/**
		 * Signifies that a client attribute is global.
		 */
		GLOBAL_ATTR          = '',

		/**
		 * The attribute used to represent maximum clients for a room.
		 */
		MAX_CLIENTS_ATTR     = '_MAX_CLIENTS',

		/**
		 * The attribute used to represent the password setting for a room.
		 */
		PASSWORD_ATTR        = '_PASSWORD',

		/**
		 * The attribute used to represent the removeOnEmpty setting for a room.
		 */
		REMOVE_ON_EMPTY_ATTR = '_DIE_ON_EMPTY',

		/**
		 * The attribute used to represent a client or user account's security roles.
		 */
		ROLES_ATTR           = '_ROLES',

		/**
		 * The character used by the client as a record separator when serializing
		 * attributes or any other form of composite data. This character defaults to
		 * "|" and must not be used in attribute names or values. Methods in the
		 * Orbiter API that perform serialization or deserialization will add a
		 * warning to the client-side log if this character is used inappropriately.
		 */
		RS = '|',

		/**
		 * The character used to signify a wildcard at the end of a room qualifier.
		 * Defaults to * (asterisk).
		 *
		 * In a fully qualified room ID, this character is legal as the last
		 * character only, and only after a period (.). See the Validator class.
		 *
		 * Methods in the Orbiter API that perform serialization or
		 * deserialization will add a warning to the client-side log if
		 * this character is used inappropriately.
		 */
		WILDCARD = '*'
	}
}

namespace net.user1.orbiter
{
	/**
	 * An enumeration of the status codes for all built-in UPC messages and Orbiter events. For a
	 * list of status codes supported by a given event, consult the documentation for that event.
	 */
	export enum Status
	{
		ACCOUNT_EXISTS         = 'ACCOUNT_EXISTS',
		ACCOUNT_NOT_FOUND      = 'ACCOUNT_NOT_FOUND',
		AUTHORIZATION_REQUIRED = 'AUTHORIZATION_REQUIRED',
		AUTHORIZATION_FAILED   = 'AUTHORIZATION_FAILED',
		ALREADY_ASSIGNED       = 'ALREADY_ASSIGNED',
		ALREADY_BANNED         = 'ALREADY_BANNED',
		ALREADY_IN_ROOM        = 'ALREADY_IN_ROOM',
		ALREADY_LOGGED_IN      = 'ALREADY_LOGGED_IN',
		ALREADY_OBSERVING      = 'ALREADY_OBSERVING',
		ALREADY_SYNCHRONIZED   = 'ALREADY_SYNCHRONIZED',
		ALREADY_WATCHING       = 'ALREADY_WATCHING',
		ATTR_NOT_FOUND         = 'ATTR_NOT_FOUND',
		CLIENT_NOT_FOUND       = 'CLIENT_NOT_FOUND',
		ERROR                  = 'ERROR',
		EVALUATION_FAILED      = 'EVALUATION_FAILED',
		DUPLICATE_VALUE        = 'DUPLICATE_VALUE',
		IMMUTABLE              = 'IMMUTABLE',
		INVALID_QUALIFIER      = 'INVALID_QUALIFIER',
		NAME_NOT_FOUND         = 'NAME_NOT_FOUND',
		NAME_EXISTS            = 'NAME_EXISTS',
		NOT_ASSIGNED           = 'NOT_ASSIGNED',
		NOT_BANNED             = 'NOT_BANNED',
		NOT_IN_ROOM            = 'NOT_IN_ROOM',
		NOT_LOGGED_IN          = 'NOT_LOGGED_IN',
		NOT_OBSERVING          = 'NOT_OBSERVING',
		NOT_WATCHING           = 'NOT_WATCHING',
		PERMISSION_DENIED      = 'PERMISSION_DENIED',
		REMOVED                = 'REMOVED',
		ROLE_NOT_FOUND         = 'ROLE_NOT_FOUND',
		ROOM_EXISTS            = 'ROOM_EXISTS',
		ROOM_FULL              = 'ROOM_FULL',
		ROOM_NOT_FOUND         = 'ROOM_NOT_FOUND',
		SERVER_ONLY            = 'SERVER_ONLY',
		SUCCESS                = 'SUCCESS',
	}
}

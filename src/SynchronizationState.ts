namespace net.user1.orbiter
{
	/**
	 * The SynchronizationState class is an enumeration of constant values describing the current
	 * synchronization state of a client-side object such as a room.
	 */
	export enum SynchronizationState
	{
		NOT_SYNCHRONIZED = "NOT_SYNCHRONIZED",
		SYNCHRONIZED     = "SYNCHRONIZED",
		SYNCHRONIZING    = "SYNCHRONIZING"
	}
}

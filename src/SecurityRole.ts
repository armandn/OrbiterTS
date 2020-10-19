namespace net.user1.orbiter
{
	/**
	 * The SecurityRole class is an enumeration of constant values representing different security
	 * roles for a user account. SecurityRole constants are used by the following methods and
	 * events:
	 * - [[AccountManager.addRole]]
	 * - [[AccountManager.removeRole]]
	 * - [[UserAccount.addRole]]
	 * - [[UserAccount.removeRole]]
	 * - [[AccountEvent.ADD_ROLE_RESULT]]
	 * - [[AccountEvent.REMOVE_ROLE_RESULT]]
	 */
	export enum SecurityRole
	{
		/** The security role for moderators.*/
		MODERATOR = 'MODERATOR'
	}
}

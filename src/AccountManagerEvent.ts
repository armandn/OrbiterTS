namespace net.user1.orbiter
{
	/**
	 * AccountManagerEvent is a simple data class used to pass information from the [[AccountManager]]
	 * to registered event-listeners when an account management event occurs. The
	 * AccountManagerEvent class also defines constants representing the available account
	 * management events.
	 *
	 * To register for an account management event, use [[AccountManager.addEventListener]] method.
	 */
	export class AccountManagerEvent extends net.user1.events.Event
	{
		/**
		 * Dispatched when the AccountManager is informed by Union Server that a user account was
		 * created. This event is available when the AccountManager is watching for user accounts
		 * only (see [[AccountManager.watchForAccounts]]).
		 */
		static readonly ACCOUNT_ADDED = 'ACCOUNT_ADDED';

		/**
		 * Dispatched when the AccountManager is informed by Union Server that a user account was
		 * deleted. This event is available when the AccountManager is watching for user accounts
		 * only (see [[AccountManager.watchForAccounts]]).
		 */
		static readonly ACCOUNT_REMOVED = 'ACCOUNT_REMOVED';

		/**
		 * Dispatched when the result of an earlier call to [[AccountManager.createAccount]]
		 * method is received. To determine the result of the account-creation request, use
		 * getStatus(), which has the following possible return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.ACCOUNT_EXISTS
		 */
		static readonly CREATE_ACCOUNT_RESULT = 'CREATE_ACCOUNT_RESULT';

		/**
		 * Dispatched when the result of an earlier call to [[AccountManager.removeAccount]] method
		 * is received. To determine the result of the account-removal request, use getStatus(),
		 * which has the following possible return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.ACCOUNT_NOT_FOUND
		 * - Status.AUTHORIZATION_FAILED
		 */
		static readonly REMOVE_ACCOUNT_RESULT = 'REMOVE_ACCOUNT_RESULT';

		/**
		 * Dispatched when the AccountManager receives the result of an earlier
		 * stopWatchingForAccounts() request. To determine the result of the attempt, use
		 * getStatus(), which has the following possible return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.NOT_WATCHING
		 */
		static readonly STOP_WATCHING_FOR_ACCOUNTS_RESULT = 'STOP_WATCHING_FOR_ACCOUNTS_RESULT';

		/**
		 * Dispatched when the AccountManager's list of user accounts has finished
		 * synchronization after a watchForAccounts() request.
		 */
		static readonly SYNCHRONIZE = 'SYNCHRONIZE';

		/**
		 * Dispatched when the AccountManager receives the result of an earlier watchForAccounts()
		 * request. To determine the result of the request, use getStatus(), which has the
		 * following possible return values:
		 * - Status.SUCCESS
		 * - Status.ERROR
		 * - Status.ALREADY_WATCHING
		 */
		static readonly WATCH_FOR_ACCOUNTS_RESULT = 'WATCH_FOR_ACCOUNTS_RESULT';

		constructor(type:string,
		            private readonly userID:string|null=null,
		            private readonly account:UserAccount|null=null,
		            private readonly status:string|null=null)
		{
			super(type);
		}

		/**
		 * Returns the UserAccount object pertaining to this account manager event. For example,
		 * for an [[AccountManagerEvent.ACCOUNT_REMOVED]] event, getAccount() returns the UserAccount
		 * object for the removed account.
		 * @return {net.user1.orbiter.UserAccount | null}
		 */
		getAccount():UserAccount|null
		{
			return this.account;
		}

		/**
		 * Returns the status of the operation to which this event pertains. The getStatus()
		 * method's return value is always one of the Status class's constants. For example, if the
		 * [[AccountManagerEvent.CREATE_ACCOUNT_RESULT]] event occurs in response to a successful
		 * account-creation attempt, getStatus() will return the value of [[Status.SUCCESS]].
		 *
		 * To respond to a status, compare the return of getStatus() to one of the Status
		 * constants.
		 * ```
		 *     if (e.getStatus() == Status.SUCCESS) {
		 *         showAccountCreatedScreen();
		 *     }
		 * ```
		 * For a list of specific status values that can be returned during a particular event,
		 * see the documentation for that event.
		 * @return {string | null}
		 */
		getStatus():string|null
		{
			return this.status;
		}

		/**
		 * Returns the user ID of the account to which this event pertains. For example, for the
		 * [[AccountManagerEvent.ACCOUNT_ADDED]] event, getUserID() returns the userID of the account
		 * that was added to the server.
		 * @return {string | null}
		 */
		getUserID():string|null
		{
			return this.userID;
		}

		/**
		 * @internal
		 * @return {string}
		 */
		toString():string
		{
			return '[object AccountManagerEvent]';
		}
	}
}

///<reference path="Event.ts"/>
namespace net.user1.orbiter
{
	/**
	 * AccountEvent is a simple data class used to pass information from a UserAccount object or
	 * AccountManager object to registered event-listeners when an account event occurs. The
	 * AccountEvent class also defines constants representing the available account events.
	 * To register for an account event, use [[UserAccount.addEventListener]] method or
	 * [[AccountManager.addEventListener]] method.
	 */
	export class AccountEvent extends net.user1.events.Event
	{
		/**
		 * Dispatched when the result of an earlier [[UserAccount.addRole]]
		 * or [[AccountManager.addRole]] request is received.
		 */
		static ADD_ROLE_RESULT = 'ADD_ROLE_RESULT';

		/**
		 * Dispatched when the current client's account password changes. A user can change its own
		 * password via the [[AccountManager.changePassword]] method or the
		 * [[UserAccount.changePassword]] method. With sufficient privileges, the current client
		 * can change another user's password. Server-side code can change any user's password.
		 */
		static CHANGE_PASSWORD = 'CHANGE_PASSWORD';

		/**
		 * Dispatched when the current client receives the result of an earlier request to change a
		 * user account's password. To determine the result of the change-password request, use
		 * getStatus(), which has the following possible return values:
		 * <ul>
		 * <li>Status.SUCCESS</li>
		 * <li>Status.ERROR</li>
		 * <li>Status.AUTHORIZATION_FAILED</li>
		 * <li>Status.ACCOUNT_NOT_FOUND</li>
		 * </ul>
		 */
		static CHANGE_PASSWORD_RESULT = 'CHANGE_PASSWORD_RESULT';

		/**
		 * Dispatched when any client that is known to the current client logs in. For a list of the
		 * situations in which a client becomes known to the current client, see the
		 * [[ClientManager.clientIsKnown]] method. Note however, that the current client can opt
		 * out of login notification for room occupants and room observers by disabling
		 * "occupant-login-logoff updates" and "observer-login-logoff updates" via the
		 * [[Room.setUpdateLevels]] method. The AccountEvent.LOGIN event is dispatched via the
		 * Client object for the client that logged in, then the UserAccount object for the
		 * logged-in account, then the AccountManager.
		 */
		static LOGIN = 'LOGIN';

		/**
		 * Dispatched when the result of an earlier login request
		 * by the current client is received.
		 *
		 * To determine the result of the login request,
		 * use getStatus(), which has the following possible return values:
		 *
		 * <ul>
		 * <li>Status.SUCCESS</li>
		 * <li>Status.ERROR</li>
		 * <li>Status.ALREADY_LOGGED_IN</li>
		 * <li>Status.AUTHORIZATION_FAILED</li>
		 * <li>Status.ACCOUNT_NOT_FOUND</li>
		 * </ul>
		 */
		static LOGIN_RESULT = 'LOGIN_RESULT';

		/**
		 * Dispatched when any user account that is known to the current client logs off. For a list
		 * of the situations in which a client becomes known to the current client, see the
		 * [[ClientManager.clientIsKnown]] method. Note however, that the current client can opt out
		 * of logoff notification for room occupants and room observers by disabling
		 * "occupant-login-logoff updates" and "observer-login-logoff updates" via the
		 * [[Room.setUpdateLevels]] method. The AccountEvent.LOGOFF event is dispatched via the
		 * Client object for the client that logged off, then the UserAccount object for the
		 * logged-off account, then the AccountManager.
		 */
		static LOGOFF = 'LOGOFF';

		/**
		 * Dispatched when the current client receives the result of an earlier request to logoff a
		 * client. To determine the result of the logoff request, use getStatus(), which has the
		 * following possible return values:
		 * <ul>
		 * <li>Status.SUCCESS</li>
		 * <li>Status.ERROR</li>
		 * <li>Status.AUTHORIZATION_FAILED</li>
		 * <li>Status.NOT_LOGGED_IN</li>
		 * <li>Status.ACCOUNT_NOT_FOUND</li>
		 * </ul>
		 */
		static LOGOFF_RESULT = 'LOGOFF_RESULT';

		/**
		 * Dispatched when the current client observes a user account. For complete
		 * details, see the AccountManager's observeAccount() method.
		 */
		static OBSERVE = 'OBSERVE';

		/**
		 * Dispatched when the result of an earlier [[UserAccount.observe]]
		 * or [[AccountManager.observeAccount]] request is received.
		 */
		static OBSERVE_RESULT = 'OBSERVE_RESULT';

		/**
		 * Dispatched when the result of an earlier [[UserAccount.removeRole]]
		 * or [[AccountManager.removeRole]] request is received.
		 */
		static REMOVE_ROLE_RESULT = 'REMOVE_ROLE_RESULT';

		/**
		 * Dispatched when the current client stops observing a user account.
		 */
		static STOP_OBSERVING = 'STOP_OBSERVING';

		/**
		 * Dispatched when the result of an earlier [[UserAccount.stopObserving]] or
		 * [[AccountManager.stopObservingAccount]] request is received.
		 */
		static STOP_OBSERVING_RESULT = 'STOP_OBSERVING_RESULT';

		/**
		 * Dispatched when a user account has been synchronized to match the state of the server.
		 */
		static SYNCHRONIZE = 'SYNCHRONIZE';

		private account:UserAccount|null = null;

		/**
		 * Constructor.
		 */
		constructor(type:string,
		            private readonly status:Status|null=null,
		            private readonly userID:string|null=null,
		            private readonly clientID:string|null=null,
		            private readonly role:string|null=null)
		{
			super(type);
		}

		/**
		 * Returns the UserAccount object pertaining to this account event. For example, for an
		 * [[AccountEvent.LOGIN]] event, getAccount() returns the UserAccount object for the
		 * account that logged in.
		 */
		getAccount():UserAccount|null
		{
			if (this.target instanceof AccountManager)
			{
				return this.account;
			}
			else
			if (this.target instanceof UserAccount)
			{
				return this.target;
			}
			else
			{
				throw new Error(`[AccountEvent] Unexpected target type: ${this.target}`);
			}
		}

		/**
		 * Returns the clientID pertaining to this account event, if available.
		 */
		getClientID():string|null
		{
			return this.clientID;
		}

		/**
		 * Returns the role pertaining to this account event. This method applies to the following
		 * events:
		 * - [[AccountEvent.ADD_ROLE_RESULT]]
		 * - [[AccountEvent.REMOVE_ROLE_RESULT]]
		 */
		getRole():string|null
		{
			return this.role;
		}

		/**
		 * Returns the status of the operation to which this event pertains. The getStatus()
		 * method's return value is always one of the Status types. For example, if the
		 * [[AccountEvent.LOGIN_RESULT]] event occurs in response to a successful login attempt,
		 * getStatus()  will return the value of [[Status.SUCCESS]].
		 */
		getStatus():Status|null
		{
			return this.status;
		}

		/**
		 * Returns the userID pertaining to this account event.
		 * @return {string | null}
		 */
		getUserID():string|null
		{
			return this.userID;
		}

		/**
		 * @internal
		 * @param {net.user1.orbiter.UserAccount | null} value
		 */
		setAccount(value:UserAccount|null=null):void
		{
			this.account = value;
		}

		/**
		 * @internal
		 * @return {string}
		 */
		toString():string
		{
			return '[object AccountEvent]';
		}
	}
}

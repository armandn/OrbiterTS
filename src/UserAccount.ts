namespace net.user1.orbiter
{
	import Logger = net.user1.logger.Logger;

	/**
	 * The UserAccount class represents a Union user account. Each user account can save information 
	 * in persistent attributes, which are stored in a server-side database or other custom 
	 * datasource. User accounts are created with the AccountManager class's createAccount() method. 
	 * Clients login to user accounts via the AccountManager class's login() method. When a client 
	 * logs in, its Client object is linked with a UserAccount object. To access the account's 
	 * events and data, use the Client class's getAccount() method, which returns a UserAccount 
	 * object.
	 *
	 * When a client logs into an account, that account's global attributes are loaded 
	 * automatically, and are immediately available via UserAccount's getAttribute() method. Account 
	 * attributes scoped to a room are loaded automatically when the logged-in client joins or 
	 * observes that room.
	 *
	 * To access the list of UserAccount objects known to the current client, use the AccountManager 
	 * class's getAccounts() method.
	 */
	export class UserAccount extends net.user1.events.EventDispatcher
	{
		static FLAG_MODERATOR = 1 << 1;

		private attributeManager?:AttributeManager;
		private connectionState:number = 0;
		private password?:string;
		private lastAttemptedPassword?:string;
		private client?:Client;

		/**
		 * Constructor. Developers need not invoke the UserAccount constructor directly; Orbiter
		 * automatically creates UserAccount objects when clients login.
		 */
		constructor(private userID:string,
		            private readonly log:net.user1.logger.Logger,
		            private readonly accountManager:AccountManager,
		            private readonly clientManager:ClientManager|null = null,
		            private readonly roomManager:RoomManager|null = null)
		{
			super();
		}

		/**
		 * Adds a new security role to the account.
		 * @param role The desired new role. For a list of built-in security roles, see the
		 * [[SecurityRole]] class.
		 */
		addRole(role:SecurityRole)
		{
			this.accountManager.addRole(this.getUserID(), role);
		}

		/**
		 * Changes the account's password.
		 * @param newPassword The desired new account password. Must not be null.
		 * @param oldPassword The current account password. If no password is supplied, the password 
		 *                    will be changed if the client requesting the change has sufficient 
		 *                    privileges only.
		 */
		changePassword(newPassword:string, oldPassword:string):void
		{
			this.accountManager.changePassword(this.getUserID(), newPassword, oldPassword);
		}

		/**
		 * Deletes an attribute from this user account.
		 */
		deleteAttribute(attrName:string, attrScope:string):void
		{
			const deleteRequest = new upc.RemoveClientAttr(undefined, this.getUserID(), attrName, attrScope);
			this.attributeManager?.deleteAttribute(deleteRequest);
		}

		/**
		 * @internal
		 */
		doLoginTasks():void
		{
			this.fireLogin();
		}

		/**
		 * @internal
		 */
		doLogoffTasks():void
		{
			this.setClient(undefined);
			this.fireLogoff();
		}

		/**
		 * @internal
		 */
		fireAddRoleResult(role:string, status:Status):void
		{
			const e = new AccountEvent(AccountEvent.ADD_ROLE_RESULT, status, this.getUserID(), this.client?.getClientID(), role);
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 */
		fireChangePassword():void
		{
			const e = new AccountEvent(AccountEvent.CHANGE_PASSWORD, Status.SUCCESS, this.getUserID(), this.client?.getClientID());
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 */
		fireChangePasswordResult(status:Status):void
		{
			const e = new AccountEvent(AccountEvent.CHANGE_PASSWORD_RESULT, status, this.getUserID(), this.client?.getClientID());
			this.dispatchEvent(e);
		}

		private fireLogin():void
		{
			const e = new AccountEvent(AccountEvent.LOGIN, Status.SUCCESS, this.getUserID(), this.client?.getClientID());
			this.dispatchEvent(e);
		}

		private fireLogoff():void
		{
			const e = new AccountEvent(AccountEvent.LOGOFF, Status.SUCCESS, this.getUserID(), this.client?.getClientID());
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 */
		fireLogoffResult(status:Status):void
		{
			const e = new AccountEvent(AccountEvent.LOGOFF_RESULT, status, this.getUserID(), this.client?.getClientID());
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 */
		fireObserve():void
		{
			const e = new AccountEvent(AccountEvent.OBSERVE, Status.SUCCESS, this.getUserID(), this.client?.getClientID());
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 */
		fireObserveResult(status:Status):void
		{
			const e = new AccountEvent(AccountEvent.OBSERVE_RESULT, status, this.getUserID(), this.client?.getClientID());
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 */
		fireRemoveRoleResult(role:string, status:Status):void
		{
			const e = new AccountEvent(AccountEvent.REMOVE_ROLE_RESULT, status, this.getUserID(), this.client?.getClientID(), role);
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 */
		fireStopObserving():void
		{
			const e = new AccountEvent(AccountEvent.STOP_OBSERVING, Status.SUCCESS, this.getUserID(), this.client?.getClientID());
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 */
		fireStopObservingResult(status:Status):void
		{
			const e = new AccountEvent(AccountEvent.STOP_OBSERVING_RESULT, status, this.getUserID(), this.client?.getClientID());
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 */
		fireSynchronize():void
		{
			const e = new AccountEvent(AccountEvent.SYNCHRONIZE, Status.SUCCESS, this.getUserID(), this.client?.getClientID());
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 */
		getAccountManager():AccountManager
		{
			return this.accountManager;
		}

		/**
		 * Retrieves a persistent client attribute. This UserAccount's persistent attributes are
		 * available only when this UserAccount is synchronized with the state of the server.
		 *
		 * To synchronize an account, the current client must do one of the following:
		 * - Join a room containing the account's logged-in client, and set sufficiently verbose
		 *   room-update levels for the room
		 * - Observe a room containing the account's logged-in client, and set sufficiently verbose
		 *   room-update levels for the room
		 *
		 * For general details on retrieving attributes, see the [[Client.getAttribute]] method.
		 */
		getAttribute(attrName:string, attrScope?:string):string|null
		{
			return this.attributeManager?.getAttribute(attrName, attrScope) ?? null;
		}

		private getAttributeCollection():AttributeCollection|null
		{
			return this.attributeManager?.getAttributeCollection() ?? null;
		}

		/**
		 * @internal
		 */
		getAttributeManager():AttributeManager|null
		{
			return this.attributeManager ?? null;
		}

		/**
		 * Returns an object containing all attributes for this user account. The
		 * object's structure matches that of the analogous [[Client.getAttributes]].
		 */
		getAttributes():{[name:string]:string|undefined} | null
		{
			return this.attributeManager?.getAttributes() ?? null;
		}

		/**
		 * Returns an object containing the names and values of all attributes
		 * defined on this UserAccount instance for a given scope, or for all scopes.
		 * The object's structure matches that of the analogous [[Client.getAttributesByScope]].
		 */
		getAttributesByScope(scope:string):{[scope:string]:{[name:string]:string|undefined}} | {[name:string]:string|undefined} | null
		{
			return this.attributeManager?.getAttributesByScope(scope) ?? null;
		}

		/**
		 * Returns a reference to this account's Client object, which is available
		 * if this account is logged in only.
		 */
		getClient():Client|CustomClient|null
		{
			this.validateClientReference();
			if (!this.client)
				return null;

			return this.client.getCustomClient() ?? this.client;
		}

		/**
		 * @internal
		 */
		getClientManager():ClientManager|null
		{
			return this.clientManager;
		}

		/**
		 * Indicates whether this UserAccount is currently logged in.
		 *
		 * @return An integer corresponding to one of the following three constants:
		 * ConnectionState.LOGGED_IN, ConnectionState.NOT_CONNECTED, or ConnectionState.UNKNOWN.
		 */
		getConnectionState():ConnectionState
		{
			if (this.getInternalClient() != null)
			{
				return ConnectionState.LOGGED_IN;
			}
			else
			if (!this.accountManager.isObservingAccount(this.getUserID()))
			{
				return ConnectionState.NOT_CONNECTED;
			}
			else
			if (this.clientManager?.isWatchingForClients())
			{
				return ConnectionState.NOT_CONNECTED;
			}
			else
			{
				// Not observing this user, not watching for clients, and no client means this
				// account's state is unknown. (This happens when watching for user accounts).
				return ConnectionState.UNKNOWN;
			}
		}

		/**
		 * Returns the internal [[Client]] object for this account's corresponding client. This
		 * method is required when an application wishes to access the composed Client object
		 * reference for a client with a custom client class. For details, see the
		 * [[ClientManager.getInternalClient]] method.
		 */
		getInternalClient():Client|null
		{
			this.validateClientReference();
			return this.client ?? null;
		}

		/**
		 * @internal
		 */
		getLog():Logger
		{
			return this.log;
		}

		/**
		 * @internal
		 */
		getRoomManager():RoomManager|null
		{
			return this.roomManager;
		}

		/**
		 * Returns this account's userID.
		 */
		getUserID():string
		{
			return this.userID;
		}

		/**
		 * Returns true if this user account's connection state is ConnectionState.LOGGED_IN;
		 * false otherwise.
		 */
		isLoggedIn():boolean
		{
			return this.getConnectionState() == ConnectionState.LOGGED_IN;
		}

		/**
		 * Returns a Boolean indicating whether the account has moderator privileges. To assign
		 * moderator privileges to an account, use addRole().
		 *
		 * @return true if the account has moderator privileges, false otherwise.
		 */
		isModerator():boolean
		{
			const rolesAttr = this.getAttribute(Tokens.ROLES_ATTR);
			if (rolesAttr != null)
			{
				return (parseInt(rolesAttr) & UserAccount.FLAG_MODERATOR) > 0;
			}
			else
			{
				this.getLog().warn(`${this.toString()} Could not determine moderator status because the account is not synchronized.`);
				return false;
			}
		}

		/**
		 * Returns true if the current client is logged in under this UserAccount.
		 */
		isSelf():boolean
		{
			return this.client?.isSelf() ?? false;
		}

		/**
		 * Logs off this user account. The result of the attempt is returned via an
		 * AccountEvent.LOGOFF_RESULT event. If the attempt succeeds, the UserAccount object
		 * triggers an AccountEvent.LOGOFF event and the corresponding client is then automatically
		 * disconnected by Union Server.
		 *
		 * @param password The account's password. If no password is supplied, the account will be
		 *                 logged off if the client requesting the logoff has sufficient privileges
		 *                 only.
		 */
		logoff(password?:string):void
		{
			this.accountManager.logoff(this.getUserID(), password);
		}

		/**
		 * Asks the server to notify the current client any time this UserAccount's
		 * state changes. For complete details, see the AccountManager's
		 * observeAccount() method.
		 */
		observe():void
		{
			this.accountManager.observeAccount(this.getUserID());
		}

		/**
		 * Removes a security role from the account.
		 */
		removeRole(userID:string, role:string):void
		{
			this.accountManager.removeRole(this.getUserID(), role);
		}

		/**
		 * Assigns an account attribute that is stored persistently on the server under this user
		 * account.
		 *
		 * Note that a logged-in client's attribute names do not conflict with its account attribute
		 * names. For example, a client might define an attribute "score" on itself and also on its
		 * user account. The two attributes are considered separate; each can have its own value.
		 *
		 * For general details on assigning attributes, see the [[Client.setAttribute]] method.
		 */
		setAttribute(attrName:string, attrValue:string, attrScope:string, isShared:boolean, evaluate:boolean):void
		{
			// Create an integer to hold the attribute options
			const attrOptions = AttributeOptions.FLAG_PERSISTENT |
			                    (isShared ? AttributeOptions.FLAG_SHARED : 0) |
			                    (evaluate ? AttributeOptions.FLAG_EVALUATE : 0);

			// Set the attribute on the server.
			this.attributeManager?.setAttribute(new upc.SetClientAttr(attrName, attrValue, attrOptions, attrScope, undefined, this.getUserID()));
		};

		//TODO why not set this up in constructor?
		/**
		 * @internal
		 */
		setAttributeManager(value:AttributeManager):void
		{
			this.attributeManager = value;
		}

		/**
		 * @internal
		 */
		setClient(value?:Client):void
		{
			if (!value)
			{
				this.client = undefined;
			}
			else
			{
				if (this.client != value)
				{
					this.client = value;
					this.client.setAccount(this);
				}
			}
		}

		private setUserID(userID:string):void
		{
			if (this.userID != userID)
			{
				this.userID = userID;
			}
		}

		/**
		 * Asks the server to stop observing this UserAccount. As a result, the server will no
		 * longer send notifications when the UserAccount's state changes.
		 *
		 * Results of a stopObserving() call are returned via a AccountEvent.STOP_OBSERVING_RESULT
		 * event. If the call succeeds, the AccountEvent.STOP_OBSERVING event is also triggered.
		 */
		stopObserving():void
		{
			this.accountManager.stopObservingAccount(this.getUserID());
		}

		toString():string
		{
			return `[USER_ACCOUNT userid: ${this.getUserID()}, clientid: ${this.client?.getClientID()}]`;
		}

		private validateClientReference():void
		{
			if (this.client && this.roomManager && this.clientManager)
			{
				if (!this.client.isSelf() && !this.clientManager.isWatchingForClients() &&
				    !this.accountManager.isObservingAccount(this.getUserID()) &&
				    !this.clientManager.isObservingClient(this.client.getClientID()) &&
				    !this.roomManager.clientIsKnown(this.client.getClientID()))
				{
					this.setClient();
				}
			}
		}
	}
}

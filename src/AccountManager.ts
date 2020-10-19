///<reference path="LRUCache.ts"/>
namespace net.user1.orbiter
{
	import LRUCache = net.user1.utils.LRUCache;
	import Logger = net.user1.logger.Logger;

	/**
	 * The AccountManager class provides control over Union user accounts. A Union user account
	 * gives a user:
	 * - a persistent identity on the server
	 * - the ability to store information in a server-side data source
	 *
	 * Users that have created an account and logged in can save account attributes permanently
	 * using the [[UserAccount.setAttribute]] method. When a user logs in, all global account
	 * attributes for the user's account are automatically loaded. Room-scoped account attributes
	 * are automatically loaded as the user account's corresponding client joins or observes rooms.
	 */
	export class AccountManager extends net.user1.events.EventDispatcher
	{
		private _isWatchingForAccounts:boolean = false;
		private accountCache:LRUCache<UserAccount> = new LRUCache(10000);
		private clientManager:ClientManager|null =  null;
		private messageManager:MessageManager|null = null;
		private observedAccounts:AccountSet = new AccountSet();
		private roomManager:RoomManager|null = null;
		private watchedAccounts:AccountSet = new AccountSet();

		constructor(private readonly log:Logger)
		{
			super();
		}

		/**
		 * Returns a Boolean indicating whether the user account with the specified userID is known
		 * to the current client. A given user account is known to the current client in the
		 * following situations:
		 * - the current client is in or observing a room with an occupant logged in under the
		 *   specified userID, and the current client's room-update levels for the room include
		 *   occupant-login notifications
		 * - the current client is in or observing a room with an observer logged in under the
		 *   specified userID, and the current client's room-update levels for the room include
		 *   observer-login notifications
		 * - the current client is observing the specified user account
		 * - the current client is observing a client logged in under the specified userID
		 * - the current client is watching for user accounts (see [[watchForAccounts]]) and the
		 *   specified user account exists on the server
		 * - the current client is watching for clients (see [[ClientManager.watchForClients]]
		 *   method) and a connected client is logged into the specified user account
		 * - the current client is logged in under the specified user account
		 */
		accountIsKnown(userID:string):boolean
		{
			for (let knownUserID in this.getAccounts())
			{
				if (knownUserID == userID) return true;
			}
			return false;
		}

		/**
		 * @internal
		 * @param {net.user1.orbiter.UserAccount} account
		 */
		addObservedAccount(account:UserAccount):void
		{
			this.observedAccounts.add(account);
			this.fireObserveAccount(account.getUserID());
		}

		/**
		 * Adds a new security role to a user account. The result of the add-role attempt is
		 * returned via an [[AccountEvent.ADD_ROLE_RESULT]] event, which is dispatched both via the
		 * AccountManager and also via the [[UserAccount]] object for which the new role was requested.
		 * If no such account is known, the event is dispatched via the [[AccountManager]] only.
		 * @param userID The account's userID.
		 * @param role   The desired new role. For a list of built-in security roles, see the
		 *               [[SecurityRole]] class.
		 */
		addRole(userID:string, role:string):void
		{
			if (!userID)
			{
				this.log.warn('[ACCOUNT_MANAGER] Add role failed. No userID supplied.');
			}
			else if (!role)
			{
				this.log.warn(`[ACCOUNT_MANAGER] Add role failed for account [${userID}]. No role supplied.`);
			}
			else
			{
				this.messageManager!.sendUPC(UPC.ADD_ROLE, userID, role);
			}
		}

		/**
		 * @internal
		 * @param {net.user1.orbiter.UserAccount} account
		 */
		addWatchedAccount(account:UserAccount):void
		{
			this.watchedAccounts.add(account);
			this.fireAccountAdded(account.getUserID(), account);
		}

		/**
		 * Changes a user-account password. The result of the password-change attempt is returned
		 * via an [[AccountEvent.CHANGE_PASSWORD_RESULT]] event, which is dispatched both via the
		 * [[AccountManager]] and also via the [[UserAccount]] object for which the change was requested.
		 * If no such account is known, the event is dispatched via the [[AccountManager]] only.
		 * @param userID      The account's userID.
		 * @param newPassword The desired new account password.
		 * @param oldPassword The account's existing password. If no password is supplied, the
		 *                    password is changed only if the client requesting the change has
		 *                    sufficient privileges.
		 */
		changePassword(userID:string, newPassword:string, oldPassword?:string):void
		{
			if (!userID)
			{
				this.log.warn('[ACCOUNT_MANAGER] Change password failed. No userID supplied.');
			}
			else if (!newPassword)
			{
				this.log.warn(`[ACCOUNT_MANAGER] Change password failed for account [${userID}]. No new password supplied.`);
			}
			else
			{
				if (!oldPassword)
				{
					this.log.warn(`[ACCOUNT_MANAGER] Change account password for account [${userID}]: no old password supplied. Operation will fail unless sender is an administrator.`);
					oldPassword = '';
				}
				this.messageManager!.sendUPC(UPC.CHANGE_ACCOUNT_PASSWORD, userID, oldPassword, newPassword);
			}
		}

		/**
		 * @internal
		 */
		cleanup():void
		{
			this.log.info('[ACCOUNT_MANAGER] Cleaning resources.');
			this.removeAllObservedAccounts();
			this.removeAllWatchedAccounts();
			this.setIsWatchingForAccounts(false);
		}

		/**
		 * Creates a user account, which is used to store persistent user information such as an
		 * age, a travel booking, or a high score. The result of the account-creation attempt is
		 * returned via an [[AccountManagerEvent.CREATE_ACCOUNT_RESULT]] event. Once an account is
		 * created, a client can login to that account using [[AccountManager.login]] method.
		 */
		createAccount(userID:string, password:string):void
		{
			if (!userID)
			{
				this.log.warn('[ACCOUNT_MANAGER] Create account failed. No userID supplied.');
			}
			else if (!password)
			{
				this.log.warn('[ACCOUNT_MANAGER] Create account failed. No password supplied.');
			}
			else
			{
				this.messageManager!.sendUPC(UPC.CREATE_ACCOUNT, userID, password);
			}
		}

		/**
		 * @internal
		 * @param {string} ids
		 */
		deserializeWatchedAccounts(ids:string):void
		{
			const idList                     = ids.split(Tokens.RS),
			      idHash:UDictionary<number> = {},
			      len                        = idList.length;

			// Generate a hash of clientID keys to dummy values for quick lookup
			for (let i = len; --i >= 0;)
			{
				idHash[idList[i]] = 1;
			}

			// Remove all local accounts that are not in the new list from the server
			for (const accountID in this.watchedAccounts.getAll())
			{
				if (!idHash.hasOwnProperty(accountID))
				{
					this.removeWatchedAccount(accountID);
				}
			}

			// Add accounts from the new list that are not known locally. Do not add
			// clients for the accounts because "watch for accounts" does not
			// include client knowledge.
			if (ids != '')
			{  // Empty string means no accounts are on the server
				for (const accountID in idHash)
				{
					if (accountID != '' && idHash.hasOwnProperty(accountID))
					{
						if (!this.watchedAccounts.containsUserID(accountID))
						{
							this.addWatchedAccount(this.requestAccount(accountID)!);
						}
					}
					else
					{
						throw new Error('[CORE_MESSAGE_LISTENER] Received empty account id in user list (u127).');
					}
				}
			}

			this.fireSynchronize();
		}

		/**
		 * @internal
		 * @param {string} userID
		 * @param {net.user1.orbiter.UserAccount} account
		 */
		fireAccountRemoved(userID:string, account:UserAccount):void
		{
			this.dispatchEvent(new AccountManagerEvent(AccountManagerEvent.ACCOUNT_REMOVED, userID, account));
		}

		/**
		 * @internal
		 * @param {string} userID
		 * @param {string} role
		 * @param {net.user1.orbiter.Status} status
		 */
		fireAddRoleResult(userID:string, role:string, status:Status):void
		{
			const e = new AccountEvent(AccountEvent.ADD_ROLE_RESULT, status, userID, undefined, role);
			e.setAccount(this.getAccount(userID));
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 * @param {string} userID
		 */
		fireChangePassword(userID?:string):void
		{
			const e = new AccountEvent(AccountEvent.CHANGE_PASSWORD, Status.SUCCESS, userID);
			e.setAccount(this.getAccount(userID));
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 * @param {string} userID
		 * @param {net.user1.orbiter.Status} status
		 */
		fireChangePasswordResult(userID:string, status:Status):void
		{
			const e = new AccountEvent(AccountEvent.CHANGE_PASSWORD_RESULT, status, userID);
			e.setAccount(this.getAccount(userID));
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 * @param {string} userID
		 * @param {net.user1.orbiter.Status} status
		 */
		fireCreateAccountResult(userID:string, status:Status):void
		{
			const e = new AccountManagerEvent(AccountManagerEvent.CREATE_ACCOUNT_RESULT, userID, this.getAccount(userID) ?? undefined, status);
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 * @param {net.user1.orbiter.UserAccount} account
		 * @param {string} clientID
		 */
		fireLogin(account:UserAccount, clientID:string):void
		{
			const e = new AccountEvent(AccountEvent.LOGIN, Status.SUCCESS, account.getUserID(), clientID);
			e.setAccount(account);
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 * @param {string} userID
		 * @param {net.user1.orbiter.Status} status
		 */
		fireLoginResult(userID:string, status:Status):void
		{
			const e = new AccountEvent(AccountEvent.LOGIN_RESULT, status, userID);
			e.setAccount(this.getAccount(userID));
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 * @param {net.user1.orbiter.UserAccount} account
		 * @param {string} clientID
		 */
		fireLogoff(account:UserAccount, clientID:string):void
		{
			const e = new AccountEvent(AccountEvent.LOGOFF, Status.SUCCESS, account.getUserID(), clientID);
			e.setAccount(account);
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 * @param {string} userID
		 * @param {net.user1.orbiter.Status} status
		 */
		fireLogoffResult(userID:string, status:Status):void
		{
			const e = new AccountEvent(AccountEvent.LOGOFF_RESULT, status, userID);
			e.setAccount(this.getAccount(userID));
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 * @param {string} userID
		 */
		fireObserveAccount(userID:string):void
		{
			const e = new AccountEvent(AccountEvent.OBSERVE, undefined, userID);
			e.setAccount(this.getAccount(userID));
			this.dispatchEvent(e);
		}

		fireObserveAccountResult(userID:string, status:Status):void
		{
			const e = new AccountEvent(AccountEvent.OBSERVE_RESULT, status, userID);
			e.setAccount(this.getAccount(userID));
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 * @param {string} userID
		 * @param {net.user1.orbiter.Status} status
		 */
		fireRemoveAccountResult(userID:string, status:Status):void
		{
			const e = new AccountManagerEvent(AccountManagerEvent.REMOVE_ACCOUNT_RESULT, userID, this.getAccount(userID) ?? undefined, status);
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 * @param {string} userID
		 * @param {string} role
		 * @param {net.user1.orbiter.Status} status
		 */
		fireRemoveRoleResult(userID:string, role:string, status:Status):void
		{
			const e = new AccountEvent(AccountEvent.REMOVE_ROLE_RESULT, status, userID, undefined, role);
			e.setAccount(this.getAccount(userID));
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 * @param {string} userID
		 */
		fireStopObservingAccount(userID:string):void
		{
			const e = new AccountEvent(AccountEvent.STOP_OBSERVING, undefined, userID);
			e.setAccount(this.getAccount(userID));
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 * @param {string} userID
		 * @param {net.user1.orbiter.Status} status
		 */
		fireStopObservingAccountResult(userID:string, status:Status):void
		{
			const e = new AccountEvent(AccountEvent.STOP_OBSERVING_RESULT, status, userID);
			e.setAccount(this.getAccount(userID));
			this.dispatchEvent(e);
		}

		/**
		 * @internal
		 * @param {net.user1.orbiter.Status} status
		 */
		fireStopWatchingForAccountsResult(status:Status):void
		{
			this.dispatchEvent(new AccountManagerEvent(AccountManagerEvent.STOP_WATCHING_FOR_ACCOUNTS_RESULT, undefined, undefined, status));
		}

		/**
		 * @internal
		 */
		fireSynchronize():void
		{
			this.dispatchEvent(new AccountManagerEvent(AccountManagerEvent.SYNCHRONIZE));
		}

		/**
		 * @internal
		 * @param {string} status
		 */
		fireWatchForAccountsResult(status:string):void
		{
			this.dispatchEvent(new AccountManagerEvent(AccountManagerEvent.WATCH_FOR_ACCOUNTS_RESULT, undefined, undefined, status));
		}

		/**
		 * Returns a reference to the account with the specified userID, if the account is known to
		 * Orbiter. If the account is unknown, returns null.
		 * @param userID A user account's userID.
		 */
		getAccount(userID?:string):UserAccount|null
		{
			if (userID == null) return null;

			// Look in account cache
			let cached = this.accountCache.get(userID) as UserAccount;
			if (cached) return cached;

			// Look in observed accounts
			let account = this.observedAccounts.getByUserID(userID);
			if (account) return account;

			// Look in watched accounts
			account = this.watchedAccounts.getByUserID(userID);
			if (account) return account;

			// Look in connected accounts
			const clients = this.clientManager?.getInternalClients();
			for (const clientID in clients)
			{
				account = clients[clientID].getAccount();
				if (account?.getUserID() == userID)
				{
					return account;
				}
			}

			return null;
		}

		getAccounts():{[id:string]:UserAccount}
		{
			const connectedAccounts:{[id:string]:UserAccount} = {},
			      clients = this.clientManager?.getInternalClients();

			for (const clientID in clients)
			{
				const client  = clients[clientID],
				      account = client.getAccount();

				if (account)
				{
					connectedAccounts[account.getUserID()] = account;
				}
			}

			return {...connectedAccounts, ...this.observedAccounts.getAll(), ...this.watchedAccounts.getAll()};
		}

		getClientsForObservedAccounts():{[key:string]:Client}
		{
			const clients:{[key:string]:Client} = {},
			      accounts                      = this.observedAccounts.getAll();

			for (const userID in accounts)
			{
				const account = accounts[userID],
				      client  = account.getInternalClient();

				if (client)
				{
					clients[client.getClientID()] = client;
				}
			}

			return clients;
		}

		/**
		 * Returns the number of known user accounts. When the AccountManager is watching for user
		 * accounts (see [[watchForAccounts]]), [[getNumAccounts]] returns the actual number of user
		 * accounts registered on the server. When the AccountManager is __not__ watching for
		 * clients, getNumAccounts() returns only the number of accounts known to the current
		 * client. For example, if the current client is observing three accounts, and has no other
		 * awareness of accounts on the server, then getNumAccounts() will return 3, even though
		 * more than 3 accounts might be registered on the server.
		 * @return {number}
		 */
		getNumAccounts():number
		{
			//TODO looks like a bug - objects don't have length
			//return this.getAccounts().length;

			return net.user1.utils.ObjectUtil.len(this.getAccounts());
		}

		/**
		 * If the AccountManager is watching for accounts, [[getNumAccountsOnServer]]
		 * returns the number of accounts on the server; otherwise, [[getNumAccountsOnServer]]
		 * returns 0. When the AccountManager is watching for accounts, the
		 * getNumAccountsOnServer() method provides a faster alternative to
		 * getNumAccounts().
		 * @return {number}
		 */
		getNumAccountsOnServer():number
		{
			return this.watchedAccounts.length();
		}

		/**
		 * Returns the number of known, logged-in user accounts.
		 * @return {number}
		 */
		getNumLoggedInAccounts():number
		{
			let count = 0;
			const accounts = this.getAccounts();
			for (const userID in accounts)
			{
				const account = accounts[userID];
				if (account.isLoggedIn())
				{
					count++;
				}
			}
			return count;
		}

		/**
		 * Returns true if the account with the specified userID is in the watched account list;
		 * false otherwise.
		 * @param {string} userID
		 * @return {boolean}
		 */
		hasWatchedAccount(userID:string):boolean
		{
			return this.watchedAccounts.containsUserID(userID);
		}

		/**
		 * Returns true if the account with the specified userID is currently being observed;
		 * false otherwise.
		 * @param {string} userID
		 * @return {boolean}
		 */
		isObservingAccount(userID:string):boolean
		{
			return this.observedAccounts.containsUserID(userID);
		}

		/**
		 * Indicates whether the current client is currently watching for accounts.
		 * @return {boolean}
		 */
		isWatchingForAccounts():boolean
		{
			return this._isWatchingForAccounts;
		}

		/**
		 * Logs in the current client using the specified userID and password. The result of the
		 * login attempt is returned via an [[AccountEvent.LOGIN_RESULT]] event triggered by the
		 * AccountManager.
		 *
		 * If the attempt succeeds, the AccountManager and the [[UserAccount]] object for the current
		 * client trigger an [[AccountEvent.LOGIN]] event, and the account's persistent attributes are
		 * automatically loaded. If the specified userID is already logged in under another
		 * client ID, the previous client is logged off and disconnected before the new login
		 * proceeds.
		 *
		 * Room-scoped persistent account attributes are automatically loaded when the current
		 * client joins or observes rooms. If the current client is already in or observing a room
		 * when it logs in, the room-scoped attributes for that room are also loaded at login time.
		 *
		 * The login() method cannot be used to login foreign clients; it applies to the current
		 * client only.
		 *
		 * @param {string} userID
		 * @param {string} password
		 */
		login(userID:string, password:string):void
		{
			if (this.clientManager?.self()?.getConnectionState() == ConnectionState.LOGGED_IN)
			{
				this.log.warn(`[ACCOUNT_MANAGER] User [${userID}]: Login attempt ignored. Already logged in. Current client must logoff before logging in again.`);
				this.fireLoginResult(userID, Status.ERROR);
			}
			else if (!userID)
			{
				this.log.warn('[ACCOUNT_MANAGER] Login attempt failed. No userID supplied.');
			}
			else if (!password)
			{
				this.log.warn(`[ACCOUNT_MANAGER] Login attempt failed for user [${userID}] failed. No password supplied.`);
			}
			else
			{
				this.messageManager?.sendUPC(UPC.LOGIN, userID, password);
			}
		}

		/**
		 * Logs off a user account. The result of the logoff attempt is returned via an
		 * [[AccountEvent.LOGOFF_RESULT]] event, which is dispatched both via the AccountManager and
		 * also by the [[UserAccount]] object for the client being logged off. If no such user account
		 * is known, the event is dispatched via the AccountManager only.
		 *
		 * Unlike [[login]], the logoff() method __can__ be used with foreign clients. However,
		 * in order to logoff a foreign client, the client requesting the logoff must have
		 * sufficient privileges.
		 * @param {string | null} userID
		 * @param {string} password
		 */
		logoff(userID:string|null, password?:string):void
		{
			if (userID == null)
			{
				// Current client
				if (this.clientManager?.self()?.getConnectionState() != ConnectionState.LOGGED_IN)
				{
					this.log.warn('[ACCOUNT_MANAGER] Logoff failed. The current user is not logged in.');
				}
				else
				{
					this.clientManager?.self()?.getAccount()?.logoff();
				}
			}
			else if (userID == '')
			{
				this.log.warn('[ACCOUNT_MANAGER] Logoff failed. Supplied userID must not be the empty string.');
			}
			else
			{
				// UserID supplied
				if (!password)
				{
					if (this.clientManager?.self()?.getConnectionState() != ConnectionState.LOGGED_IN)
					{
						this.log.warn(`[ACCOUNT_MANAGER] Logoff: no password supplied. Operation will fail unless sender is an administrator.`);
					}
					password = '';
				}
				this.messageManager?.sendUPC(UPC.LOGOFF, userID, password);
			}
		}

		/**
		 * Asks the server to register the current client as an observer of the user account
		 * specified by userID. If the request succeeds, Orbiter creates a [[UserAccount]] object for
		 * the account (if one does not already exist) and dispatches an
		 * [[AccountEvent.OBSERVE_RESULT]] through that object and through the AccountManager. The
		 * UserAccount object is also synchronized with the server-side state of the account,
		 * causing the UserAccount to trigger an [[AccountEvent.SYNCHRONIZE]] event. Subsequently if
		 * the specified user account's state changes, the current client is notified in the
		 * following ways:
		 * - Observed account logs in: current client's AccountManager  and the UserAccount object
		 *   trigger the [[AccountEvent.LOGIN]] event
		 * - Observed account logs off: current client's AccountManager and the UserAccount object
		 *   trigger the [[AccountEvent.LOGOFF]] event
		 * - Observed account is deleted: current client's AccountManager triggers the
		 *   [[AccountManagerEvent.ACCOUNT_REMOVED event]]
		 *
		 * To stop observing a user account, use [[UserAccount.stopObserving]] method.
		 *
		 * Account observation is used when a client wishes to stay informed of the state of an
		 * arbitrary list of user accounts, as is required by applications with buddy-list systems
		 * or account administration features.
		 * @param userID The userID of the account to observe.
		 */
		observeAccount(userID:string):void
		{
			this.messageManager?.sendUPC(UPC.OBSERVE_ACCOUNT, userID);
		}

		/**
		 * Removes an existing user account. The result of the account-removal attempt is returned
		 * via an [[AccountManagerEvent.REMOVE_ACCOUNT_RESULT]] event. If a user account is removed
		 * while a client is logged in as that user, that client receives an [[AccountEvent.LOGOFF]]
		 * event and is then automatically disconnected by the server.
		 */
		removeAccount(userID:string, password:string):void
		{
			if (!userID)
			{
				this.log.warn('[ACCOUNT_MANAGER] Remove account failed. No userID supplied.');
			}
			else
			{
				if (password == null)
				{
					this.log.warn('[ACCOUNT_MANAGER] Remove account: no password supplied. Removal will fail unless sender is an administrator.');
				}
				this.messageManager?.sendUPC(UPC.REMOVE_ACCOUNT, userID, password);
			}
		}

		/**
		 * @internal
		 */
		removeAllObservedAccounts():void
		{
			this.observedAccounts.removeAll();
		}

		/**
		 * @internal
		 */
		removeAllWatchedAccounts():void
		{
			this.watchedAccounts.removeAll();
		}

		/**
		 * @internal
		 * @param {string} userID
		 * @return {net.user1.orbiter.UserAccount | null}
		 */
		removeObservedAccount(userID:string):UserAccount|null
		{
			const account = this.observedAccounts.removeByUserID(userID);
			this.fireStopObservingAccount(userID);
			return account ?? null;
		}

		/**
		 * Removes a security role from a user account. The result of the remove-role attempt is
		 * returned via an [[AccountEvent.REMOVE_ROLE_RESULT]] event, which is dispatched both via the
		 * AccountManager and also via the [[UserAccount]] object for which the role-removal was
		 * requested. If no such account is known, the event is dispatched via the AccountManager.
		 * @param userID The account's userID.
		 * @param role The desired new role.
		 */
		removeRole(userID:string, role:string):void
		{
			if (!userID)
			{
				this.log.warn('[ACCOUNT_MANAGER] Remove role failed. No userID supplied.');
			}
			else if (!role)
			{
				this.log.warn(`[ACCOUNT_MANAGER] Remove role failed for account [${userID}]. No role supplied.`);
			}
			else
			{
				this.messageManager?.sendUPC(UPC.REMOVE_ROLE, userID, role);
			}
		}

		/**
		 * @internal
		 * @param {string} userID
		 * @return {net.user1.orbiter.UserAccount | null}
		 */
		removeWatchedAccount(userID:string):UserAccount|null
		{
			return this.watchedAccounts.removeByUserID(userID) ?? null;
		}

		/**
		 * @internal
		 * @param {string} userID
		 * @return {net.user1.orbiter.UserAccount | null}
		 */
		requestAccount(userID:string):UserAccount|null
		{
			if (!userID) return null;

			let account = this.getAccount(userID);
			if (!account)
			{
				account = new UserAccount(userID, this.log, this, this.clientManager, this.roomManager);
				account.setAttributeManager(new AttributeManager(account, this.messageManager, this.log));
				this.accountCache.put(userID, account);
			}
			return account;
		}

		/**
		 * Returns a reference to the current client's user account, if the current client is
		 * logged in. If the current client is not logged in, returns null.
		 * @return {net.user1.orbiter.UserAccount | null}
		 */
		selfAccount():UserAccount|null
		{
			return this.clientManager?.self()?.getAccount() ?? null;
		}

		/**
		 * @internal
		 * @param {net.user1.orbiter.ClientManager} value
		 */
		setClientManager(value:ClientManager):void
		{
			this.clientManager = value;
		}

		/**
		 * @internal
		 * @param {boolean} value
		 */
		setIsWatchingForAccounts(value:boolean):void
		{
			this._isWatchingForAccounts = value;
		}

		/**
		 * @internal
		 * @param {net.user1.orbiter.MessageManager} value
		 */
		setMessageManager(value:MessageManager):void
		{
			this.messageManager = value;
		}

		/**
		 * @internal
		 * @param {net.user1.orbiter.RoomManager} value
		 */
		setRoomManager(value:RoomManager):void
		{
			this.roomManager = value;
		}

		/**
		 * @internal
		 * @param {string} userID
		 */
		stopObservingAccount(userID:string):void
		{
			this.messageManager?.sendUPC(UPC.STOP_OBSERVING_ACCOUNT, userID);
		}

		/**
		 * Asks the server to stop watching for accounts. In response, the server no longer sends
		 * notifications when an account is added or removed.
		 *
		 * The result of a stopWatchingForAccounts() request is returned via
		 * [[AccountManagerEvent.STOP_WATCHING_FOR_ACCOUNTS_RESULT]].
		 */
		stopWatchingForAccounts():void
		{
			this.messageManager?.sendUPC(UPC.STOP_WATCHING_FOR_ACCOUNTS_RESULT);
		}

		/**
		 * Asks the server to send a list of user accounts on the server, and then send
		 * notification any time a user account is created or removed. The notifications trigger
		 * either a [[AccountManagerEvent.ACCOUNT_ADDED]] event or an
		 * [[AccountManagerEvent.ACCOUNT_REMOVED]] event.
		 *
		 * The result of a watchForAccounts() request is returned via
		 * [[AccountManagerEvent.WATCH_FOR_ACCOUNTS_RESULT]].
		 *
		 * The watchForAccounts() method is used in administration applications that wish to
		 * display a synchronized list of all user accounts on the server.
		 */
		watchForAccounts():void
		{
			this.messageManager?.sendUPC(UPC.WATCH_FOR_ACCOUNTS);
		}

		private fireAccountAdded(userID:string, account:UserAccount):void
		{
			this.dispatchEvent(new AccountManagerEvent(AccountManagerEvent.ACCOUNT_ADDED, userID, account));
		}
	}
}

namespace net.user1.orbiter
{
	/**
	 * @internal
	 * An internal class used by AccountManager to manage the account list.
	 */
	export class AccountSet
	{
		private accounts:{[key:string]:UserAccount} = {};

		add(account:UserAccount):void
		{
			this.accounts[account.getUserID()] = account;
		}

		contains(account:UserAccount):boolean
		{
			return !!this.accounts[account.getUserID()];
		}

		containsUserID(userID:string):boolean
		{
			return userID ? !!this.getByUserID(userID) : false;
		}

		getAll():{[key:string]:UserAccount}
		{
			return this.accounts;
		}

		getByClient(client:Client):UserAccount|null
		{
			for (let userID in this.accounts)
			{
				const account = this.accounts[userID];
				if (account.getInternalClient() == client)
				{
					return account;
				}
			}
			return null;
		}

		getByUserID(userID:string):UserAccount|null
		{
			return this.accounts[userID] ?? null;
		}

		length():number
		{
			let count:number = 0;
			for (let userID in this.accounts)
			{
				if (this.accounts.hasOwnProperty(userID)) count++;
			}
			return count;
		}

		remove(account:UserAccount):UserAccount|null
		{
			const acc = this.accounts[account.getUserID()];
			delete this.accounts[acc.getUserID()];
			return acc ?? null;
		}

		removeAll():void
		{
			this.accounts = {};
		}

		removeByUserID(userID:string):UserAccount|null
		{
			const account = this.accounts[userID];
			delete this.accounts[userID];
			return account ?? null;
		}
	}
}

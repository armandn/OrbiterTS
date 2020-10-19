///<reference path="Snapshot.ts"/>
namespace net.user1.orbiter.snapshot
{
	/**
	 * The AccountListSnapshot class is used to load a list of userIDs for all user accounts on the
	 * server.
	 */
	export class AccountListSnapshot extends Snapshot
	{
		private accountList:string[]|null = null;

		constructor()
		{
			super();
			this.method = UPC.GET_ACCOUNTLIST_SNAPSHOT;
		}

		/**
		 * Returns an array of the string userIDs of the accounts on the server. To refresh the
		 * list, pass this AccountListSnapshot object to [[Orbiter.updateSnapshot]] method.
		 * @return {UserAccount[]}
		 */
		getAccountList():string[]|null
		{
			return this.accountList?.slice() ?? null;
		}

		/**
		 * @internal
		 * @param {string[]} value
		 */
		setAccountList(value:string[]):void
		{
			this.accountList = value;
		}
	}
}


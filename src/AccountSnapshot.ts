namespace net.user1.orbiter.snapshot
{
	/**
	 * The AccountSnapshot class is used to load a "snapshot" of a server-side user account. The
	 * snapshot includes all persistent attributes stored in the user account, including room
	 * attributes and global attributes.
	 */
	export class AccountSnapshot extends Snapshot
	{
		private manifest?:ClientManifest;

		constructor(userID:string)
		{
			super();
			this.method = UPC.GET_ACCOUNT_SNAPSHOT;
			this.args = [userID];
			this.hasStatus = true;
		}

		/**
		 * Returns the value of the specified account attribute.
		 * @param {string} name The attribute's name.
		 * @param {string} scope The attribute's scope. For global account attributes, specify
		 *                       scope null. For attributes scoped to a room, specify the
		 *                       room's id.
		 * @return {string | null}
		 */
		getAttribute(name:string, scope:string):string|null
		{
			return this.manifest?.persistentAttributes.getAttribute(name, scope) ?? null;
		}

		/**
		 * Returns an object whose variables represent the names and values of the shared
		 * attributes for this snapshot's account. The object is a map of fully qualified attribute
		 * name/value pairs. For details and examples, see [[Client.getAttributes]]
		 * method, which returns an object of the same format.
		 * @return {{[p:string]:string | undefined} | null}
		 */
		getAttributes():{[name:string]:string|undefined}|null
		{
			return this.manifest?.persistentAttributes.getAll() ?? null;
		}

		/**
		 * Returns the userID for this user account snapshot object.
		 * @return {string | null}
		 */
		getUserID():string|null
		{
			return this.manifest?.userID ?? null;
		}

		private setManifest(value:ClientManifest):void
		{
			this.manifest = value;
		}
	}
}

namespace net.user1.orbiter.snapshot
{
	/**
	 * The ClientSnapshot class is used to load a "snapshot" of a client on the server. The snapshot
	 * includes all of the client's attributes, a list of the rooms the client is in, and a list of
	 * rooms the client is observing. If the client is currently logged in under a user account, the
	 * snapshot also includes the userID for that account.
	 */
	export class ClientSnapshot extends Snapshot
	{
		private manifest?:ClientManifest;

		constructor(clientID:string)
		{
			super();

			this.method = net.user1.orbiter.UPC.GET_CLIENT_SNAPSHOT;
			this.args = [clientID];
			this.hasStatus = true;
		}

		/**
		 * Returns the value of the specified client attribute.
		 *
		 * @param name The attribute's name.
		 * @param scope The attribute's scope. For global client attributes, specify scope
		 *              null. For attributes scoped to a room, specify the room's id.
		 *
		 * @return The attribute value.
		 */
		getAttribute(name:string, scope:string):string|null
		{
			return this.manifest?.transientAttributes.getAttribute(name, scope) ?? null;
		}

		/**
		 * Returns an object whose variables represent the names and values of the
		 * shared attributes for this snapshot's client. The object is a map of fully
		 * qualified attribute name/value pairs. For details and examples, see the
		 * [[Client.getAttributes]] method, which returns an object of the
		 * same format.
		 */
		getAttributes():{[name:string]:string|undefined}|null
		{
			return this.manifest?.transientAttributes.getAll() ?? null;
		}

		/**
		 * Returns the clientID for this client snapshot object.
		 *
		 * @return A string clientID.
		 */
		getClientID():string|null
		{
			return this.manifest?.clientID ?? null;
		}

		/**
		 * Returns a list of the rooms observed by the client represented by this
		 * snapshot. Each item in the list a fully qualified string roomID.
		 */
		getObservedRoomIDs():string[]|null
		{
			return this.manifest?.observedRoomIDs?.slice() ?? null;
		}

		/**
		 * Returns a list of the rooms containing the client represented by this
		 * snapshot. Each item in the list a fully qualified string roomID.
		 */
		getOccupiedRoomIDs():string[]|null
		{
			return this.manifest?.occupiedRoomIDs?.slice() ?? null;
		}

		/**
		 * If the client represented by this snapshot object is logged in under
		 * a user account, getUserID() returns that account; otherwise, getUserID()
		 * returns null.
		 *
		 * @return A string userID.
		 */
		getUserID():string|null
		{
			return this.manifest?.userID ?? null;
		}

		/**
		 * @internal
		 */
		setManifest(value:ClientManifest):void
		{
			this.manifest = value;
		}

	}
}

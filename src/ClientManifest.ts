namespace net.user1.orbiter
{
	/**
	 * @internal
	 * A ClientManifest is a data object containing information about a client on the server,
	 * including attributes, a list of the rooms the client is in, and a list of rooms the client is
	 * observing. ClientManifest objects are used by the RoomSnapshot class to represent the clients
	 * in its occupant and observer lists.
	 */
	export class ClientManifest
	{
		public observedRoomIDs?:string[];
		public occupiedRoomIDs?:string[];

		/**
		 * An AttributeCollection containing the persistent attributes stored by this client's user
		 * account. Applies to client manifests representing clients that are logged into a user
		 * account only.
		 */
		public persistentAttributes = new AttributeCollection();

		/**
		 * An AttributeCollection containing this client's transient attributes
		 * (i.e., the attributes that are not saved in a user account persistently).
		 */
		public transientAttributes = new AttributeCollection();

		public userID?:string;

		public clientID?:string;

		/**
		 * @internal
		 */
		deserialize(clientID:string, userID:string, serializedOccupiedRoomIDs:string='', serializedObservedRoomIDs:string='', globalAttrs:string, roomAttrs:string[]):void
		{
			this.clientID = clientID == '' ? undefined : clientID;
			this.userID   = userID   == '' ? undefined : userID;

			// Room ids
			this.deserializeOccupiedRoomIDs(serializedOccupiedRoomIDs);
			this.deserializeObservedRoomIDs(serializedObservedRoomIDs);

			// Global attrs
			this.deserializeAttributesByScope(net.user1.orbiter.Tokens.GLOBAL_ATTR, globalAttrs);

			// Room attrs
			for (let i = 0; i < roomAttrs.length; i += 2)
			{
				this.deserializeAttributesByScope(roomAttrs[i], roomAttrs[i + 1]);
			}
		}

		private deserializeAttributesByScope(scope:string, serializedAttributes:string):void
		{
			if (!serializedAttributes) return;

			const attrList = serializedAttributes.split(net.user1.orbiter.Tokens.RS);

			for (let i = attrList.length - 3; i >= 0; i -= 3)
			{
				if (parseInt(attrList[i + 2]) & AttributeOptions.FLAG_PERSISTENT)
				{
					// Persistent
					this.persistentAttributes.setAttribute(attrList[i], attrList[i + 1], scope);
				}
				else
				{
					// Non-persistent
					this.transientAttributes.setAttribute(attrList[i], attrList[i + 1], scope);
				}
			}
		}

		private deserializeObservedRoomIDs(roomIDs:string):void
		{
			if (!roomIDs) return;

			if (roomIDs == '')
			{
				this.observedRoomIDs = [];
				return;
			}

			this.observedRoomIDs = roomIDs.split(net.user1.orbiter.Tokens.RS);
		}

		private deserializeOccupiedRoomIDs(roomIDs:string):void
		{
			// No rooms included in the manifest
			if (!roomIDs) return;

			// Client is in no rooms
			if (roomIDs == '')
			{
				this.occupiedRoomIDs = [];
				return;
			}

			// Client is in one or more room
			this.occupiedRoomIDs = roomIDs.split(net.user1.orbiter.Tokens.RS);
		}
	}
}

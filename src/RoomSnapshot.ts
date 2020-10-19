namespace net.user1.orbiter.snapshot
{
	/**
	 * The RoomSnapshot class is used to load a "snapshot" of a room on the server. The snapshot 
	 * includes all of the room's attributes, plus a list of the clients in the room and a list of 
	 * the clients observing room.
	 * 
	 * The RoomSnapshot object is not kept up to date after it is loaded. To update a RoomSnapshot 
	 * object to match latest the state of the server, pass that object to
	 * [[Orbiter.updateSnapshot]] method.
	 */
	export class RoomSnapshot extends snapshot.Snapshot
	{
		private manifest?:RoomManifest;

		/**
		 * Constructor
		 * @param roomID The fully qualified roomID for this snapshot.
		 * @param password The room's password, if required.
		 * @param updateLevels Indicates the amount of information that should be included
		 */
		constructor(roomID:string, password?:string, updateLevels?:UpdateLevels)
		{
			super();

			this.method = UPC.GET_ROOM_SNAPSHOT;
			this.args   = [roomID, password, updateLevels != null ? updateLevels.toInt() : ''];
			this.hasStatus = true;
		}

		/**
		 * @internal
		 */
		setManifest(value:RoomManifest):void
		{
			this.manifest = value;
		}

		/**
		 * Returns the value of the specified room attribute.
		 * @param name The attribute's name.
		 * @return The attribute value.
		 */
		getAttribute(name:string):string|null
		{
			return this.manifest?.attributes?.getAttribute(name, Tokens.GLOBAL_ATTR) ?? null;
		}

		/**
		 * Returns an object whose variables represent the names and values of the shared attributes
		 * for this snapshot's room. For details and examples, see the Room class's getAttributes()
		 * method, which returns an object of the same format.
		 */
		getAttributes():{[scope:string]:{[name:string]:string|undefined}}|{[name:string]:string|undefined}|null
		{
			return this.manifest?.attributes?.getByScope(Tokens.GLOBAL_ATTR) ?? null;
		}

		/**
		 * Returns the fully qualified roomID for this room snapshot object.
		 * @return A string roomID.
		 */
		getRoomID():string|null
		{
			return this.manifest?.roomID ?? null;
		}

		/**
		 * Returns a list of the clients in the room represented by this snapshot. Each item in the
		 * list is a string clientID.
		 */
		getOccupants():ClientManifest[]
		{
			return this.manifest?.occupants.slice() ?? [];
		}

		/**
		 * Returns a list of the clients observing the room represented by this snapshot. Each item
		 * in the list is a string clientID.
		 */
		getObservers():ClientManifest[]
		{
			return this.manifest?.observers.slice() ?? [];
		}

		/**
		 * Returns a ClientManifest object representing the room occupant specified by clientID.
		 */
		getOccupant(clientID:string):ClientManifest|null
		{
			if (!this.manifest) return null;
			
			for (let i = this.manifest.occupants.length; --i >= 0;)
			{
				if (this.manifest.occupants[i].clientID == clientID)
				{
					return this.manifest.occupants[i];
				}
			}
			return null;
		}

		/**
		 * Returns a ClientManifest object representing the room observer specified by clientID.
		 */
		getObserver(clientID:string):ClientManifest|null
		{
			if (!this.manifest) return null;

			for (let i = this.manifest.observers.length; --i >= 0;)
			{
				if (this.manifest.observers[i].clientID == clientID)
				{
					return this.manifest.observers[i];
				}
			}
			return null;
		}

		/**
		 * Returns the number of occupants in the room represented by this snapshot.
		 */
		getNumOccupants():number
		{
			return this.manifest ? Math.max(this.manifest.occupants.length, this.manifest.occupantCount) : 0;
		}

		/**
		 * Returns the number of observers in the room represented by this snapshot.
		 */
		getNumObservers():number
		{
			return this.manifest ? Math.max(this.manifest.observers.length, this.manifest.observerCount) : 0;
		}
	}
}

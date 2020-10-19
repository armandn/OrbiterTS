namespace net.user1.orbiter
{
	/**
	 * @internal
	 * An internal class used by RoomManager to manage a list of rooms.
	 */
	export class RoomList extends net.user1.events.EventDispatcher
	{
		private readonly rooms:Room[] = [];

		constructor()
		{
			super();
		}

		add(room:Room):Room|null
		{
			if (!this.contains(room))
			{
				this.rooms.push(room);
				this.dispatchAddItem(room);
				return room;
			}
			else
			{
				return null;
			}
		};

		contains(room:Room):boolean
		{
			return this.rooms.indexOf(room) != -1;
		}

		containsRoomID(roomID?:string):boolean
		{
			if (!roomID)
			{
				return false;
			}

			return !!this.getByRoomID(roomID);
		}

		dispatchAddItem(item:Room):void
		{
			this.dispatchEvent(new CollectionEvent(CollectionEvent.ADD_ITEM, item));
		}

		dispatchRemoveItem(item:Room):void
		{
			this.dispatchEvent(new CollectionEvent(CollectionEvent.REMOVE_ITEM, item));
		}

		getAll():Room[]
		{
			return this.rooms.slice(0);
		}

		getByRoomID(roomID:string):Room|null
		{
			for (let i = this.rooms.length; --i >= 0;)
			{
				const room = this.rooms[i];
				if (room.getRoomID() == roomID)
				{
					return room;
				}
			}
			return null;
		}

		length():number
		{
			return this.rooms.length;
		}

		remove(room:Room):Room|null
		{
			const index = this.rooms.indexOf(room);
			if (index != -1)
			{
				room = this.rooms.splice(index, 1)[0];
				this.dispatchRemoveItem(room);
				return room;
			}
			else
			{
				return null;
			}
		}

		removeAll():void
		{
			for (let i = this.rooms.length; --i >= 0;)
			{
				const room = this.rooms.splice(i, 1)[0];
				this.dispatchRemoveItem(room);
			}
		}

		removeByRoomID(roomID:string):Room|null
		{
			for (let i = this.rooms.length; --i >= 0;)
			{
				if (this.rooms[i].getRoomID() == roomID)
				{
					const room = this.rooms.splice(i, 1)[0];
					this.dispatchRemoveItem(room);
					return room;
				}
			}
			return null;
		}
	}
}

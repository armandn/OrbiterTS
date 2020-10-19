namespace net.user1.orbiter
{
	/**
	 * @internal
	 */
	export class RoomManifest
	{
		public attributes?:AttributeCollection;
		public observerCount:number       = 0;
		public observers:ClientManifest[] = [];
		public occupantCount:number       = 0;
		public occupants:ClientManifest[] = [];
		public roomID?:string;

		deserialize(roomID:string, serializedAttributes:string, clientList:string[], occupantCount:number, observerCount:number):void
		{
			this.attributes    = undefined;
			this.observerCount = observerCount;
			this.observers     = [];
			this.occupantCount = occupantCount;
			this.occupants     = [];
			this.roomID        = roomID;

			this.deserializeAttributes(serializedAttributes);
			this.deserializeClientList(clientList);
		}

		private deserializeAttributes(serializedAttributes:string):void
		{
			const attrList = serializedAttributes.split(Tokens.RS);
			this.attributes = new AttributeCollection();

			for (let i = attrList.length - 2; i >= 0; i -= 2)
			{
				this.attributes.setAttribute(attrList[i], attrList[i + 1], Tokens.GLOBAL_ATTR);
			}
		}

		private deserializeClientList(clientList:string[]):void
		{
			for (let i = clientList.length - 5; i >= 0; i -= 5)
			{
				const clientManifest = new ClientManifest();
				clientManifest.deserialize(clientList[i], clientList[i + 1], undefined, undefined, clientList[i + 3], [this.roomID!, clientList[i + 4]]);

				if (clientList[i + 2] == '0')
				{
					this.occupants.push(clientManifest);
				}
				else
				{
					this.observers.push(clientManifest);
				}
			}
		}
	}
}

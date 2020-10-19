namespace net.user1.orbiter
{
	/**
	 * @internal
	 */
	export class ClientSet
	{
		private clients:UDictionary<Client> = {};

		constructor()
		{
		}

		add(client:Client):void
		{
			this.clients[client.getClientID()] = client;
		}

		contains(client:Client):boolean
		{
			return !!this.clients[client.getClientID()];
		}

		containsClientID(clientID:string):boolean
		{
			return clientID ? !!this.getByClientID(clientID) : false;
		}

		getAll():UDictionary<Client>
		{
			return this.clients;
		}

		getAllIDs():string[]
		{
			const ids = [];
			for (let clientID in this.clients)
			{
				if (this.clients.hasOwnProperty(clientID))
					ids.push(clientID);
			}
			return ids;
		}

		getByClientID(clientID:string):Client|null
		{
			return this.clients[clientID];
		}

		getByUserID(userID:string):Client|null
		{
			for (let clientID in this.clients)
			{
				if (!this.clients.hasOwnProperty(clientID))
					continue;

				const client = this.clients[clientID];
				const account = client.getAccount();
				if (account?.getUserID() == userID)
				{
					return client;
				}
			}
			return null;
		}

		length():number
		{
			return net.user1.utils.ObjectUtil.len(this.clients);
		}

		remove(client:Client):Client
		{
			const c = this.clients[client.getClientID()];
			delete this.clients[c.getClientID()];
			return client;
		}

		removeAll():void
		{
			this.clients = {};
		}

		removeByClientID(clientID:string):Client
		{
			const client = this.clients[clientID];
			delete this.clients[clientID];
			return client;
		}
	}
}

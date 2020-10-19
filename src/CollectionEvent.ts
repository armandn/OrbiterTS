namespace net.user1.orbiter
{
	/**
	 * @internal
	 */
	export class CollectionEvent extends net.user1.events.Event
	{
		static readonly ADD_ITEM = 'ADD_ITEM';
		static readonly REMOVE_ITEM = 'REMOVE_ITEM';

		constructor(type:string, private item:any)
		{
			super(type);
		}

		getItem():any
		{
			return this.item;
		}

		toString():string
		{
			return '[object CollectionEvent]';
		}
	}
}

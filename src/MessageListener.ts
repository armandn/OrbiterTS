namespace net.user1.orbiter
{
	/**
	 * @internal
	 */
	export class MessageListener
	{
		constructor(private readonly listener:Function,
		            private readonly forRoomIDs?:string[],
		            private readonly thisArg?:any)
		{
		}

		getForRoomIDs():string[]|null
		{
			return this.forRoomIDs ?? null;
		}

		getListenerFunction():Function
		{
			return this.listener;
		}

		getThisArg():any
		{
			return this.thisArg;
		}

		toString():string
		{
			return '[object MessageListener]';
		}
	}
}

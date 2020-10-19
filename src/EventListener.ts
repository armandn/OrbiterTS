namespace net.user1.events
{
	/**
	 * @internal
	 */
	export class EventListener
	{
		constructor(private readonly listener:Function,
		            private readonly thisArg:any,
		            private readonly priority:number)
		{
		}

		getListenerFunction():Function
		{
			return this.listener;
		}

		getPriority():number
		{
			return this.priority;
		}

		getThisArg():any
		{
			return this.thisArg;
		}

		toString():string
		{
			return '[object EventListener]';
		}
	}
}

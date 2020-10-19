namespace net.user1.events
{
	/**
	 * @internal
	 */
	export class Event
	{
		public target?:EventDispatcher;
		public type:string;

		constructor(type:string)
		{
			if (type)
			{
				this.type = type;
			}
			else
			{
				throw new Error(`Event creation failed. No type specified. Event: ${this}`);
			}
		}

		toString():string
		{
			return '[object Event]';
		}
	}
}

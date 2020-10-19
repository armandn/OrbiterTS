namespace net.user1.events
{
	/**
	 * @internal
	 */
	export class EventDispatcher
	{
		readonly target:EventDispatcher;
		private readonly listeners:{[key:string]:EventListener[]} = {};

		constructor(target?:EventDispatcher)
		{
			this.target = target ?? this;
		}

		addEventListener(type:string, listener:Function, thisArg:any, priority:number = 0):boolean
		{
			if (typeof this.listeners[type] === 'undefined') this.listeners[type] = [];

			const listenerArray:EventListener[] = this.listeners[type];

			if (this.hasListener(type, listener, thisArg)) return false;

			const newListener = new EventListener(listener, thisArg, priority);
			let added = false;

			for (let i = listenerArray.length; --i >= 0;)
			{
				const thisListener = listenerArray[i];
				if (priority <= thisListener.getPriority())
				{
					listenerArray.splice(i + 1, 0, newListener);
					added = true;
					break;
				}
			}
			if (!added)
			{
				listenerArray.unshift(newListener);
			}
			return true;
		}

		dispatchEvent(event:net.user1.events.Event):void
		{
			const listenerArray = this.listeners[event.type];
			if (typeof listenerArray === 'undefined')
			{
				return;
			}

			if (typeof event.type === 'undefined')
			{
				throw new Error(`Event dispatch failed. No event name specified by ${event}`);
			}

			event.target = this.target;

			for (let i = 0, numListeners = listenerArray.length; i < numListeners; i++)
			{
				listenerArray[i].getListenerFunction().apply(listenerArray[i].getThisArg(), [event]);
			}
		}

		getListeners(type:string):EventListener[]
		{
			return this.listeners[type];
		}

		hasListener(type:string, listener:Function, thisArg:any):boolean
		{
			const listenerArray = this.listeners[type];
			if (typeof listenerArray === 'undefined')
			{
				return false;
			}

			for (let i = 0; i < listenerArray.length; i++)
			{
				if (listenerArray[i].getListenerFunction() === listener &&
				    listenerArray[i].getThisArg() === thisArg)
				{
					return true;
				}
			}
			return false;
		}

		removeEventListener(type:string, listener:Function, thisArg:any):boolean
		{
			const listenerArray = this.listeners[type];
			if (typeof listenerArray == 'undefined')
			{
				return false;
			}

			let foundListener = false;
			for (let i = 0; i < listenerArray.length; i++)
			{
				if (listenerArray[i].getListenerFunction() === listener &&
				    listenerArray[i].getThisArg() === thisArg)
				{
					foundListener = true;
					listenerArray.splice(i, 1);
					break;
				}
			}

			if (listenerArray.length == 0)
			{
				delete this.listeners[type];
			}

			return foundListener;
		}
	}

}

namespace net.user1.utils
{
	/**
	 * @internal
	 */
	export class MemoryStore
	{
		private data:{[record:string]:{[field:string]:string}} = {};

		constructor()
		{
			this.clear();
		}

		clear():void
		{
			this.data = {};
		}

		read(record:string, field:string):string|null
		{
			return this.data?.[record]?.[field] ?? null;
		}

		remove(record:string, field:string):void
		{
			delete this.data[record][field];
		}

		write(record:string, field:string, value:string):void
		{
			if (typeof this.data[record] === 'undefined')
			{
				this.data[record] = {};
			}
			this.data[record][field] = value;
		}
	}

}

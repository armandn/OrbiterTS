namespace net.user1.utils
{
	/**
	 * @internal
	 */
	export class LocalStorage
	{
		private data:MemoryStore;

		constructor()
		{
			this.data = new MemoryStore();
		}

		getItem(key:string):string|null
		{
			return this.data.read('localStorage', key);
		}

		removeItem(key:string):void
		{
			this.data.remove('localStorage', key);
		}

		setItem(key:string, value:string):void
		{
			this.data.write('localStorage', key, value);
		}
	}

}

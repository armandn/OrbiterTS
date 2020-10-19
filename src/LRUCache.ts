namespace net.user1.utils
{
	/**
	 * @internal
	 */
	export class LRUCache<T>
	{
		private first?:CacheNode<T>;
		private hash:UDictionary<CacheNode<T>> = {};
		private last?:CacheNode<T>;
		private length:number = 0;

		constructor(private maxLength:number)
		{
		}

		clear():void
		{
			this.first  = undefined;
			this.last   = undefined;
			this.length = 0;
			this.hash   = {};
		}

		get(key:string):T|null
		{
			const node:CacheNode<T> = this.hash[key];

			if (!node) return null;

			this.moveToHead(node);
			return node.value ?? null;
		}

		put(key:string, value:T):void
		{
			let node:CacheNode<T> = this.hash[key];
			if (!node)
			{
				if (this.length >= this.maxLength)
				{
					this.removeLast();
				}
				else
				{
					this.length++;
				}

				node = new CacheNode();
			}

			node.value = value;
			node.key = key;
			this.moveToHead(node);
			this.hash[key] = node;
		}

		remove(key:string):CacheNode<T>|null
		{
			const node:CacheNode<T> = this.hash[key];
			if (node)
			{
				if (node.prev)
					node.prev.next = node.next;

				if (node.next)
					node.next.prev = node.prev;

				if (this.last == node)
					this.last = node.prev;

				if (this.first == node)
					this.first = node.next;
			}
			return node;
		}

		private moveToHead(node:CacheNode<T>):void
		{
			if (node == this.first)
				return;

			if (node.prev)
				node.prev.next = node.next;

			if (node.next)
				node.next.prev = node.prev;

			if (this.last == node)
				this.last = node.prev;

			if (this.first)
			{
				node.next = this.first;
				this.first.prev = node;
			}

			this.first = node;
			node.prev = undefined;

			if (!this.last)
				this.last = this.first;
		}

		private removeLast():void
		{
			if (!this.last)
				return;

			if (this.last.key)
				delete this.hash[this.last.key];

			if (this.last.prev)
				this.last.prev.next = undefined;
			else
				this.first = undefined;

			this.last = this.last.prev;
		}
	}
}

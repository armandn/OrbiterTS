namespace net.user1.utils
{
	/**
	 * @internal
	 */
	export class ArrayUtil
	{
		//TODO remove this, it's used only once in ConnectionManager
		/**
		 * Remove element from array.
		 * @param {Array<T>} array
		 * @param {T} item
		 * @return {boolean}
		 */
		static remove<T>(array:Array<T>, item?:T):boolean
		{
			if (item == undefined)
			{
				return false;
			}
			else
			{
				const itemIndex:number = array.indexOf(item);
				if (itemIndex == -1)
				{
					return false;
				}
				else
				{
					array.splice(itemIndex, 1);
					return true;
				}
			}
		}
	}
}

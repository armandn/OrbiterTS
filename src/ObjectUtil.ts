namespace net.user1.utils
{
	export class ObjectUtil
	{
		/**
		 * Combines multiple objects into a new object, such that the new object contains all
		 * dynamic keys present in all the specified objects.
		 *
		 * @param objects A list of objects to combine. If an array of objects is provided as the
		 *                only argument, that array's elements are combined into a new object.
		 */
		static combine<T>(...objects:{[key:string]:T}[]):{[key:string]:T}
		{
			const source:Object[] = objects.length == 1 ? objects[0] as unknown as T[] : objects;
			const master:{[key:string]:T} = {};

			for (let i = 0; i < source.length; i++)
			{
				const object = source[i];
				for (let key in object)
				{
					if (object.hasOwnProperty(key))
					{
						// @ts-ignore
						master[key] = object[key];
					}
				}
			}
			return master;
		}

		static len(object:any):number
		{
			let len = 0;
			for (let p in object)
			{
				if (object.hasOwnProperty(p))
					len++;
			}
			return len;
		}
	}
}

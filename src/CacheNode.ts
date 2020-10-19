namespace net.user1.utils
{
	//TODO this can be a type

	/**
	 * @internal
	 */
	export class CacheNode<T>
	{
		next?:CacheNode<T>;
		prev?:CacheNode<T>;
		key?:string;
		value?:T;
	}
}

namespace net.user1.utils
{
	/**
	 * The LocalData class stores data locally on the end-user's hard drive.
	 *
	 * The services of LocalData are accessed entirely through class (static) methods; the class
	 * cannot be instantiated.
	 *
	 * To store a value on disk, use the [[write]] method, specifying the record for the value
	 * (i.e., the general namespace), the field for the value (i.e., a specific identifier), and the
	 * value itself.
	 *
	 * To load a previously saved value from disk, use the [[read]] method, specifying the desired
	 * value's record and field.
	 */
	export class LocalData
	{
		private data = (typeof localStorage == 'undefined') ? new LocalStorage() : localStorage;

		read(record:string, field:string):string|null
		{
			return this.data.getItem(record + field) ?? null;
		}

		remove(record:string, field:string):void
		{
			const value = this.data.getItem(record + field);
			value && this.data.removeItem(record + field);
		}

		write(record:string, field:string, value:string):void
		{
			this.data.setItem(record + field, value);
		}
	}
}

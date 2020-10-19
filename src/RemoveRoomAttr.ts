namespace net.user1.orbiter.upc
{
	/**
	 * @internal
	 */
	export class RemoveRoomAttr
	{
		public method:string;
		public args:string[];

		constructor(roomID:string, name:string)
		{
			if (!Validator.isValidAttributeName(name))
			{
				throw new Error(`Cannot delete attribute. Illegal name (see Validator.isValidAttributeName()): ${name}`);
			}
			this.method = UPC.REMOVE_ROOM_ATTR;
			this.args = [roomID, name];
		}
	}
}

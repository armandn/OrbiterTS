namespace net.user1.orbiter.upc
{
	/**
	 * @internal
	 */
	export class SetRoomAttr extends SetAttr
	{
		method:string;
		args:string[];

		constructor(name:string, value:string, options:number, roomID:string)
		{
			super(name, value, options);
			this.method = UPC.SET_ROOM_ATTR;
			this.args   = [roomID, name, value, options.toString()];
		}
	}
}

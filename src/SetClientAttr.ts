namespace net.user1.orbiter.upc
{
	/**
	 * @internal
	 */
	export class SetClientAttr extends SetAttr
	{
		public method:string;
		public args:(string|undefined)[];

		constructor(name:string, value:string, options:number, scope:string=Tokens.GLOBAL_ATTR, clientID?:string, userID?:string)
		{
			super(name, value, options);

			if (!net.user1.orbiter.Validator.isValidAttributeScope(scope))
			{
				throw new Error(`Cannot set client attribute. Illegal scope (see Validator.isValidAttributeScope()).  Illegal attribute is: ${name}=${value}`);
			}

			this.method = UPC.SET_CLIENT_ATTR;
			this.args   = [clientID, userID, name, value, scope, options.toString()];

		}
	}
}

namespace net.user1.orbiter.upc
{
	/**
	 * @internal
	 */
	export class SetAttr
	{
		constructor(protected readonly name:string,
		            protected readonly value:string='',
		            protected readonly options:number)
		{
			// Abort if name is invalid.
			if (!Validator.isValidAttributeName(name))
			{
				throw new Error(`Cannot set attribute. Illegal name (see Validator.isValidAttributeName()).  Illegal attribute is: ${name}=${value}`);
			}

			// Abort if value is invalid.
			if (!Validator.isValidAttributeValue(value))
			{
				throw new Error(`Cannot set attribute. Illegal value (see Validator.isValidAttributeValue()).  Illegal attribute is: ${name}=${value}`);
			}
		}
	}

}

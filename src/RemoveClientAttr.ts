///<reference path="UPC.ts"/>
namespace net.user1.orbiter.upc
{
	/**
	 * @internal
	 */
	export class RemoveClientAttr extends UPC
	{
		constructor(clientID?:string, userID?:string, name?:string, scope?:string)
		{
			super();

			// Abort if name is invalid.
			if (!Validator.isValidAttributeName(name))
			{
				throw new Error(`Cannot delete attribute. Illegal name (see Validator.isValidAttributeName()): ${name}`);
			}

			// Abort if scope is invalid.
			if (!Validator.isValidAttributeScope(scope))
			{
				throw new Error(`Cannot delete client attribute. Illegal scope (see Validator.isValidAttributeScope()): ${scope}`);
			}

			this.method = orbiter.UPC.REMOVE_CLIENT_ATTR;
			this.args = [clientID, userID, name, scope];
		}
	}
}

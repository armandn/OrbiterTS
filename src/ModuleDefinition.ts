namespace net.user1.orbiter
{
	/**
	 * A simple data class representing the definition of a server-side module.
	 * ModuleDefinition instances are used to report information about modules
	 * provided by the [[ModuleListSnapshot]] class.
	 */
	export class ModuleDefinition
	{
		constructor(private id:string, private type:string, private source:string)
		{
		}
	}
}

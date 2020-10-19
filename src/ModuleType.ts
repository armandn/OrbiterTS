namespace net.user1.orbiter
{
	/**
	 * ModuleType is an enumeration of constant values representing different module types for a
	 * server-side module.
	 *
	 * When a room is created with [[RoomManager.createRoom]] method, its modules can be specified
	 * via the modules parameter. The ModuleType class enumerates the types of those modules. When a
	 * list of modules is loaded via a ModuleListSnapshot object, each module's type is specified in
	 * the list of ModuleDefinition objects.
	 */
	export enum ModuleType
	{
		CLASS = 'class',
		SCRIPT = 'script'
	}
}

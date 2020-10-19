namespace net.user1.orbiter
{
	/**
	 * A simple data container indicating the locations and names of a set of server-side room
	 * modules. The RoomModules class is used to specify the room modules that should be attached to
	 * a server-side room at creation time.
	 *
	 * On the server, each room is represented by a Java Room object with zero or more registered
	 * room modules. The Room object manages a client list and broadcasts basic room events. The
	 * room modules are expected to respond to those events and provide the application behaviour
	 * for the room.
	 *
	 * To add new functionality to a room (above and beyond the functionality provided by the
	 * server), a server-side developer creates a new room module as a class or a script, and
	 * registers that module to receive the room's events.
	 */
	export class RoomModules
	{
		private modules:string[][] = [];

		/**
		 * Adds a new room module to the list of room modules.
		 *
		 * @param identifier The module identifier. For example, "com.domain.WhiteBoardModule"
		 * @param type The module type.Must be one of the constants defined by the ModuleType class.
		 */
		addModule(identifier:string, type:string):void
		{
			this.modules.push([type, identifier]);
		}

		/**
		 * Returns a string representing of the room modules, suitable for sending to the server via
		 * the u24 UPC. This method is used internally.
		 * @return {string}
		 */
		serialize():string
		{
			let modulesString:string = '';
			for (let i = 0, numModules = this.modules.length; i < numModules; i++)
			{
				modulesString += this.modules[i][0] + Tokens.RS + this.modules[i][1];
				if (i < numModules - 1)
				{
					modulesString += Tokens.RS;
				}
			}

			return modulesString;
		}

		/**
		 * Returns a list of the module identifiers in this RoomModules object. Used for internal
		 * debugging and error handling.
		 * @return {string[]}
		 */
		getIdentifiers():string[]
		{
			const ids:string[] = [];

			for (let i = 0; i < this.modules.length; i++)
			{
				const module = this.modules[i];
				ids.push(module[1]);
			}
			return ids;
		}
	}
}

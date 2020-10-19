namespace net.user1.orbiter
{
	/**
	 * Provides convenience methods for retreiving the qualifier and simple id of a string fully
	 * qualified room id.
	 */
	export class RoomIDParser
	{
		/**
		 * Returns the qualifier of a fully qualified room id. For example, when passed
		 * "examples.chat", returns "examples".
		 */
		static getQualifier(fullRoomID:string):string
		{
			if (fullRoomID.indexOf('.') == -1)
			{
				return '';
			}
			else
			{
				return fullRoomID.slice(0, fullRoomID.lastIndexOf('.'));
			}
		}

		/**
		 * Returns the simple id of a fully qualified room id. For example, when passed
		 * "examples.chat", returns "chat".
		 */
		static getSimpleRoomID(fullRoomID:string):string
		{
			if (fullRoomID.indexOf('.') == -1)
			{
				return fullRoomID;
			}
			else
			{
				return fullRoomID.slice(fullRoomID.lastIndexOf('.') + 1);
			}
		}

		/**
		 * Returns an array containing the qualifier and simple id of a string fully qualified room
		 * id. For example, when passed "examples.chat", returns the array ["examples", "chat"].
		 */
		static splitID(fullRoomID:string):string[]
		{
			return [this.getQualifier(fullRoomID), this.getSimpleRoomID(fullRoomID)];
		}
	}
}

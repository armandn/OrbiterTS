namespace net.user1.orbiter.snapshot
{
	export class SnapshotEvent extends net.user1.events.Event
	{
		/**
		 * Dispatched when a snapshot object has been updated in response to an earlier call to
		 * [[Orbiter.updateSnapshot]] method.
		 */
		static LOAD = "LOAD";

		/**
		 * Dispatched when the result of an update request has been received by a snapshot object.
		 */
		static STATUS = "STATUS";

		constructor(type:string, private readonly snapshot:Snapshot)
		{
			super(type);
		}

		toString():string
		{
			return "[object SnapshotEvent]";
		}
	}
}

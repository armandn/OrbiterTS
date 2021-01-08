///<reference path="EventDispatcher.ts"/>
namespace net.user1.orbiter.snapshot
{
	/**
	 * Orbiter’s "snapshots" provide a traditional request/response mechanism for retrieving data on
	 * demand from Union Server; the Snapshot class is the abstract base class for all Orbiter
	 * "snapshot" classes, each of which loads a specific set of data from the server. For example,
	 * the [[ClientCountSnapshot]] class loads the number of clients currently connected to the
	 * server. The [[RoomSnapshot]] class loads a data manifest describing a particular room. To
	 * request a snapshot of data using a snapshot class, first create the desired snapshot object,
	 * then pass that object to the [[Orbiter.updateSnapshot]] method.
	 * Snapshots such as the preceding RoomListSnapshot object represent the state of the server at
	 * the time of the updateSnapshot() request only, and are not kept synchronized once loaded.
	 * All snapshot objects trigger SnapshotEvent.LOAD when data loads. Some snapshot objects also
	 * trigger SnapshotEvent.STATUS when the status of the load operation is received. For details,
	 * see SnapshotEvent.
	 */
	export class Snapshot extends net.user1.events.EventDispatcher
	{
		/** @internal */
		args:(string|number|undefined)[] = [];

		/** @internal */
		hasStatus?:boolean;

		/** @internal */
		method?:string;

		private _status?:Status;
		private _updateInProgress?:boolean;

		/** @internal */
		loaded?:boolean;

		/** @internal */
		statusReceived?:boolean;

		constructor(target?:net.user1.events.EventDispatcher)
		{
			super(target);
		}

		/**
		 * Returns the status of the most recent snapshot load-operation. If a load operation is
		 * currently in progress, getStatus() returns null. The possible return values of
		 * getStatus() depend on the snapshot type.
		 * @return {Status}
		 */
		getStatus():Status|undefined
		{
			return this._status;
		}

		/**
		 * Indicates whether the snapshot is currently loading data. While an update
		 * is in progress, further requests to update the snapshot are ignored.
		 * @return {boolean}
		 */
		updateInProgress():boolean|undefined
		{
			return this._updateInProgress;
		}

		/** @internal */
		dispatchLoaded():void
		{
			this.dispatchEvent(new SnapshotEvent(SnapshotEvent.LOAD, this));
		}

		/** @internal */
		dispatchStatus():void
		{
			this.dispatchEvent(new SnapshotEvent(SnapshotEvent.STATUS, this));
		}

		/** @internal */
		onLoad()
		{
		}

		/** @internal */
		setStatus(value?:Status):void
		{
			this._status = value;
		}

		/** @internal */
		setUpdateInProgress(value:boolean):void
		{
			this._updateInProgress = value;
		}
	}
}

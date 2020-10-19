namespace net.user1.orbiter
{
	/**
	 * @internal
	 */
	export class SnapshotManager
	{
		private readonly pendingSnapshots:{[key:string]:snapshot.Snapshot};
		private requestIDCounter:number;

		constructor(private readonly messageManager:MessageManager)
		{
			this.messageManager = messageManager;
			this.pendingSnapshots = {};
			this.requestIDCounter = 0;
		}

		receiveAccountListSnapshot(requestID:string, accountList:string[]):void
		{
			const snapshot = this.pendingSnapshots[requestID] as snapshot.AccountListSnapshot;
			if (!snapshot)
			{
				throw new Error(`[SNAPSHOT_MANAGER] Received accountlist snapshot for unknown request ID: [${requestID}]`);
			}
			snapshot.setAccountList(accountList);
			this.setLoaded(snapshot, requestID);
		}

		receiveAccountSnapshot(requestID:string, manifest:ClientManifest):void
		{
			const snapshot = this.pendingSnapshots[requestID] as snapshot.ClientSnapshot;
			if (!snapshot)
			{
				throw new Error(`[SNAPSHOT_MANAGER] Received account snapshot for unknown request ID: [${requestID}]`);
			}
			snapshot.setManifest(manifest);
			this.setLoaded(snapshot, requestID);
		}

		receiveBannedListSnapshot(requestID:string, bannedList:string[]):void
		{
			const snapshot = this.pendingSnapshots[requestID] as snapshot.BannedListSnapshot;
			if (!snapshot)
			{
				throw new Error(`[SNAPSHOT_MANAGER] Received bannedlist snapshot for unknown request ID: [${requestID}]`);
			}
			snapshot.setBannedList(bannedList);
			this.setLoaded(snapshot, requestID);
		}

		receiveClientCountSnapshot(requestID:string, numClients:number):void
		{
			const snapshot = this.pendingSnapshots[requestID] as snapshot.ClientCountSnapshot;
			if (!snapshot)
			{
				throw new Error(`[SNAPSHOT_MANAGER] Received client-count snapshot for unknown request ID: [${requestID}]`);
			}
			snapshot.setCount(numClients);
			this.setLoaded(snapshot, requestID);
		}

		receiveClientListSnapshot(requestID:string, clientList:{clientID:string, userID:string|null}[]):void
		{
			const snapshot = this.pendingSnapshots[requestID] as snapshot.ClientListSnapshot;
			if (!snapshot)
			{
				throw new Error(`[SNAPSHOT_MANAGER] Received clientlist snapshot for unknown request ID: [${requestID}]`);
			}
			snapshot.setClientList(clientList);
			this.setLoaded(snapshot, requestID);
		}

		receiveClientSnapshot(requestID:string, manifest:ClientManifest):void
		{
			const snapshot = this.pendingSnapshots[requestID] as snapshot.ClientSnapshot;
			if (!snapshot)
			{
				throw new Error(`[SNAPSHOT_MANAGER] Received client snapshot for unknown request ID: [${requestID}]`);
			}
			snapshot.setManifest(manifest);
			this.setLoaded(snapshot, requestID);
		}

		receiveGatewaysSnapshot(requestID:string, gateways:Gateway[]):void
		{
			const snapshot = this.pendingSnapshots[requestID] as snapshot.GatewaysSnapshot;
			if (!snapshot)
			{
				throw new Error(`[SNAPSHOT_MANAGER] Received gateways snapshot for unknown request ID: [${requestID}]`);
			}
			snapshot.setGateways(gateways);
			this.setLoaded(snapshot, requestID);
		}

		receiveNodeListSnapshot(requestID:string, nodeList:string[]):void
		{
			const snapshot = this.pendingSnapshots[requestID] as snapshot.NodeListSnapshot;
			if (!snapshot)
			{
				throw new Error(`[SNAPSHOT_MANAGER] Received server node list snapshot for unknown request ID: [${requestID}]`);
			}
			snapshot.setNodeList(nodeList);
			this.setLoaded(snapshot, requestID);
		}

		receiveRoomListSnapshot(requestID:string, roomList:string[], qualifier:string, recursive:boolean):void
		{
			const snapshot = this.pendingSnapshots[requestID] as snapshot.RoomListSnapshot;
			if (!snapshot)
			{
				throw new Error(`[SNAPSHOT_MANAGER] Received roomlist snapshot for unknown request ID: [${requestID}]`);
			}
			snapshot.setRoomList(roomList);
			snapshot.setQualifier(qualifier == '' ? undefined : qualifier);
			snapshot.setRecursive(recursive);
			this.setLoaded(snapshot, requestID);
		}

		receiveRoomSnapshot(requestID:string, manifest:RoomManifest):void
		{
			const snapshot = this.pendingSnapshots[requestID] as snapshot.RoomSnapshot;
			if (!snapshot)
			{
				throw new Error(`[SNAPSHOT_MANAGER] Received room snapshot for unknown request ID: [${requestID}]`);
			}
			snapshot.setManifest(manifest);
			this.setLoaded(snapshot, requestID);
		}

		receiveServerModuleListSnapshot(requestID:string, moduleList:ModuleDefinition[]):void
		{
			const snapshot = this.pendingSnapshots[requestID] as snapshot.ServerModuleListSnapshot;
			if (!snapshot)
			{
				throw new Error(`[SNAPSHOT_MANAGER] Received server module list snapshot for unknown request ID: [${requestID}]`);
			}
			snapshot.setModuleList(moduleList);
			this.setLoaded(snapshot, requestID);
		}

		receiveSnapshotResult(requestID:string, status:Status):void
		{
			const snapshot = this.pendingSnapshots[requestID];
			if (!snapshot)
			{
				throw new Error(`[SNAPSHOT_MANAGER] Received snapshot result for unknown request ID: [${requestID}]`);
			}
			snapshot.setStatus(status);
			this.setStatusReceived(snapshot, requestID);
		}

		receiveUPCStatsSnapshot(requestID:string, totalUPCsProcessed:number, numUPCsInQueue:number, lastQueueWaitTime:number, longestUPCProcesses:UPCProcessingRecord[]):void
		{
			const snapshot = this.pendingSnapshots[requestID] as snapshot.UPCStatsSnapshot;
			if (!snapshot)
			{
				throw new Error(`[SNAPSHOT_MANAGER] Received UPC stats snapshot for unknown request ID: [${requestID}]`);
			}
			snapshot.setTotalUPCsProcessed(totalUPCsProcessed);
			snapshot.setNumUPCsInQueue(numUPCsInQueue);
			snapshot.setLastQueueWaitTime(lastQueueWaitTime);
			snapshot.setLongestUPCProcesses(longestUPCProcesses);
			this.setLoaded(snapshot, requestID);
		}

		setLoaded(snapshot:snapshot.Snapshot, requestID:string):void
		{
			snapshot.loaded = true;
			if (snapshot.hasStatus == false || (snapshot.hasStatus == true && snapshot.statusReceived))
			{
				snapshot.setUpdateInProgress(false);
				delete this.pendingSnapshots[requestID];
			}

			snapshot?.onLoad();
			snapshot.dispatchLoaded();
		}

		setStatusReceived(snapshot:snapshot.Snapshot, requestID:string):void
		{
			if (snapshot.loaded)
			{
				snapshot.setUpdateInProgress(false);
				delete this.pendingSnapshots[requestID];
			}
			snapshot.dispatchStatus();
		}

		updateSnapshot(snapshot:snapshot.Snapshot):void
		{
			if (!snapshot || snapshot.updateInProgress())
				return;

			this.requestIDCounter++;
			snapshot.setUpdateInProgress(true);
			snapshot.loaded = false;
			snapshot.statusReceived = false;
			snapshot.setStatus();
			this.pendingSnapshots[this.requestIDCounter.toString()] = snapshot;

			this.messageManager.sendUPC(snapshot.method??'', this.requestIDCounter, ...snapshot.args.slice(0));
		}
	}
}

///<reference path="LogEvent.ts"/>

namespace net.user1.orbiter
{
	import Logger = net.user1.logger.Logger;
	import LogEvent = net.user1.logger.LogEvent;

	/**
	 * @internal
	 * The CoreEventLogger class enters a simple debug message into the client-side log for many of
	 * the major Orbiter events. For example, when a [[RoomManagerEvent.ROOM_ADDED]] event occurs,
	 * CoreEventLogger logs the message: "Room added: 'room_id_here'"
	 *
	 * The CoreEventLogger class does not define any public methods or variables.
	 */
	export class CoreEventLogger
	{
		constructor(private readonly log:Logger, 
		            connectionMan:ConnectionManager, 
		            roomMan:RoomManager, 
		            accountMan:AccountManager, 
		            server:Server, 
		            clientMan:ClientManager, 
		            orbiter:Orbiter)
		{
			accountMan.addEventListener(AccountEvent.CHANGE_PASSWORD,                          this.changePasswordListener,                this, integer.MAX_VALUE);
			accountMan.addEventListener(AccountEvent.CHANGE_PASSWORD_RESULT,                   this.changePasswordResultListener,          this, integer.MAX_VALUE);
			accountMan.addEventListener(AccountEvent.LOGIN,                                    this.loginListener,                         this, integer.MAX_VALUE);
			accountMan.addEventListener(AccountEvent.LOGIN_RESULT,                             this.loginResultListener,                   this, integer.MAX_VALUE);
			accountMan.addEventListener(AccountEvent.LOGOFF,                                   this.logoffListener,                        this, integer.MAX_VALUE);
			accountMan.addEventListener(AccountEvent.LOGOFF_RESULT,                            this.logoffResultListener,                  this, integer.MAX_VALUE);
			accountMan.addEventListener(AccountEvent.OBSERVE,                                  this.observeAccountListener,                this, integer.MAX_VALUE);
			accountMan.addEventListener(AccountEvent.OBSERVE_RESULT,                           this.observeAccountResultListener,          this, integer.MAX_VALUE);
			accountMan.addEventListener(AccountEvent.STOP_OBSERVING,                           this.stopObservingAccountListener,          this, integer.MAX_VALUE);
			accountMan.addEventListener(AccountEvent.STOP_OBSERVING_RESULT,                    this.stopObservingAccountResultListener,    this, integer.MAX_VALUE);
			accountMan.addEventListener(AccountManagerEvent.ACCOUNT_ADDED,                     this.accountAddedListener,                  this, integer.MAX_VALUE);
			accountMan.addEventListener(AccountManagerEvent.ACCOUNT_REMOVED,                   this.accountRemovedListener,                this, integer.MAX_VALUE);
			accountMan.addEventListener(AccountManagerEvent.CREATE_ACCOUNT_RESULT,             this.createAccountResultListener,           this, integer.MAX_VALUE);
			accountMan.addEventListener(AccountManagerEvent.REMOVE_ACCOUNT_RESULT,             this.removeAccountResultListener,           this, integer.MAX_VALUE);
			accountMan.addEventListener(AccountManagerEvent.STOP_WATCHING_FOR_ACCOUNTS_RESULT, this.stopWatchingForAccountsResultListener, this, integer.MAX_VALUE);
			accountMan.addEventListener(AccountManagerEvent.SYNCHRONIZE,                       this.synchronizeAccountsListener,           this, integer.MAX_VALUE);
			accountMan.addEventListener(AccountManagerEvent.WATCH_FOR_ACCOUNTS_RESULT,         this.watchForAccountsResultListener,        this, integer.MAX_VALUE);

			clientMan.addEventListener(ClientEvent.OBSERVE,                                          this.observeClientListener,                        this, integer.MAX_VALUE);
			clientMan.addEventListener(ClientEvent.OBSERVE_RESULT,                                   this.observeClientResultListener,                  this, integer.MAX_VALUE);
			clientMan.addEventListener(ClientEvent.STOP_OBSERVING,                                   this.stopObservingClientListener,                  this, integer.MAX_VALUE);
			clientMan.addEventListener(ClientEvent.STOP_OBSERVING_RESULT,                            this.stopObservingClientResultListener,            this, integer.MAX_VALUE);
			clientMan.addEventListener(ClientManagerEvent.ADDRESS_BANNED,                            this.addressBannedListener,                        this, integer.MAX_VALUE);
			clientMan.addEventListener(ClientManagerEvent.ADDRESS_UNBANNED,                          this.addressUnbannedListener,                      this, integer.MAX_VALUE);
			clientMan.addEventListener(ClientManagerEvent.CLIENT_CONNECTED,                          this.clientConnectedListener,                      this, integer.MAX_VALUE);
			clientMan.addEventListener(ClientManagerEvent.CLIENT_DISCONNECTED,                       this.clientDisconnectedListener,                   this, integer.MAX_VALUE);
			clientMan.addEventListener(ClientManagerEvent.STOP_WATCHING_FOR_BANNED_ADDRESSES_RESULT, this.stopWatchingForBannedAddressesResultListener, this, integer.MAX_VALUE);
			clientMan.addEventListener(ClientManagerEvent.STOP_WATCHING_FOR_CLIENTS_RESULT,          this.stopWatchingForClientsResultListener,         this, integer.MAX_VALUE);
			clientMan.addEventListener(ClientManagerEvent.SYNCHRONIZE,                               this.synchronizeClientsListener,                   this, integer.MAX_VALUE);
			clientMan.addEventListener(ClientManagerEvent.SYNCHRONIZE_BANLIST,                       this.synchronizeBanlistListener,                   this, integer.MAX_VALUE);
			clientMan.addEventListener(ClientManagerEvent.WATCH_FOR_BANNED_ADDRESSES_RESULT,         this.watchForBannedAddressesResultListener,        this, integer.MAX_VALUE);
			clientMan.addEventListener(ClientManagerEvent.WATCH_FOR_CLIENTS_RESULT,                  this.watchForClientsResultListener,                this, integer.MAX_VALUE);

			connectionMan.addEventListener(ConnectionManagerEvent.CLIENT_KILL_CONNECT, this.clientKillConnectListener, this, integer.MAX_VALUE);
			connectionMan.addEventListener(ConnectionManagerEvent.CONNECT_FAILURE,     this.connectFailureListener,    this, integer.MAX_VALUE);
			connectionMan.addEventListener(ConnectionManagerEvent.SERVER_KILL_CONNECT, this.serverKillConnectListener, this, integer.MAX_VALUE);

			orbiter.addEventListener(OrbiterEvent.CONNECT_REFUSED,       this.connectRefusedListener,       this, integer.MAX_VALUE);
			orbiter.addEventListener(OrbiterEvent.PROTOCOL_INCOMPATIBLE, this.protocolIncompatibleListener, this, integer.MAX_VALUE);
			orbiter.addEventListener(OrbiterEvent.READY,                 this.readyListener,                this, integer.MAX_VALUE);

			roomMan.addEventListener(RoomEvent.JOIN_RESULT,                           this.joinRoomResultListener,             this, integer.MAX_VALUE);
			roomMan.addEventListener(RoomEvent.LEAVE_RESULT,                          this.leaveRoomResultListener,            this, integer.MAX_VALUE);
			roomMan.addEventListener(RoomEvent.OBSERVE_RESULT,                        this.observeRoomResultListener,          this, integer.MAX_VALUE);
			roomMan.addEventListener(RoomEvent.STOP_OBSERVING_RESULT,                 this.stopObservingRoomResultListener,    this, integer.MAX_VALUE);
			roomMan.addEventListener(RoomManagerEvent.CREATE_ROOM_RESULT,             this.createRoomResultListener,           this, integer.MAX_VALUE);
			roomMan.addEventListener(RoomManagerEvent.REMOVE_ROOM_RESULT,             this.removeRoomResultListener,           this, integer.MAX_VALUE);
			roomMan.addEventListener(RoomManagerEvent.ROOM_ADDED,                     this.roomAddedListener,                  this, integer.MAX_VALUE);
			roomMan.addEventListener(RoomManagerEvent.ROOM_COUNT,                     this.roomCountListener,                  this, integer.MAX_VALUE);
			roomMan.addEventListener(RoomManagerEvent.ROOM_REMOVED,                   this.roomRemovedListener,                this, integer.MAX_VALUE);
			roomMan.addEventListener(RoomManagerEvent.STOP_WATCHING_FOR_ROOMS_RESULT, this.stopWatchingForRoomsResultListener, this, integer.MAX_VALUE);
			roomMan.addEventListener(RoomManagerEvent.WATCH_FOR_ROOMS_RESULT,         this.watchForRoomsResultListener,        this, integer.MAX_VALUE);

			server.addEventListener(ServerEvent.TIME_SYNC, this.timeSyncListener, this, integer.MAX_VALUE);

			this.log.addEventListener(LogEvent.LEVEL_CHANGE, this.logLevelChangeListener, this, integer.MAX_VALUE);
		}

		private accountAddedListener(e:AccountManagerEvent):void
		{
			this.log.info(`[ACCOUNT_MANAGER] Account added: ${e.getAccount()}`);
		}

		private accountRemovedListener(e:AccountManagerEvent):void
		{
			this.log.info(`[ACCOUNT_MANAGER] Account removed: ${e.getAccount()}`);
		}

		private addressBannedListener(e:ClientManagerEvent):void
		{
			this.log.info(`[CLIENT_MANAGER] Client address banned: [${e.getAddress()}].`);
		}

		private addressUnbannedListener(e:ClientManagerEvent):void
		{
			this.log.info(`[CLIENT_MANAGER] Client address unbanned. ClientID: [${e.getAddress()}].`);
		}

		private changePasswordListener(e:AccountEvent):void
		{
			this.log.info(`[ACCOUNT_MANAGER] Password changed for account: ${e.getUserID()}`);
		}

		private changePasswordResultListener(e:AccountEvent):void
		{
			this.log.info(`[ACCOUNT_MANAGER] Result for changePassword(). Account: ${e.getUserID()}, Status: ${e.getStatus()}`);
		}

		private clientConnectedListener(e:ClientManagerEvent):void
		{
			this.log.info(`[CLIENT_MANAGER] Foreign client connected. ClientID: [${e.getClientID()}].`);
		}

		private clientDisconnectedListener(e:ClientManagerEvent):void
		{
			this.log.info(`[CLIENT_MANAGER] Foreign client disconnected. ClientID: [${e.getClientID()}].`);
		}

		private clientKillConnectListener(e:ConnectionManagerEvent):void
		{
			this.log.info('[CONNECTION_MANAGER] Connection to server closed by client.');
		}

		private connectFailureListener(e:ConnectionManagerEvent):void
		{
			this.log.info(`[CONNECTION_MANAGER] ${e.getStatus()}`);
		}

		private connectRefusedListener(e:OrbiterEvent):void
		{
			if (e.getConnectionRefusal()?.reason == ConnectionRefusalReason.BANNED)
			{
				this.log.warn(`[ORBITER] Union Server refused the connection because the client address is banned for the following reason: [${e.getConnectionRefusal()?.banReason}]. The ban started at: [${new Date(e.getConnectionRefusal()?.bannedAt??0)}]. The ban duration is: [${net.user1.utils.NumericFormatter.msToElapsedDayHrMinSec(e.getConnectionRefusal()?.banDuration??0 * 1000)}].`);
			}
			else
			{
				this.log.warn(`[ORBITER] Union Server refused the connection. Reason: [${e.getConnectionRefusal()?.reason}]. Description: [${e.getConnectionRefusal()?.description}].`);
			}
		}

		private createAccountResultListener(e:AccountManagerEvent):void
		{
			this.log.info(`[ACCOUNT_MANAGER] Result for createAccount(). Account: ${e.getUserID()}, Status: ${e.getStatus()}`);
		}

		private createRoomResultListener(e:RoomManagerEvent):void
		{
			this.log.info(`[ROOM_MANAGER] Room creation result for room [${e.getRoomID()}]: ${e.getStatus()}`);
		}

		private joinRoomResultListener(e:RoomEvent):void
		{
			this.log.info(`[ROOM_MANAGER] Join result for room [${e.getRoomID()}]: ${e.getStatus()}`);
		}

		private leaveRoomResultListener(e:RoomEvent):void
		{
			this.log.info(`[ROOM_MANAGER] Leave result for room [${e.getRoomID()}]: ${e.getStatus()}`);
		}

		private logLevelChangeListener(e:LogEvent):void
		{
			this.log.info(`[LOGGER] Log level set to: [${e.getLevel()}].`);
		}

		private loginListener(e:AccountEvent):void
		{
			this.log.info(`[ACCOUNT_MANAGER] Account logged in: ${e.getAccount()}`);
		}

		private loginResultListener(e:AccountEvent):void
		{
			this.log.info(`[ACCOUNT_MANAGER] Result for login(). Account: ${e.getAccount()}, Status: ${e.getStatus()}`);
		}

		private logoffListener(e:AccountEvent):void
		{
			this.log.info(`[ACCOUNT_MANAGER] Account logged off: ${e.getAccount()}`);
		}

		private logoffResultListener(e:AccountEvent):void
		{
			this.log.info(`[ACCOUNT_MANAGER] Result for logoff(). Account: ${e.getAccount()}, Status: ${e.getStatus()}`);
		}

		private observeAccountListener(e:AccountEvent):void
		{
			this.log.info(`[ACCOUNT_MANAGER] Account observed: ${e.getAccount()}`);
		}

		private observeAccountResultListener(e:AccountEvent):void
		{
			this.log.info(`[ACCOUNT_MANAGER] 'Observe account result' for account: ${e.getAccount()}, Status: ${e.getStatus()}`);
		}

		private observeClientListener(e:ClientEvent):void
		{
			this.log.info(`[CLIENT_MANAGER] Client observed: ${e.getClient()}`);
		}

		private observeClientResultListener(e:ClientEvent):void
		{
			this.log.info(`[CLIENT_MANAGER] 'Observe client' result for client: ${e.getClient()}, status: ${e.getStatus()}`);
		}

		private observeRoomResultListener(e:RoomEvent):void
		{
			this.log.info(`[ROOM_MANAGER] Observe result for room [${e.getRoomID()}]: ${e.getStatus()}`);
		}

		private protocolIncompatibleListener(e:OrbiterEvent):void
		{
			this.log.warn(`[ORBITER] Orbiter UPC protocol incompatibility detected. Client UPC version: ${(e.target as unknown as Orbiter)?.getSystem().getUPCVersion().toString()}. Server version: ${e.getServerUPCVersion()?.toString()}.`);
		}

		private readyListener(e:OrbiterEvent):void
		{
			this.log.info('[ORBITER] Orbiter now connected and ready.');
		}

		private removeAccountResultListener(e:AccountManagerEvent):void
		{
			this.log.info(`[ACCOUNT_MANAGER] Result for removeAccount(). Account: ${e.getUserID()}, Status: ${e.getStatus()}`);
		}

		private removeRoomResultListener(e:RoomManagerEvent):void
		{
			this.log.info(`[ROOM_MANAGER] Room removal result for room [${e.getRoomID()}]: ${e.getStatus()}`);
		}

		private roomAddedListener(e:RoomManagerEvent):void
		{
			this.log.info(`[ROOM_MANAGER] Room added: ${e.getRoom()}.`);
		}

		private roomCountListener(e:RoomManagerEvent):void
		{
			this.log.info(`[ROOM_MANAGER] New room count: ${e.getNumRooms()}.`);
		}

		private roomRemovedListener(e:RoomManagerEvent):void
		{
			this.log.info(`[ROOM_MANAGER] Room removed: ${e.getRoom()}.`);
		}

		private serverKillConnectListener(e:ConnectionManagerEvent):void
		{
			this.log.info('[CONNECTION_MANAGER] Server closed the connection.');
		}

		private stopObservingAccountListener(e:AccountEvent):void
		{
			this.log.info(`[ACCOUNT_MANAGER] Stopped observing account: ${e.getUserID()}`);
		};

		private stopObservingAccountResultListener(e:AccountEvent):void
		{
			this.log.info(`[ACCOUNT_MANAGER] 'Stop observing account result' for account: ${e.getUserID()}, Status: ${e.getStatus()}`);
		}

		private stopObservingClientListener(e:ClientEvent):void
		{
			this.log.info(`[CLIENT_MANAGER] Stopped observing client: ${e.getClient()}`);
		}

		private stopObservingClientResultListener(e:ClientEvent):void
		{
			this.log.info(`[CLIENT_MANAGER] 'Stop observing client' result for client: ${e.getClient()}, status: ${e.getStatus()}`);
		}

		private stopObservingRoomResultListener(e:RoomEvent):void
		{
			this.log.info(`[ROOM_MANAGER] Stop observing result for room [${e.getRoomID()}]: ${e.getStatus()}`);
		}

		private stopWatchingForAccountsResultListener(e:AccountManagerEvent):void
		{
			this.log.info(`[SERVER] 'Stop watching for accounts' result: ${e.getStatus()}`);
		}

		private stopWatchingForBannedAddressesResultListener(e:ClientManagerEvent):void
		{
			this.log.info(`[CLIENT_MANAGER] 'Stop watching for banned addresses' result: ${e.getStatus()}`);
		}

		private stopWatchingForClientsResultListener(e:ClientManagerEvent):void
		{
			this.log.info(`[CLIENT_MANAGER] 'Stop watching for clients' result: ${e.getStatus()}`);
		}

		private stopWatchingForRoomsResultListener(e:RoomManagerEvent):void
		{
			this.log.info(`[ROOM_MANAGER] 'Stop watching for rooms' result for qualifier [${e.getRoomIdQualifier()}]: ${e.getStatus()}`);
		}

		private synchronizeAccountsListener(e:AccountManagerEvent):void
		{
			this.log.info('[ACCOUNT_MANAGER] User account list synchronized with server.');
		}

		private synchronizeBanlistListener(e:ClientManagerEvent):void
		{
			this.log.info('[CLIENT_MANAGER] Banned list synchronized with server.');
		}

		private synchronizeClientsListener(e:ClientManagerEvent):void
		{
			this.log.info('[CLIENT_MANAGER] Client list synchronized with server.');
		}

		private timeSyncListener(e:ServerEvent):void
		{
			this.log.info(`[SERVER] Server time synchronized with client. Approximate time on server is now: ${new Date((e.target as unknown as Server)?.getServerTime())}`);
		}

		private watchForAccountsResultListener(e:AccountManagerEvent):void
		{
			this.log.info(`[ACCOUNT_MANAGER] 'Watch for accounts' result: ${e.getStatus()}`);
		}

		private watchForBannedAddressesResultListener(e:ClientManagerEvent):void
		{
			this.log.info(`[CLIENT_MANAGER] 'Watch for banned addresses' result: ${e.getStatus()}`);
		}

		private watchForClientsResultListener(e:ClientManagerEvent):void
		{
			this.log.info(`[CLIENT_MANAGER] 'Watch for clients' result: ${e.getStatus()}`);
		}

		private watchForRoomsResultListener(e:RoomManagerEvent):void
		{
			this.log.info(`[ROOM_MANAGER] 'Watch for rooms' result for qualifier [${e.getRoomIdQualifier()}]: ${e.getStatus()}`);
		}
	}
}

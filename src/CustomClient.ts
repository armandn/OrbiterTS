namespace net.user1.orbiter
{
	/**
	 * A base class for the creation of custom client classes.
	 * Note that CustomClient's composed Client instance is not available from within the
	 * CustomClient class's constructor method. Initialization code that requires access to the
	 * composed Client instance should be placed in an init() method in the CustomClient subclass.
	 *
	 * Note that CustomClient's composed Client instance is not available from within the
	 * CustomClient class's constructor method. Initialization code that requires access to the
	 * composed Client instance should be placed in an init() method in the CustomClient subclass.
	 */
	export class CustomClient
	{
		private client?:Client;

		constructor()
		{
		}

		addEventListener(type:string, listener:Function, thisArg:any, priority:number=0):void
		{
			this.client?.addEventListener(type, listener, thisArg, priority);
		}

		ban(duration:number, reason:string|null):void
		{
			this.client?.ban(duration, reason ?? undefined);
		}

		deleteAttribute(attrName:string, attrScope?:string):void
		{
			this.client?.deleteAttribute(attrName, attrScope);
		}

		dispatchEvent(event:net.user1.events.Event):void
		{
			return this.client?.dispatchEvent(event);
		}

		getAccount():UserAccount|null
		{
			return this.client?.getAccount() ?? null;
		}

		getAttribute(attrName:string, attrScope?:string):string|null
		{
			return this.client?.getAttribute(attrName, attrScope) ?? null;
		}

		getAttributes():{[name:string]:string|undefined} | null
		{
			return this.client?.getAttributes() ?? null;
		}

		getAttributesByScope(scope?:string):{[scope:string]:{[name:string]:string|undefined}} | {[name:string]:string|undefined} | null
		{
			return this.client?.getAttributesByScope(scope) ?? null;
		}

		getClientID():string
		{
			return this.client?.getClientID() ?? '';
		}

		getClientManager():ClientManager|null
		{
			return this.client?.getClientManager() ?? null;
		}

		getConnectTime():number|null
		{
			return this.client?.getConnectTime() ?? null;
		}

		getConnectionState():ConnectionState|null
		{
			return this.client?.getConnectionState() ?? null;
		}

		getIP():string|null
		{
			return this.client?.getIP() ?? null;
		}

		getObservedRoomIDs():string[]|null
		{
			return this.client?.getObservedRoomIDs() ?? null;
		}

		getOccupiedRoomIDs():string[]|null
		{
			return this.client?.getOccupiedRoomIDs() ?? null;
		}

		getPing():number|null
		{
			return this.client?.getPing() ?? null;
		}

		getTimeOnline():number|null
		{
			return this.client?.getTimeOnline() ?? null;
		}

		/**
		 * An initialization method invoked when this CustomClient object is ready
		 * for use. Subclasses wishing to perform initialization tasks that require
		 * this CustomClient's composed Client object should override this method.
		 */
		init():void
		{
		}

		isAdmin():boolean|null
		{
			return this.client?.isAdmin() ?? null;
		}

		isInRoom(roomID:string):boolean|null
		{
			return this.client?.isInRoom(roomID) ?? null;
		}

		isObservingRoom(roomID:string):boolean|null
		{
			return this.client?.isObservingRoom(roomID) ?? null;
		}

		isSelf():boolean|null
		{
			return this.client?.isSelf() ?? null;
		}

		kick():void
		{
			this.client?.kick();
		}

		observe():void
		{
			this.client?.observe();
		}

		removeEventListener(type:string, listener:Function, thisObj:any):void
		{
			this.client?.removeEventListener(type, listener, thisObj);
		}

		sendMessage(messageName:string, ...args:string[]):void
		{
			this.client?.sendMessage(messageName, ...args);
		}

		setAttribute(attrName:string, attrValue:string, attrScope?:string, isShared:boolean=true, evaluate:boolean=false):void
		{
			this.client?.setAttribute(attrName, attrValue, attrScope, isShared, evaluate);
		}

		/**
		 * @internal
		 * Used internally by Orbiter to associate this CustomClient object with
		 * a Client object.
		 */
		setClient(client:Client):void
		{
			this.client = client;
		}

		setClientClass<T>(scope:string, clientClass:new ()=>T, ...fallbackClasses:(new ()=>T)[]):void
		{
			this.client?.setClientClass(scope, clientClass, ...fallbackClasses);
		}

		stopObserving():void
		{
			this.client?.stopObserving();
		}

		toString():string
		{
			return `[object CustomClient, ID: ${this.getClientID()}]`;
		}
	}
}

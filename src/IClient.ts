namespace net.user1.orbiter
{
	/**
	 * The interface implemented by all classes that wish to represent a client in the Orbiter API.
	 * The built-in [[Client]] class implements IClient, and is used to represent any client in an
	 * application that does not have a custom client class specified. Developers that wish to use a
	 * custom class, rather than Client, to represent clients in an Orbiter application must create
	 * a class that implements the IClient interface, and then assign that class as a custom client
	 * class via [[Client.setClientClass]] method, [[Room.setDefaultClientClass]] method, or
	 * [[ClientManager.setDefaultClientClass]] method.
	 */
	export interface IClient
	{
		ban(duration:number, reason?:string):void

		deleteAttribute(attrName:string, attrScope?:string):void

		getAccount():UserAccount|null

		getAttribute(attrName:String, attrScope?:string):string|null

		getAttributes():{[name:string]:string|undefined}|null

		getAttributesByScope(scope?:string):{[scope:string]:{[name:string]:string|undefined}}|{[name:string]:string|undefined}|null

		getClientID():string

		getClientManager():ClientManager

		getConnectTime():number

		getConnectionState():number

		getIP():string|null

		getObservedRoomIDs():string[]

		getOccupiedRoomIDs():string[]

		getPing():number

		getTimeOnline():Number

		isAdmin():boolean

		isInRoom(roomID:string):boolean

		isObservingRoom(roomID:string):boolean

		isSelf():boolean

		kick():void

		observe():void

		sendMessage(messageName:string, ...rest:any):void

		setAttribute(attrName:String, attrValue:String, attrScope:string, isShared:boolean, evaluate:boolean):void

		setClientClass(scope:string, clientClass:any, ...fallbackClasses:any):void

		stopObserving():void
	}
}

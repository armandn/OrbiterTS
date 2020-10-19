namespace net.user1.orbiter
{
	/**
	 * @internal
	 */
	export class AttributeManager extends net.user1.events.EventDispatcher
	{
		private attributes:AttributeCollection|null = null;

		constructor(private readonly owner:net.user1.events.EventDispatcher|null = null,
		            private readonly messageManager:MessageManager|null = null,
		            private readonly log:net.user1.logger.Logger|null = null)
		{
			super();

			this.setAttributeCollection(new AttributeCollection());
		}

		deleteAttribute(deleteRequest:UPC):void
		{
			this.messageManager?.sendUPCObject(deleteRequest);
		}

		deleteAttributeListener(e:AttributeEvent):void
		{
			this.owner?.dispatchEvent(e);
		}

		dispose():void
		{
			// @ts-ignore
			this.messageManager = null;
			this.attributes = null;
			// @ts-ignore
			this.owner = null;
			// @ts-ignore
			this.log = null;
		}

		fireDeleteAttributeResult(attrName:string, attrScope:string, status:string):void
		{
			const attr:Attribute = new Attribute(attrName, undefined, undefined, attrScope);

			// Trigger event on listeners.
			const e = new AttributeEvent(AttributeEvent.DELETE_RESULT, attr, status);
			this.owner?.dispatchEvent(e);
		}

		fireSetAttributeResult(attrName:string, attrScope:string, status:string):void
		{
			const attr = new Attribute(attrName, undefined, undefined, attrScope);

			// Trigger event on listeners.
			const e = new AttributeEvent(AttributeEvent.SET_RESULT, attr, status);
			this.owner?.dispatchEvent(e);
		}

		getAttribute(attrName:string, attrScope?:string):string|null
		{
			return this.attributes?.getAttribute(attrName, attrScope) ?? null;
		}

		getAttributeCollection():AttributeCollection|null
		{
			return this.attributes;
		}

		getAttributes():{[name:string]:string|undefined} | null
		{
			return this.attributes?.getAll() ?? null;
		}

		getAttributesByScope(scope?:string):{[scope:string]:{[name:string]:string|undefined}} | {[name:string]:string|undefined} | null
		{
			return this.attributes?.getByScope(scope) ?? null;
		}

		registerAttributeListeners():void
		{
			// Can't use migrateListeners() here because we need to specify the listener
			// priority (int.MAX_VALUE)
			this.attributes?.addEventListener(AttributeEvent.UPDATE, this.updateAttributeListener, this, integer.MAX_VALUE);
			this.attributes?.addEventListener(AttributeEvent.DELETE, this.deleteAttributeListener, this, integer.MAX_VALUE);
		}

		removeAll():void
		{
			this.attributes?.clear();
		}

		removeAttributeLocal(attrName:string, attrScope:string, byClient?:Client):void
		{
			if (!this.attributes?.deleteAttribute(attrName, attrScope, byClient))
				this.log?.info(`${this.owner} Delete attribute failed for [${attrName}]. No such attribute.`);
		}

		setAttribute(setRequest:UPC):void
		{
			this.messageManager?.sendUPCObject(setRequest);
		}

		setAttributeCollection(value:AttributeCollection):void
		{
			this.unregisterAttributeListeners();
			this.attributes = value;
			this.registerAttributeListeners();
		}

		setAttributeLocal(attrName:string, attrVal:string, attrScope?:string, byClient?:Client):void
		{
			if (!this.attributes?.setAttribute(attrName, attrVal, attrScope, byClient))
				this.log?.info(`${this.owner} New attribute value for [${attrName}] matches old value. Not changed.`);
		}

		unregisterAttributeListeners():void
		{
			this.attributes?.removeEventListener(AttributeEvent.UPDATE, this.updateAttributeListener, this);
			this.attributes?.removeEventListener(AttributeEvent.DELETE, this.deleteAttributeListener, this);
		}

		updateAttributeListener(e:AttributeEvent):void
		{
			const attr:Attribute = e.getChangedAttr();

			this.log?.info(`${this.owner} Setting attribute [${attr.scope??'' + '.'}${attr.name}]. New value: [${attr.value}]. Old value: [${attr.oldValue}].`);
			this.owner?.dispatchEvent(e);
		}
	}
}

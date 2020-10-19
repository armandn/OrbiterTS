namespace net.user1.orbiter
{
	/**
	 * An collection of attributes for a client, user account, or room.
	 */
	export class AttributeCollection extends net.user1.events.EventDispatcher
	{
		private attributes:{[scope:string]:{[name:string]:string|undefined}} = {};

		constructor()
		{
			super();
		}

		/**
		 * @internal
		 */
		clear():void
		{
			this.attributes = {};
		}

		/**
		 * Returns true if this AttributeCollection contains the specified attribute;false otherwise
		 */
		contains(name:string, scope:string):boolean
		{
			return this.attributes.hasOwnProperty(scope) ? this.attributes[scope].hasOwnProperty(name) : false;
		}

		/**
		 * @internal
		 * @param {string} name
		 * @param {string} scope
		 * @param {net.user1.orbiter.Client} byClient
		 * @return {boolean}
		 */
		deleteAttribute(name:string, scope:string, byClient?:Client):boolean
		{
			let lastAttr:boolean = true;
			let value:string|undefined;

			// If the attribute exists...
			if (this.attributes.hasOwnProperty(scope) &&
			    this.attributes[scope].hasOwnProperty(name))
			{
				value = this.attributes[scope][name];
				delete this.attributes[scope][name];

				// Check if this is the last attribute. If it is, remove the room scope object.
				for (let p in this.attributes[scope])
				{
					lastAttr = false;
					break;
				}

				if (lastAttr) delete this.attributes[scope];

				// Notify listeners
				this.fireDeleteAttribute(name, value, scope, byClient);
				return true;
			}
			return false;
		}

		/**
		 * Returns an object containing all attributes in this collection. Each attribute is
		 * represented by a dynamic variable name/value pair.
		 */
		getAll():{[name:string]:string|undefined}
		{
			const attrs:{[name:string]:string|undefined} = {};
			for (let attrScope in this.attributes)
			{
				for (let attrName in this.attributes[attrScope])
				{
					const key:string = attrScope == Tokens.GLOBAL_ATTR ? attrName : `${attrScope}.${attrName}`;
					attrs[key] = this.attributes[attrScope][attrName];
				}
			}
			return attrs;
		}

		/**
		 * Returns the value of the specified attribute.
		 */
		getAttribute(attrName:string, attrScope?:string):string|null
		{
			// Use the global scope when no scope is specified
			if (!attrScope)
				attrScope = net.user1.orbiter.Tokens.GLOBAL_ATTR;

			// Find and return the attribute.
			if (this.attributes.hasOwnProperty(attrScope) && this.attributes[attrScope].hasOwnProperty(attrName))
			{
				return this.attributes[attrScope][attrName] ?? null;
			}
			else
			{
				// No attribute was found, so quit.
				return null;
			}
		}

		/**
		 * Returns the names of the attributes with the specified scope.
		 */
		getAttributesNamesForScope(scope:string):string[]
		{
			const names:string[] = [];
			for (let name in this.attributes[scope])
			{
				names.push(name);
			}
			return names;
		}

		/**
		 * Returns an object containing all attributes for the specified scope. When scope is
		 * specified, the object returned has the following format:
		 * ```
		 *     {name1:value1, name2:value2,...namen:valuen}
		 * ```
		 * When scope is not specified, the object returned has the following format:
		 * ```
		 *     {scope1: {name1:value1, name2:value2,...namen:valuen},
		 *      scope2: {name1:value1, name2:value2,...namen:valuen},
		 *      scopen: {name1:value1, name2:value2,...namen:valuen}}
		 * ```
		 */
		getByScope(scope?:string):{[scope:string]:{[name:string]:string|undefined}}|{[name:string]:string|undefined}
		{
			const obj:any = {};

			if (!scope)
			{
				for (let attrscope in this.attributes)
				{
					obj[attrscope] = {};
					for (let attrname in this.attributes[attrscope])
					{
						obj[attrscope][attrname] = this.attributes[attrscope][attrname];
					}
				}
			}
			else
			{
				for (let name in this.attributes[scope])
				{
					obj[name] = this.attributes[scope][name];
				}
			}

			return obj;
		}

		/**
		 * Returns a list of the scopes defined by attributes in this AttributeCollection.
		 */
		getScopes():string[]
		{
			const scopes = [];
			for (let scope in this.attributes)
			{
				scopes.push(scope);
			}
			return scopes;
		}

		/**
		 * @internal
		 * @param {string} name
		 * @param {string} value
		 * @param {string} scope
		 * @param {net.user1.orbiter.Client} byClient
		 * @return {boolean}
		 */
		setAttribute(name:string, value?:string, scope:string=Tokens.GLOBAL_ATTR, byClient?:Client):boolean
		{
			// Check if the scope and attr exist already
			const scopeExists = this.attributes.hasOwnProperty(scope),
			      attrExists  = scopeExists ? this.attributes[scope].hasOwnProperty(name) : false;

			let oldVal:string|undefined = '';

			// Find old value, if any
			if (attrExists)
			{
				oldVal = this.attributes[scope][name];
				if (oldVal == value)
				{
					// Attribute value is unchanged, so abort
					return false;
				}
			}

			// Make the scope record if necessary
			if (!scopeExists) this.attributes[scope] = {};

			// Set the attribute value
			this.attributes[scope][name] = value;

			// Notify listeners
			this.fireUpdateAttribute(name, value, scope, oldVal, byClient);

			return true;
		}

		/**
		 * Updates the specified scope in this collection to match the specified collection,
		 * eleting, adding, and updating attributes as necessary.
		 */
		synchronizeScope(scope:string, collection:AttributeCollection):void
		{
			// Delete all existing attributes that are not in the new collection
			let names = this.getAttributesNamesForScope(scope);
			for (let i = 0; i < names.length; i++)
			{
				const name = names[i];
				if (!collection.contains(name, scope))
				{
					this.deleteAttribute(name, scope);
				}
			}

			// Set all new attributes (unchanged attributes are ignored)
			names = collection.getAttributesNamesForScope(scope);
			for (let i = 0; i < names.length; i++)
			{
				const name = names[i];
				this.setAttribute(name, collection.getAttribute(name, scope) ?? undefined, scope);
			}
		}

		/**
		 * Adds the specified collection's attributes to this one's, overwriting any attribute in
		 * this collection that has the same name as an attribute in the new collection.
		 *
		 * This method is used when merging a UserAccount with a Client.
		 */
		private add(collection:AttributeCollection):void
		{
			const scopes = collection.getScopes();
			for (let i = 0; i <= scopes.length; i++)
			{
				const scope = scopes[i],
				      names = collection.getAttributesNamesForScope(scope);

				for (let j = 0; j < names.length; j++)
				{
					const name = names[j];
					this.setAttribute(name, collection.getAttribute(name, scope) ?? undefined, scope);
				}
			}
		}

		/**
		 * Broadcasts an AttributeEvent.DELETE event to listeners.
		 */
		private fireDeleteAttribute(attrName:string, attrValue?:string, attrScope?:string, byClient?:Client):void
		{
			const changedAttr = new Attribute(attrName, undefined, attrValue, attrScope, byClient),
			      e           = new AttributeEvent(AttributeEvent.DELETE, changedAttr);
			this.dispatchEvent(e);
		}

		/**
		 * Broadcasts an AttributeEvent.UPDATE event to listeners.
		 */
		private fireUpdateAttribute(attrName:string, attrVal?:string, attrScope?:string,
		                            oldVal?:string, byClient?:Client):void
		{
			const changedAttr = new Attribute(attrName, attrVal, oldVal, attrScope, byClient),
			      e           = new AttributeEvent(AttributeEvent.UPDATE, changedAttr);
			this.dispatchEvent(e);
		}
	}
}

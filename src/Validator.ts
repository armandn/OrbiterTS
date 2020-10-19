namespace net.user1.orbiter
{
	/**
	 * Provides a collection of validation methods used to check whether
	 * a roomID or attribute name is legally formed.
	 */
	export class Validator
	{
		/**
		 * Returns true if the specified attribute name is legally formed.
		 * An attribute name is invalid if:
		 * - it contains [[Tokens.RS]]
		 * - it is null or the empty string
		 */
		static isValidAttributeName(value?:string):boolean
		{
			// Can't be empty
			if (!value)
			{
				return false;
			}

			// Can't contain RS
			return value.indexOf(net.user1.orbiter.Tokens.RS) == -1;
		}

		/**
		 * Returns true if the specified client-attribute scope is legally formed.
		 * A client attribute scope is invalid if:
		 * - it is not null, and it is not a valid resolved room ID (null is valid: it refers to
		 *   the global scope)
		 */
		static isValidAttributeScope(value?:string):boolean
		{
			// Can't contain RS
			if (value)
			{
				return this.isValidResolvedRoomID(value);
			}
			else
			{
				return true;
			}
		}

		/**
		 * Returns true if the specified attribute value is legally formed.
		 * An attribute value is invalid if:
		 * - it contains Tokens.RS
		 */
		static isValidAttributeValue(value:string):boolean
		{
			// Can't contain RS
			if (typeof value != 'string')
			{
				// Non-string attribute values are coerced to strings at send time
				value = (value as any).toString();
			}
			return value.indexOf(net.user1.orbiter.Tokens.RS) == -1;
		}

		/**
		 * Returns true if the specified room module name is legally formed. A room module name is
		 * invalid if:
		 * - it contains Tokens.RS
		 * - it is the empty string
		 */
		static isValidModuleName(value:string):boolean
		{
			// Can't be empty (can be null)
			if (value == '')
			{
				return false;
			}

			// Can't contain RS
			return value.indexOf(net.user1.orbiter.Tokens.RS) == -1;
		}

		/**
		 * Returns true if the specified password is legally formed. A password is invalid if:
		 * - it is null
		 * - it contains [[Tokens.RS]]
		 */
		static isValidPassword(value:string):boolean
		{
			// Can't contain RS
			return !(value != null && value.indexOf(net.user1.orbiter.Tokens.RS) != -1);
		}

		/**
		 * Returns true if the specified value could legally be resolved to a single,
		 * specific room; false otherwise.
		 *
		 * The supplied value is invalid if:
		 * - it is null
		 * - it is the empty string
		 * - it contains [[Tokens.RS]]
		 * - it contains [[Tokens.WILDCARD]] (because the wildcard refers to a
		 * group of rooms with the same qualifier, not a single, specific room)
		 */
		static isValidResolvedRoomID(value:string):boolean
		{
			// Can't be null, nor the empty string
			if (!value)
			{
				return false;
			}

			// Can't contain RS
			if (value.indexOf(net.user1.orbiter.Tokens.RS) != -1)
			{
				return false;
			}

			// Can't contain WILDCARD
			return value.indexOf(net.user1.orbiter.Tokens.WILDCARD) == -1;
		}

		/**
		 * Returns true if the specified room ID (with no qualifier) is legally formed;
		 * false otherwise.
		 * An unqualified room ID is invalid if:
		 * - it is null
		 * - it is the empty string
		 * - it contains a "." (dot) character
		 * - it contains [[Tokens.RS]]
		 * - it contains [[Tokens.WILDCARD]]
		 */
		static isValidRoomID(value:string):boolean
		{
			// Can't be null, nor the empty string
			if (!value)
			{
				return false;
			}

			// Can't contain "."
			if (value.indexOf('.') != -1)
			{
				return false;
			}

			// Can't contain RS
			if (value.indexOf(net.user1.orbiter.Tokens.RS) != -1)
			{
				return false;
			}

			// Can't contain WILDCARD
			return value.indexOf(net.user1.orbiter.Tokens.WILDCARD) == -1;
		}

		/**
		 * Returns true if the specified room qualifier is legally formed;
		 * false otherwise. A room qualifier is invalid if:
		 * - it is null
		 * - it is the empty string
		 * - it contains [[Tokens.RS]]
		 * - it is longer than one character and contains [[Tokens.WILDCARD]]
		 */
		static isValidRoomQualifier(value:string):boolean
		{
			if (!value)
			{
				return false;
			}

			// "*" is valid (it means the unnamed qualifier)
			if (value == '*')
			{
				return true;
			}

			// Can't contain RS
			if (value.indexOf(net.user1.orbiter.Tokens.RS) != -1)
			{
				return false;
			}

			// Can't contain WILDCARD
			return value.indexOf(net.user1.orbiter.Tokens.WILDCARD) == -1;
		}
	}
}

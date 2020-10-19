namespace net.user1.orbiter.filters
{
	/**
	 * Represents a single attribute comparison to be used in a filter. The comparison includes the
	 * name of the attribute, the value to be compared, and the type of comparison (e.g., equals,
	 * greater than, etc).
	 */
	export class AttributeComparison implements IComparable
	{
		/**
		 * Constructor
		 * @param {string} name        The attribute name to compare.
		 * @param value                The attribute value to compare.
		 * @param {string} compareType The comparison type. Must be one of the constants defined by
		 *                             the CompareType class.
		 */
		constructor(private readonly name:string,
		            private readonly value:any,
		            private readonly compareType:string)
		{
			if (!Validator.isValidAttributeName(name))
			{
				throw new Error(`Invalid attribute name specified for AttributeComparison: ${name}`);
			}
		}

		/**
		 * Returns a string containing the XML representation of this AttributeComparison, suitable
		 * for transmission to Union Server.
		 * @return {string}
		 */
		toXMLString():string
		{
			return `<a c="${this.compareType}"><n><![CDATA[${this.name}]]></n><v><![CDATA[${this.value.toString()}]]></v></a>`;
		}
	}
}

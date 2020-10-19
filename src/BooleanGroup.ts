namespace net.user1.orbiter.filters
{
	/**
	 * The base class for AndGroup and OrGroup, which define Boolean relationships between multiple
	 * comparisons in filters.
	 */
	export class BooleanGroup implements IComparable
	{
		protected readonly comparisons:AttributeComparison[];
		protected readonly type:string;

		constructor(type:string)
		{
			this.type = type;
			this.comparisons = [];
		}

		/**
		 * Adds a new comparison to the Boolean group.
		 * @param {net.user1.orbiter.filters.AttributeComparison} comparison
		 */
		addComparison(comparison:AttributeComparison):void
		{
			if (!comparison) return;
			this.comparisons.push(comparison);
		}

		/**
		 * Returns a string containing the XML representation of this BooleanGroup, suitable for
		 * transmission to Union Server.
		 * @return {string}
		 */
		toXMLString():string
		{
			let s = this.type == BooleanGroupType.AND ? '<and>\n' : '<or>\n';

			for (let i = 0; i < this.comparisons.length; i++)
			{
				const comparison = this.comparisons[i];
				s += comparison.toXMLString() + '\n';
			}
			s += this.type == BooleanGroupType.AND ? '</and>' : '</or>';
			return s;
		}
	}
}

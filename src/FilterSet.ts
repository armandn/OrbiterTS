namespace net.user1.orbiter.filters
{
	/**
	 * Defines a set of individuals filters to be combined into a composite filter for use in a
	 * client-to-server message.
	 */
	export class FilterSet implements IFilter
	{
		private filters:Filter[] = [];

		/**
		 * Add a filter to the filters in the set.
		 */
		addFilter(filter:Filter):void
		{
			this.filters.push(filter);
		}

		/**
		 * Retrieve the filters in the set.
		 */
		getFilters():Filter[]
		{
			return this.filters.slice(0);
		}

		/**
		 * Returns a string containing the XML representation of this filter set, suitable for
		 * transmission to Union Server.
		 */
		toXMLString():string
		{
			let s = '<filters>\n';
			for (const filter of this.filters)
			{
				s += filter.toXMLString() + '\n';
			}
			s += '</filters>';
			return s;
		}
	}
}

namespace net.user1.orbiter.filters
{
	/**
	 * Defines a filter to be applied to a client-to-server message. The filter
	 * is also a logical AND group, so it can contain multiple comparisons
	 * that must all be true in order for the filter to pass.
	 */
	export class Filter extends AndGroup implements IFilter
	{
		private readonly filterType:string;

		constructor(filterType:string)
		{
			super();
			this.filterType = filterType;
		}

		/**
		 * Returns a string containing the XML representation of this filter,
		 * suitable for transmission to Union Server.
		 */
		toXMLString():string
		{
			let s:string = `<f t="${this.filterType}">\n`;

			let comparison;
			for (let i = 0; i < this.comparisons.length; i++)
			{
				comparison = this.comparisons[i];
				s += comparison.toXMLString() + "\n";
			}
			s += '</f>';
			return s;
		}
	}
}

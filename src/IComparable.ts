namespace net.user1.orbiter.filters
{
	/**
	 * The IComparable interface defines the methods that must be implemented by
	 * all classes that represent comparisons in the Orbiter filtering API.
	 */
	export interface IComparable
	{

		/**
		 * Returns a string containing the XML representation of this comparison,
		 * suitable for transmission to Union Server.
		 */
		toXMLString():string;
	}
}

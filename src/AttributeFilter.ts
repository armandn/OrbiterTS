///<reference path="Filter.ts"/>
namespace net.user1.orbiter.filters
{
	/**
	 * Defines an attribute filter to be applied to a client-to-server message. An attribute filter
	 * includes one or more AttributeComparisons, and passes only if all of its comparisons are
	 * considered true.
	 */
	export class AttributeFilter extends Filter
	{
		constructor()
		{
			super('A');
		}
	}
}

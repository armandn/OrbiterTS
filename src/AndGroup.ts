///<reference path="BooleanGroup.ts"/>
namespace net.user1.orbiter.filters
{
	/**
	 * Defines a Boolean AND relationship between multiple comparisons in a message filter.
	 * The Boolean AndGroup is considered true only if all of its comparisons are also considered
	 * true.
	 */
	export class AndGroup extends BooleanGroup
	{
		constructor()
		{
			super(BooleanGroupType.AND);
		}
	}
}

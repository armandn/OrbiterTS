namespace net.user1.orbiter.filters
{
	/**
	 * Defines a Boolean OR relationship between multiple comparisons in a
	 * message filter. The Boolean OrGroup is considered true if any of
	 * its comparisons are considered true.
	 */
	export class OrGroup extends BooleanGroup
	{
		constructor()
		{
			super(BooleanGroupType.OR);
		}
	}
}

namespace net.user1.orbiter.filters
{
	/**
	 * An enumeration of the types of comparisons in the filtering API.
	 * A comparison type dictates the criterion used to determine whether a
	 * comparison is true.
	 */
	export enum CompareType
	{
		EQUAL = 'eq',
		NOT_EQUAL = 'ne',
		GREATER_THAN = 'gt',
		GREATER_THAN_OR_EQUAL = 'ge',
		LESS_THAN = 'lt',
		LESS_THAN_OR_EQUAL = 'le'
	}
}

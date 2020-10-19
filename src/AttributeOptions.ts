namespace net.user1.orbiter
{
	/**
	 * @internal
	 * AttributeOptions is an enumeration of constant values used to specify options for an
	 * attribute. This class is used internally, and is not normally needed by developers.
	 */
	export enum AttributeOptions
	{
		FLAG_SHARED     = 1 << 2,
		FLAG_PERSISTENT = 1 << 3,
		FLAG_IMMUTABLE  = 1 << 5,
		FLAG_EVALUATE   = 1 << 8
	}
}


namespace net.user1.orbiter
{
	export class VersionNumber
	{
		/**
		 * Represents a version number, including major, minor, revision, and
		 * build components (e.g., 1.2.0.34).
		 */
		constructor(private major?:number, private minor?:number, private revision?:number, private build:number = -1)
		{
		}

		/**
		 * Parses a string representation of a version number, and assigns the
		 * individual parts of the number to the major, minor, revision, and
		 * build variables of this VersionNumber object.
		 */
		fromVersionString(value:string):void
		{
			[this.major, this.minor, this.revision, this.build = -1] = value.split('.').map(v=>parseInt(v));
		}

		/**
		 * Returns a string representation of the version number, in the
		 * following format: `1.2.0.3`
		 */
		toString():string
		{
			return `${this.major}.${this.minor}.${this.revision}${(this.build == -1) ? '' : '.' + this.build}`;
		}

		/**
		 * Returns a string representation of the version number, in the
		 * following format: `1.2.0 (Build 3)`
		 */
		toStringVerbose():string
		{
			return `${this.major}.${this.minor}.${this.revision}${(this.build == -1) ? '' : ' (Build ' + this.build + ')'}`;
		}
	}

}

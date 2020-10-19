namespace net.user1.utils
{
	/**
	 * A utility class for converting numeric data to human-readable strings.
	 */
	export class NumericFormatter
	{
		static addLeadingZero(n:number):string
		{
			return ((n > 9) ? '' : '0') + n;
		}

		static addTrailingZeros(n:number):string
		{
			const ns:string = n.toString();

			if (ns.length == 1)
			{
				return ns + '00';
			}
			else
			if (ns.length == 2)
			{
				return ns + '0';
			}
			else
			{
				return ns;
			}
		}

		/**
		 * Returns a 24-hour-clock representation of the specified time in
		 * the system's local timezone. Includes hour, minute, and second.
		 */
		static dateToLocalHrMinSec(date:Date):string
		{
			return this.addLeadingZero(date.getHours()) + ':' +
			       this.addLeadingZero(date.getMinutes()) + ':' +
			       this.addLeadingZero(date.getSeconds());
		}

		/**
		 * Same as [[dateToLocalHrMinSec]], but includes milliseconds.
		 */
		static dateToLocalHrMinSecMs(date:Date):string
		{
			return NumericFormatter.dateToLocalHrMinSec(date) + '.' +
			       NumericFormatter.addTrailingZeros(date.getMilliseconds());
		}

		/**
		 * Returns a human-readable string for specified milliseconds, as an
		 * elapsed-time readout, like a stopwatch.
		 */
		static msToElapsedDayHrMinSec(ms:number):string
		{
			let sec = Math.floor(ms / 1000);

			let min = Math.floor(sec / 60);
			sec = sec % 60;
			let timeString = NumericFormatter.addLeadingZero(sec);

			let hr = Math.floor(min / 60);
			min = min % 60;
			timeString = `${NumericFormatter.addLeadingZero(min)}:${timeString}`;

			let day = Math.floor(hr / 24);
			hr = hr % 24;
			timeString = `${NumericFormatter.addLeadingZero(hr)}:${timeString}`;

			if (day > 0)
			{
				timeString = `${day}d ${timeString}`;
			}

			return timeString;
		}
	}
}

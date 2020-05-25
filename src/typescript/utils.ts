/**
 * This file contains various utilities for Feedie
 */

namespace feedie {

	/**
	 * GetDefinedStringOrEmpty will return either the string provided or an empty string
	 * This is useful for easy "use string if it exists or safely set to nothing" functions.
	 * @param s Potential string being provided
	 */
	export function GetDefinedStringOrEmpty(s: string | undefined): string {
		return (typeof s == "string") ? s : "";
	}

	/**
	 * TitleString will titlize the provided string, so it'd convert something like managingEditor to ManagingEditor
	 * @param s Provided string
	 */
	export function TitleString(s: string) {
		return s.substr(0, 1).toUpperCase() + s.substr(1);;
	}
}
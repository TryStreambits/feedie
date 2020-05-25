/**
 * This file contains the various interfaces used by Feedie
 */

/**
* ChannelInfo is information about the RSS Channel
*/
interface ChannelInfo extends Object {
	Copyright?: string;
	Description?: string;
	Docs?: string;
	Generator?: string;
	Image?: ChannelInfoImage;
	Language?: string;
	LastBuildDate?: string;
	Link?: string;
	ManagingEditor?: string;
	PubDate?: string;
	SelfLink?: string;
	Title?: string;
	TTL?: number;
	WebMaster?: string;
}

/**
 * ChannelInfoImage is information about any channel's image sub-element
 */
interface ChannelInfoImage extends Object {
	Link: string;
	Height: number;
	Title: string;
	URL: string;
	Width: number;
}

/**
 * Item is information about individual RSS items / stories.
 */
interface Item extends Object {
	Author?: string;
	Categories?: ItemCategory[];
	Description?: string;
	Date?: number;
	Enclosures?: ItemEnclosure[];
	GUID?: string;
	Link?: string;
	PubDate?: string;
	Source?: string;
	Title?: string;
}

/**
 * ItemCategory is information about an individual Category the Item is associated with
 */
interface ItemCategory extends Object {
	Domain: string;
	Title: string;
}

/**
 * ItemEnclosure is information about individual media objects associated with the Item
 */
interface ItemEnclosure extends Object {
	Length: number;
	Type: string;
	URL: string;
}

/**
 * ItemSource is information about the source of the item
 */
interface ItemSource extends Object {
	Title: string;
	URL: string;
}
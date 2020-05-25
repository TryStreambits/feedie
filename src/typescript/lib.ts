/**
 * This file contains our primary Feedie library
 */

/// <reference path="interfaces.ts" />
/// <reference path="utils.ts" />

namespace feedie {
	/**
	 * Our Feedie RSS Parser
	 */
	export class Parser {
		public Document: Document;
		public Channel: ChannelInfo;
		public Items: Item[];

		private _callback: (selfOrErr: Parser | Error) => void;
		private _url: string;

		/**
		 * Create a new RSS Parser
		 * @param url Our RSS Feed URL
		 */
		constructor(url: string, callback: (selfOrErr: Parser | Error) => void) {
			this.Document = undefined;
			this.Channel = {}; // Set to an empty Object
			this.Items = []; // Set as an empty Array

			this._callback = callback;
			this._url = url;

			fetch(url).then(this.HandleFetchResp.bind(this)).then(this.Parse.bind(this));
		}

		/**
		 * HandleFetchResp will handle the provided response and either throw an Error or provide the response text
		 * @param response Provided Promise Response
		 */
		private HandleFetchResp(response: Response) {
			if (!response.ok) {
				let err = new Error(`Failed to get RSS feed. Returned status: ${response.statusText}`);
				this._callback(err); // Call our callback with the Error
				throw err; // Throw our error
			}

			return response.text(); // Return the text
		}

		/**
		 * Parse is a private function for the parsing and setting of our Parser's properties based on the provided RSS text
		 * This function should only ever be called once. For re-parsing RSS, create a new Parser.
		 * @param rssText Our RSS Feed Text
		 */
		private Parse(rssText: string) {
			let domParser = new DOMParser();
			this.Document = domParser.parseFromString(rssText, "application/xml"); // Parse our RSS text as XML

			this.Items = []; // Set as an empty array

			if (this.Document == null) { // Failed to parse the document
				this._callback(new Error(`Failed to parse ${this._url}`)); // Send our error to our bound callback
				return;
			}

			let channelItems: [
				"copyright",
				"description",
				"docs",
				"generator",
				"image",
				"language",
				"lastBuildDate",
				"link",
				"managingEditor",
				"pubDate",
				"selfLink",
				"title",
				"ttl",
				"webMaster",
			];

			let channel = this.Document.querySelector("channel"); // Get our channel Element

			if (channel == null) { // No channel info
				this._callback(new Error("No required channel info provided")); // Send our error to our bound callback
				return;
			}

			// #region Channel Info Fetching

			for (let key of channelItems) { // For each channel item key we're trying to get
				let channelItemEl = channel.querySelector(key); // Get the potential element for this channel
				let isDefined = ((channelItemEl !== undefined) && (channelItemEl !== null) && (typeof channelItemEl.nodeName == "string"));

				if (key == "description") { // Description is handled specially to ensure HTML is properly encoded
					let tmp: HTMLDivElement = document.createElement("div");
					tmp.innerHTML = isDefined ? channelItemEl.textContent : ""; // Add our text content if the element exists as innerHTML so it parses correctly encoded HTML
					this.Channel.Description = feedie.GetDefinedStringOrEmpty(tmp.innerHTML);
				} else if (key == "image") { // Image is an optional sub-element
					if (isDefined) { // If the image is defined
						let imageEl: HTMLElement = channelItemEl.querySelector("url");
						let titleEl: HTMLTitleElement = channelItemEl.querySelector("title");
						let linkEl: HTMLLinkElement = channelItemEl.querySelector("link");

						// Height and width are optional
						let heightEl: HTMLElement = channelItemEl.querySelector("height");
						let widthEl: HTMLElement = channelItemEl.querySelector("width");

						this.Channel.Image = {
							Height: (typeof heightEl.textContent == "string") ? Number(heightEl.textContent) : 31, // Convert the text content to a number. Set to 31 which is the default in the RSS spec.
							Link: (typeof linkEl.textContent == "string") ? linkEl.textContent : "",
							Title: (typeof titleEl.textContent == "string") ? titleEl.textContent : "",
							URL: (typeof imageEl.textContent == "string") ? imageEl.textContent : "",
							Width: (typeof widthEl.textContent == "string") ? Number(widthEl.textContent) : 88 // Convert the text content to a number. Set to 88 which is the default in the RSS spec.
						};
					}
				} else if (key == "ttl") { // TTL is handled specially as it is a Number
					this.Channel.TTL = (isDefined) ? Number(channelItemEl.textContent) : 0; // Set to the converted value or default to no TTL
				} else { // Basically anything else
					let titledKey = feedie.TitleString(key); // Titlize our key (e.g. copyright -> Copyright, webMaster -> WebMaster)
					this.Channel[titledKey] = feedie.GetDefinedStringOrEmpty(channelItemEl.textContent); // Set to provided text or empty stirng
				}
			}

			// #endregion

			// #region Item Generation

			let nodeItems: NodeListOf<HTMLElement> = this.Document.querySelectorAll("item"); // Get all item nodes

			for (let domItem of nodeItems) { // For each item Element
				let item: Item = {};

				let itemElementKeys = [ // This is a list of the non-special item Element keys that we should fetch
					"author",
					"description",
					"guid",
					"link",
					"pubDate",
					"source",
					"title"
				];

				for (let itemKey of itemElementKeys) { // For each Item Element
					let itemEl: HTMLElement = domItem.querySelector(itemKey); // Get the item if it exists
					let isDefined = ((itemEl !== undefined) && (itemEl !== null) && (typeof itemEl.nodeName == "string"));

					if (!isDefined) { // If it isn't defined
						continue; // Skip it
					}

					if (itemKey == "description") { // Description is handled similar to channel description in that it should be re-encoded
						let tmp: HTMLDivElement = document.createElement("div");
						tmp.innerHTML = itemEl.textContent; // Add our text content if the element exists as innerHTML so it parses correctly encoded HTML
						item.Description = feedie.GetDefinedStringOrEmpty(tmp.innerHTML);
					} else if (itemKey == "guid") { // Entire thing should be capitalized, it's an acronym
						item.GUID = itemEl.textContent;
					} else if (itemKey == "pubDate") { // For pubDate we also generate a Date for the UNIX epoch time it was created
						item.PubDate = itemEl.textContent;
						let date = new Date(item.PubDate); // Get the date
						item.Date = Math.round(date.getTime() / 1000); // Get the total ms and divide by 1000 to get seconds, total since epoch
					} else {
						let titleKey = feedie.TitleString(itemKey); // Titlize the item key
						item[titleKey] = itemEl.textContent; // Set the content for the item
					}
				}

				let itemCategories: NodeListOf<HTMLElement> = domItem.querySelectorAll("category"); // Get all categories
				item.Categories = []; // Set to an empty Array

				for (let category of itemCategories) { // For each category
					item.Categories.push({ // Push a new category
						Domain: category.getAttribute("domain") ?? "", // Set the domain to the value or an empty string if null
						Title: category.textContent // The text content of the category is the title of it
					});
				}

				let ItemEnclosures: NodeListOf<HTMLElement> = domItem.querySelectorAll("enclosure"); // Get all enclosures
				item.Enclosures = []; // Set to an empty Array

				for (let enclosure of ItemEnclosures) { // For each enclosure
					let enclosureLengthStr = enclosure.getAttribute("length") ?? "0"; // If length is defined, set as value, otherwise 0 len
					item.Enclosures.push({
						Length: Number(enclosureLengthStr),
						Type: enclosure.getAttribute("type") ?? "application/octet-stream", // Default to provided mimetype or just octet-stream (stream of bytes)
						URL: enclosure.getAttribute("url") ?? "", // Set to value or an empty string for URL
					});
				}

				this.Items.push(item); // Append the item
			};

			this.Items.reverse(); // Reverse our items in the end

			// #endregion

			this._callback(this); // Send self now that we're done parsing
		}
	}
}
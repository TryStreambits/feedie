# Feedie

Feedie is an open source JavaScript library for the fetching and parsing of RSS URLs.

This library is build using [Typescript](https://www.typescriptlang.org/) and targets ES2020, leveraging modernish features such as the Classes, Fetch API and Promises to provide an asynchronous process for the creation and processing of RSS URLs.

**This library will not provide shims or fallbacks for legacy browsers.**

## Download

We provide compressed tarballs via our [Releases](https://github.com/TryStreambits/feedie/releases) page. These tarballs provide our definition file and both uncompressed and compressed forms of Feedie.

## Specification

Feedie follows the [W3 RSS 2.0 Specification](https://validator.w3.org/feed/docs/rss2.html), however excludes the following parts of the specification as it was deemed in our opinions to not be useful for modern web usage and can easily be supplemented by separate functionality provided external to the library.

- `cloud` - Cloud is primarily useful for more complex Pub/Sub (subscribing for notifications on updates to the channel) that is outside the scope of this library.
- `skipHours` and `skipDays` are really only useful for aggregation and polling / scheduling can be done externally to this library.
- `textInput` - No meaningful usecase for this.

Building on this, we do not enforce a maximum height and width on the image sub-element of the channel, whereas the RSS 2.0 specification defines a maximum value of 144 for width and maximum height of 400. These restrictions didn't even make sense back in 2002.

## Usage

Please check our [Wiki](https://github.com/TryStreambits/feedie/wiki) for usage.

---

## License

Feedie is licensed under the Apache-2.0 license. Please read the LICENSE.md file provided in this repository.
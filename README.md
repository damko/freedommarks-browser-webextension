# Browser extension for Nextcloud Bookmarks

This is a cross-browser extension for [Nextcloud Bookmarks](https://github.com/nextcloud/bookmarks), a very popular bookmark application for Nextcloud.

It allows you to add, search and delete your Nextcloud Bookmarks.

This extension does not synchronize your browser bookmarks with Nextcloud Bookmarks and it will never perform any kind of synchronization between the browser and Nextcloud.

It has been tested on Firefox and Chrome but it **should** work also on Opera, Safari and Microsoft Edge.

_Note: this extension doesn't work on OwnCloud but you can fork this repo and modify the code accordingly_

## Available features

* it adds new bookmarks
* it lists latest bookmarks
* it searches for text among the bookmarks' title and description
* it searches bookmarks by tag or by a tags combination (like 'tag1 AND tag2 AND tag3' and 'tag1 OR tag2 OR tag3')
* it deletes a bookmark
* you can choose if you want to display first the bookmark form or the search form

## Missing features

* it can not search for a bookmark starting from a URL (API lacks the method)
* it can not retrieve the list of already set tags (API lacks the method)
* it does not edit a bookmark
* it lacks a translation (localization) system
* it lacks translations

# Disclaimer

This extension is **ready for production** but, of course, it can have bugs.

# Screenshots

![add_bookmark](https://github.com/damko/freedommarks-browser-webextension/blob/master/screenshots/screenshot-freedommarks-add_bookmark.jpg)

![save_bookmark](https://github.com/damko/freedommarks-browser-webextension/blob/master/screenshots/screenshot-freedommarks-save_bookmark.png.jpg)

![search_by_tag](https://github.com/damko/freedommarks-browser-webextension/blob/master/screenshots/screenshot-freedommarks-search_by_tag.jpg)

![search_by_tags_AND](https://github.com/damko/freedommarks-browser-webextension/blob/master/screenshots/screenshot-freedommarks-search_by_tags_AND.jpg)

![search_by_tags_OR](https://github.com/damko/freedommarks-browser-webextension/blob/master/screenshots/screenshot-freedommarks-search_by_tags_OR.jpg)

## Firefox screenshots

![firefox_extensions_list](https://github.com/damko/freedommarks-browser-webextension/blob/master/screenshots/screenshot-freedommarks-firefox_extensions_list.jpg)

![firefox_options](https://github.com/damko/freedommarks-browser-webextension/blob/master/screenshots/screenshot-freedommarks-firefox_options.jpg)

## Chrome screenshots
Update 2018-02-28. Please don't use this extension for now. I didn't have the time to update it yet.

![chrome_options](https://github.com/damko/freedommarks-browser-webextension/blob/master/screenshots/screenshot-freedommarks-chrome_options.jpg)

# Help needed

I'd love to have any kind of feedback on this extension.

If you are a developer have a look at the code and please open issues or send greatly appreciated PRs.

If you are not a developer please open issues and tell me what's not working for you.

Thank you!

# Installation

## Server side

Update 2018-02-28: no changes are required on server side at the moment. Be sure you are running Nextcloud 12.04 or 12.05 and everything should work fine

## Client side (browser)

**Firefox**
You can install the Firefox AddOn from the [Mozilla Webstore](https://addons.mozilla.org/en-US/firefox/addon/freedommarks/)

**Chrome**
Update @2017-01-16: You can install the Chrome Extension from the [webstore](https://chrome.google.com/webstore/detail/freedommarks/gmmpjoepfelkmeedfkfkadgkhholibko)
Update 2018-02-28. Please don't use this extension for now. I didn't have the time to update it yet.

> **Don't forget to configure the addon settings:**
* URL of your Nextcloud server
* Nextcloud username
* Nextcloud password


## If you want to modify or debug this extension:

Clone this extension repository in your pc:

    git clone git@github.com:damko/freedommarks-browser-webextension.git

Open Firefox and paste this `about:debugging` in the URL bar

Click on the `Load Temporary Add-on` button and select the `freedommarks-browser-webextension/src/manifest.json` file

Click `Open`

Paste this `about:addons` in the URL bar and you will see the FreedomMarks extension listed among the others

Click on the button `Preferences` on the right of FreedomMarks and fill in the form with:

* URL of your Nextcloud server
* Nextcloud username
* Nextcloud password

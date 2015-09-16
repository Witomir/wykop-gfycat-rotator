function injectScript(clickedTab) {
	var newURL = "http://gfycat.com";
    chrome.tabs.create({url: newURL}, function (tab) {
		chrome.tabs.executeScript(tab.id, {
			file: 'gfycat.js'
		});
    });
}

chrome.browserAction.onClicked.addListener(injectScript);
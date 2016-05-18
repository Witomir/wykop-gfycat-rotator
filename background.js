function injectScript(clickedTab) {
    /**
     * Otwieramy nowa kartę w kórej będą rotowały się gify i wstrzykujemy na nią skrypt rozszerzenia
     */
	var newURL = "http://www.warnerbros.com/archive/spacejam/movie/jam.htm";
    chrome.tabs.create({url: newURL}, function (tab) {
		chrome.tabs.executeScript(tab.id, {
			file: 'gfycat.js'
		});
    });
}

chrome.browserAction.onClicked.addListener(injectScript);

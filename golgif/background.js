function injectScript(clickedTab) {
    /**
     * Otwieramy nowa kartę w kórej będą rotowały się gify i wstrzykujemy na nią skrypt rozszerzenia
     * Musi być to strona gfycat.com żeby zastąpić jej content przez iframe w którym będą odtwarzały się
     * gify z tej domeny. Dzięki temu można manipulować skryptami wewnątrz iframe (np. zrobić double click na gifie,
     * żeby go powiększyć na fullscreen) a przeglądarka nie będzie zgłaszać zagrożenia bezpieczeństwa
     * @link https://en.wikipedia.org/wiki/Same-origin_policy
     */
	var newURL = "http://gfycat.com";
    chrome.tabs.create({url: newURL}, function (tab) {
		chrome.tabs.executeScript(tab.id, {
			file: 'gfycat.js'
		});
    });
}

chrome.browserAction.onClicked.addListener(injectScript);
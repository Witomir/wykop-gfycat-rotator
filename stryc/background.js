chrome.browserAction.setIcon({path:"ball.ico"});

function injectScript(tab) {

    chrome.browserAction.setIcon({path:"icon" + Math.random()%5 + ".png"});
	if(tab)
	{
		chrome.tabs.executeScript(tab.id, {
			file: 'gfycat.js'
		});
	}

}

chrome.browserAction.onClicked.addListener(injectScript);
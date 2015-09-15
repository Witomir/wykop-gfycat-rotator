// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.browserAction.setIcon({path:"stryc.png"});

function updateIcon(tab) {

	if(tab)
	{
		chrome.tabs.executeScript(tab.id, {
			file: 'stryc.js'
		});	
	}
	  
}

chrome.browserAction.onClicked.addListener(updateIcon);
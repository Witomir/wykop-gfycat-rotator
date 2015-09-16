var App = function(appKey, tag){
    var key = appKey;
    var wykopTag = tag;
    var apiSrc = 'http://a.wykop.pl/';
    var gfycatApiUrl = 'http://gfycat.com/cajax/get/';
    var apiUri = apiSrc + 'tag/' + 'Entries/' + wykopTag + '/appkey,' + key + ',page,';
    var gfycatRegex = /http\:\/\/gfycat\.com\/[a-zA-Z]*/g;
    var gfycatNameRegex = /gfycat\.com\/([a-zA-Z]*)/g;
    var gifs = [];
    var maxApiPages = 4;
    var processedPages = 0;
    var iframe = {};
    var repeatFrequency = 20 * 1000;
    var appSheduledJob;
    var isStarted = false;

    (function prepareIframe(){
        iframe = document.createElement('iframe');
        iframe.id = 'gfyiframe';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
    })();

    var doubleClickGfy =  function (argument) {
        var iframeDocument = iframe.contentDocument;
        var video = iframeDocument.getElementById('gfyVid1');
        var event = new MouseEvent('dblclick', {
            'view': iframe.contentWindow,
            'bubbles': true,
            'cancelable': true
        });
        video.dispatchEvent(event);
    }

    function startApp(index) {
        isStarted = true;
        iframe.src = gifs[index]['url'];
        var length = gifs[index]['length'];

        document.replaceChild(iframe, document.documentElement);
        iframe.onload = doubleClickGfy;
        var timeout = length > 0 ? length : repeatFrequency;
        if (index == gifs.length) {
            index = -1;
        }
        index++;
        appSheduledJob = setTimeout(function(){startApp(index)}, timeout)
    }


    this.isStarted = function(){
        return isStarted;
    }

    this.stopApp = function(){
        isStarted = false;
        clearTimeout(appSheduledJob);
    }

    function parseGfycatResponse(response) {
        if(this.readyState == XMLHttpRequest.DONE && this.status==200) {
            response = JSON.parse(this.responseText);
            if(response.items !== null && response.items !== undefined){
                for(var i = 0; i < response.items.length; i++){
                    prepareEntry(response.items[i]);
                }
            }
        }
    }

    function fetchGfyInfo(url, gfyInfo) {
        var gfycatNameRegex = /gfycat\.com\/([a-zA-Z]*)/g;
        var gfyName = gfycatNameRegex.exec(url);
        gfyName = gfyName[1];

        //doAjax(gfycatApiUrl + gfyName, parseGfycatResponse);
    }

    function addGfy(url) {
        gfyInfo = {
            'url': url,
            'length': 0
        };
        fetchGfyInfo(url, gfyInfo);
        gifs.push(gfyInfo);
    }

    function doAjax(url, responseHandler) {
        var url = url || "";
        var method =  "GET";
        var async =  true;

        if (url != "") {
            var xmlHttpRequst = new XMLHttpRequest();
            xmlHttpRequst.open(method, url, async);
            xmlHttpRequst.onreadystatechange = responseHandler;
            xmlHttpRequst.send();
        }
    }

    function prepareEntry(entry) {
        var gfysInEntrysBody = gfycatRegex.exec(entry.body);
        if(gfysInEntrysBody && gfysInEntrysBody.length > 0){
            gfysInEntrysBody.every(function(oneMatch){
                addGfy(oneMatch);
            });
        }

        var embedSrc = "";
        if(entry.embed !== null) {
            embedSrc = entry.embed.source;
            var gfysInEntrysEmbed = gfycatRegex.exec(embedSrc);
            if(gfysInEntrysEmbed && gfysInEntrysEmbed.length > 0) {
                addGfy(gfysInEntrysEmbed[0]);
            }
        }
    }

    function parseWykopResponse(response) {
        if(this.readyState == XMLHttpRequest.DONE && this.status==200) {
            processedPages++;
            response = JSON.parse(this.responseText);
            if(response.items !== null && response.items !== undefined){
                for(var i = 0; i < response.items.length; i++){
                    prepareEntry(response.items[i]);
                }
            }
            if(processedPages >= maxApiPages) {
                return startApp(0);
            }
        }
    }


    function loadData(page, maxPages){
        for(; page <= maxPages; page++) {
            doAjax(apiUri + page, parseWykopResponse);
        }
    };

    loadData(1, maxApiPages);
}

if(GolgifApp === undefined || GolgifApp.isStarted() === false) {
    var GolgifApp = new App('wTUUF5swmD', 'golgif');
}
else {
    GolgifApp.stopApp();
}

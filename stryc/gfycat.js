var App = function(appKey, tag){
    var key = appKey;
    var wykopTag = tag;
    var apiSrc = 'http://a.wykop.pl/';
    var apiUri = apiSrc + 'tag/' + 'Entries/' + wykopTag + '/appkey,' + key + ',page,';
    var gfycatRegex = /http\:\/\/gfycat\.com\/[a-zA-Z]*/g;
    var gifs = [];
    var maxApiPages = 1;
    var processedPages = 0;
    var iframe = {};
    var timeout = 20* 1000;
    var appSheduledJob;
    var isStarted = false;

    (function prepareIframe(){
        iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
    })();

    function startApp(index) {
        isStarted = true;
        iframe.src = gifs[index];
        document.replaceChild(iframe, document.documentElement);
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
               gifs.push(oneMatch);
            });
        }

        var embedSrc = "";
        if(entry.embed !== null) {
            embedSrc = entry.embed.source;
            var gfysInEntrysEmbed = gfycatRegex.exec(embedSrc);
            if(gfysInEntrysEmbed && gfysInEntrysEmbed.length > 0) {
                gifs.push(gfysInEntrysEmbed[0]);
            }
        }
    }

    function parseResponse(response) {
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


    function loadData(){
        for(var page=1; page<=maxApiPages; page++) {
            doAjax(apiUri + page, parseResponse);
        }
    };

    loadData();
}

if(GolgifApp === undefined || GolgifApp.isStarted() === false) {
    var GolgifApp = new App('wTUUF5swmD', 'golgif');
}
else {
    GolgifApp.stopApp();
}

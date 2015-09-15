var src = 'http://a.wykop.pl/';
var key = 'wTUUF5swmD';
var secret = 'KQybDSgldp';
var tag = 'golgif';
var link = src + 'tag/' + 'Entries/' + tag + '/appkey,' + key + ',page,';
var gfycatRegex = /http\:\/\/gfycat\.com\/[a-zA-Z]*/g;
var gifs = [];
var maxPages = 1;
var iframe = document.createElement('iframe');
iframe.style.width = '100%';
iframe.style.height = '100%';

function startApp(index) {
    iframe.src = gifs[index];
    document.replaceChild(iframe, document.documentElement);
    if (index == gifs.length) {
        index = -1;
    }
    index++;
    setTimeout(function(){startApp(index)}, 25000)
}


function loadData(){
    for(var page=1; page<=maxPages; page++){
        doAjax(link + page, function(resp) {
            console.log(resp);
            console.log(this.readyState);
            if(this.readyState == 4 && this.status==200) {
                resp = JSON.parse(this.responseText);
                if(resp.items !== null && resp.items !== undefined){
                    for(var i = 0; i < resp.items.length; i++){
                        var entry = resp.items[i];
                        var match = gfycatRegex.exec(entry.body);
                        if(match && match.length > 0){
                            match.every(function(oneMatch){
                               gifs.push(oneMatch);
                            });
                            gifs.push(match[0]);
                        }
                        var embedSrc = "";
                        if(entry.embed !== null) {
                            embedSrc = entry.embed.source;
                            var embedMatch = gfycatRegex.exec(embedSrc);
                            if(embedMatch && embedMatch.length > 0) {
                                gifs.push(embedMatch[0]);
                            }
                        }
                    }
                }
            }
            console.log(gifs.length);
            if(page >= maxPages) {
                startApp(0);
            }
        })
    };
}

function doAjax(url, responseHandler) {
    debugger;
    var url = url || "";
    var method =  "GET";
    var async =  true;

    if (url == "") {
        alert("URL can not be null/blank");
        return false;
    }
    var xmlHttpRequst = new XMLHttpRequest();
    xmlHttpRequst.open(method, url, async);
    xmlHttpRequst.onreadystatechange = responseHandler;
    xmlHttpRequst.send();
}
loadData();


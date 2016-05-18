/**
 * Pobiera wpisy z mirko spod podanego tagu, szuka w nich linków do gfycat.com i rotuje
 * znalezione gify. Po zakończeniu kolejki, pobiera nowe dane i dalej rotuje.
 * @param appKey
 * @param tag
 * @constructor
 */
var App = function(appKey, tag){

    /**
     * twój klucz API
     */
    var key = appKey;

    /**
     * nazwa tagu wykopowego spod którego będziemy pobierać gify
     */
    var wykopTag = tag;

    /**
     * Ilość stron wpisów do pobrania z mirko
     */
    var maxApiPages = 4;

    /**
     * Co jaki czas przełączać gify
     */
    var repeatFrequency = 20 * 1000;

    var apiSrc = 'http://a.wykop.pl/';
    var gfycatApiUrl = 'https://api.gfycat.com/v1/oembed?url=';
    var apiUri = apiSrc + 'tag/Entries/' + wykopTag + '/appkey,' + key + ',page,';
    var gfycatRegex = /https*\:\/\/gfycat\.com\/[a-zA-Z]*/g;
    var gfycatNameRegex = /gfycat\.com\/([a-zA-Z]*)/g;
    var gfycatVideoElementId = 'share-video';
    var gifs = [];
    var processedPages = 0;
    var iframe = {};
    var appSheduledJob;
    var isStarted = false;
    var stopApp = {};

    /**
     * @constructor
     */
    function App(){
        clearGfys();
        loadData(1, maxApiPages);
    };
    App();

    /**
     * Publiczna funkcja którą można sprawdzić, czy apka rozpoczęła już rotację filmików
     * @returns {boolean}
     */
    this.isStarted = function(){
        return isStarted;
    }

    /**
     * Publiczna funkcja, która zatrzymuje rotację filmików
     */
    this.stopApp = stopApp = function(){
        isStarted = false;
        clearTimeout(appSheduledJob);
    }

    /**
     * Pobiera wpisy spod podanego aplikacji tagu
     * @param page
     * @param maxPages
     */
    function loadData(page, maxPages){
        for(; page <= maxPages; page++) {
            doAjax(apiUri + page, parseWykopResponse);
        }
    };

    /**
     * Wołana gdy już załadują się dane i można zacząć rotować filmiki
     * @param index
     */
    function startApp(index) {
        isStarted = true;
        if (index == gifs.length) {
            stopApp();
            return App();
        }
        playGfy(gifs[index]);
        index++;
        appSheduledJob = setTimeout(function(){startApp(index)}, repeatFrequency);
    }

    function playGfy(gif){
        doAjax(gfycatApiUrl + gif.url, function(){
            if(this.readyState == XMLHttpRequest.DONE && this.status==200) {
                response = JSON.parse(this.responseText);
                if(response.html !== undefined){
                    document.documentElement.innerHTML = response.html;
                }
            }
        });
    }

    /**
     * Dodaje linka do gfy do puli linków z których będzie korzystała aplikacja
     * @param url
     */
    function addGfy(url) {
        gfyInfo = {
            'url': url,
            'length': 0
        };
        gifs.push(gfyInfo);
    }

    /**
     * Czyści kolejkę gifów
     */
    function clearGfys(){
        gifs = [];
    }

    /**
     * Bardzo uproszczony pobieracz AJAXowy
     * @param url
     * @param responseHandler
     */
    function doAjax(url, responseHandler) {
        var url = url || "";
        var method =  "GET";
        var async =  true;

        if (url !== "") {
            var xmlHttpRequst = new XMLHttpRequest();
            xmlHttpRequst.open(method, url, async);
            xmlHttpRequst.onreadystatechange = responseHandler;
            xmlHttpRequst.send();
        }
    }

    /**
     * Szuka linków do gfycatów w treści wpisu i w załączniku
     * @param string entry treść wpisu
     */
    function prepareEntry(entry) {
        var gfysInEntrysBody = gfycatRegex.exec(entry.body);
        if(gfysInEntrysBody && gfysInEntrysBody.length > 0){
            gfysInEntrysBody.every(function(oneMatch){
                addGfy(oneMatch);
            });
        }

        var embedSrc = "";
        if(entry.embed !== null && entry.embed !== undefined) {
            embedSrc = entry.embed.source;
            var gfysInEntrysEmbed = gfycatRegex.exec(embedSrc);
            if(gfysInEntrysEmbed && gfysInEntrysEmbed.length > 0) {
                addGfy(gfysInEntrysEmbed[0]);
            }
        }
    }

    function handleApiError(responseError) {
        stopApp();
        alert('Błąd pobierania strony wpisów: ' + processedPages + ', ' + responseError.message);
    }

    /**
     * Parsuje JSON od wykopu i jeśli wczytała się ostatnia ze stron, startuje rotowanie gifów
     * @param response
     */
    function parseWykopResponse(response) {
        if(this.readyState == XMLHttpRequest.DONE && this.status==200) {
            processedPages++;
            response = JSON.parse(this.responseText);
            // response = {items: [{body: "http://gfycat.com/AchingVastAfricancivet"}, {body: "https://gfycat.com/MeaslyOddballKinkajou"}]};
            if(response.error !== undefined ){
                return handleApiError(response.error);
            }

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
}


if(GolgifApp === undefined || GolgifApp.isStarted() === false) {
    var GolgifApp = new App(alert('Podmień tego alerta na swój własny klucz API wykopu'), 'golgif');
}
else {
    GolgifApp.stopApp();
}

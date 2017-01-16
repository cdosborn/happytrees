var store = new HugeStorageSync();
function Stream(initial) {
    var reducers = [];
    var state = initial;
    return {
        reduce: function(reducer) {
            reducers.push(reducer);
        },
        fire: function(type, payload) {
            var event = new Event(type, payload);
            state = reducers.reduce(function(acc, reducer) {
                return reducer(event, acc);
            }, state);
        }
    }
}

function Event(type, payload) {
    return {
        type: type,
        payload: payload,
        timestamp: Date.now()
    }
}

function randomElement(arr) {
    return arr[Math.floor(Math.random()*arr.length)];
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function getDomainName(url) {
    var domain;

    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// This is the stream that sets localstorage, it's what triggers renders
var renderStream;

var maxTreeHeight = 30;

// From https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
function stringToColor(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}

function initDomain(url) {
    return {
        totalTime: 0,
        type: 'tree',
        x: 50,
        y: 10,
        width: 10,
        height: 10,
        theme: stringToColor(getDomainName(url)),
        key: url
    }
}

// Set initial state, we will want to tweak this when we release
// store.set("log", []);

// Get the current tab, build initial state
chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {

    // Setup inital state
    var activeTab = arrayOfTabs && arrayOfTabs[0];
    var initialRenderState = {
        domains: {},
        activeTab: {
            tabUrl: activeTab.url,
            timestamp: Date.now()
        },
    };
    initialRenderState.domains[activeTab.url] = initDomain(activeTab.url);

    // Get storage object with log key
    store.get('log', function(log) {

        window.log = log;

        var lastRenderState = log[log.length - 1] || initialRenderState;
        renderStream = new Stream(lastRenderState);

        renderStream.reduce(function(event, state) {
            var newState = state;

            if (event.type == "tabChange") {
                newState = deepClone(state);
                var stateDomains = state.domains;
                var tabUrl = state.activeTab.tabUrl;
                var domain = stateDomains[tabUrl];
                var tabStart = state.activeTab.timestamp;
                var tabEnd = event.timestamp;

                if (!domain) {
                    domain = initDomain(tabUrl);
                    newState.domains[tabUrl] = domain;
                }
                domain.totalTime += tabEnd - tabStart;
                domain.width = Math.sqrt(domain.totalTime/1000) + 10;
                domain.height = Math.sqrt(domain.totalTime/1000) + 10;

                var newUrl = event.payload.tab.url;
                if (!newState.domains[newUrl]) {
                    var newDomain = initDomain(newUrl);
                    var domainName = getDomainName(newUrl);
                    var urls = Object.keys(newState.domains);

                    var similarUrls = urls.filter(function(url) {
                        return getDomainName(url) == domainName;
                    });

                    // Create a tree next to a tree with the same domain
                    if (similarUrls.length > 0) {
                        var c = 7;
                        var randTreeWithSameDomain = newState.domains[randomElement(similarUrls)];
                        newDomain.x = randTreeWithSameDomain.x - c + Math.random()*2*c;
                        newDomain.y = Math.min(randTreeWithSameDomain.y - c + Math.random()*2*c, maxTreeHeight);

                    // Create a tree at a random distance
                    } else {
                        newDomain.x = 15 + Math.random() * 70;
                        newDomain.y = 5 + Math.random() * (maxTreeHeight - 10);
                    }

                    newState.domains[newUrl] = newDomain;
                }

                newState.activeTab = {
                    tabUrl: newUrl,
                    timestamp: tabEnd
                };
            }

            return newState;
        });

        // Remove any domains matching chrome://
        renderStream.reduce(function(event, state) {
            var newState = deepClone(state);

            var urls = Object.keys(newState.domains);
            var nonChromeUrls = urls.filter((url) => !/^chrome:\/\//.test(url));
            newState.domains = {};
            nonChromeUrls.forEach((url) => {
                newState.domains[url] = state.domains[url];
            })

            return newState;
        });

        // Trim/push the log
        renderStream.reduce(function(event, state) {
            if (log.length > 2) {
                log = log.slice(log.length - 2);
                window.log = log;
            }
            log.push(state);
            store.set('log', log);
            return state;
        });

        chrome.tabs.onActivated.addListener(function(activeInfo) {
            var tabId = activeInfo.tabId;
            chrome.tabs.get(tabId, function(tab) {
                renderStream.fire("tabChange", { tab: tab });
            })
        });
    });
});

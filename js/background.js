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

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// This is the stream that sets localstorage, it's what triggers renders
var renderStream;

var maxTreeHeight = 20;

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
        theme: stringToColor(url),
        key: url
    }
}

// Set initial state, we will want to tweak this when we release
store.set("log", []);

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
                newState.domains[tabUrl].totalTime = domain.totalTime + tabEnd - tabStart;
                newState.domains[tabUrl].width = Math.sqrt(domain.totalTime/1000) + 10;
                newState.domains[tabUrl].height = Math.sqrt(domain.totalTime/1000) + 10;

                var newUrl = event.payload.tab.url;
                if (!newState.domains[newUrl]) {
                    var newDomain = initDomain(newUrl);
                    if (Math.random() < .92) {
                        newDomain.x = Math.random()*100;
                        newDomain.y = Math.random()*maxTreeHeight;
                    }
                    else {
                        var urls = Object.keys(newState.domains);
                        var randTree = newState.domains[urls[Math.floor(Math.random()*urls.length)]];
                        newDomain.x = randTree.x - 10 + Math.random()*20;
                        newDomain.y = Math.min(randTree.y - 10 + Math.random()*20, maxTreeHeight);
                    }
                    newState.domains[newUrl] = newDomain;
                }
                
                newState.activeTab = {
                    tabUrl: newUrl,
                    timestamp: tabEnd
                };
            }

            if (log.length > 2) {
                log = log.slice(log.length - 2);
                window.log = log;
            }
            log.push(Object.keys(newState.domains).map(k => newState.domains[k]));
            store.set('log', log);
            return newState;
        });

        chrome.tabs.onActivated.addListener(function(activeInfo) {
            var tabId = activeInfo.tabId;
            chrome.tabs.get(tabId, function(tab) {
                renderStream.fire("tabChange", { tab: tab });
            })
        });
    });
});

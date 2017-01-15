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

var initialStorage = {
    log: []
};


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

function stringToCoords(str) {
    var hash1 = 0;
    var hash2 = 0;
    for (var i = 0; i < str.length; i++) {
        hash1 = str.charCodeAt(i) + ((hash1 << 5) - hash1);
        hash2 = str.charCodeAt(i) + ((hash2 << 7) - hash2);
    }

    var x = Math.abs(hash1 % 100);
    var y = Math.abs(hash2 % 20) + 30;
    return {x, y};
}

// Set initial state, we will want to tweak this when we release
chrome.storage.sync.set(initialStorage);

// Get the current tab, build initial state
chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {

    // console.log(arrayOfTabs);
    // Setup inital state
    var activeTab = arrayOfTabs && arrayOfTabs[0];
    var initialRenderState = {
        domains: {},
        activeTab: {
            tabUrl: activeTab.url,
            timestamp: Date.now()
        },
    };
    initialRenderState.domains[activeTab.url] = {
        totalTime: 0
    };

    // Get storage object with log key
    chrome.storage.sync.get('log', function(storage) {

        var log = storage.log;

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
                newState.domains[tabUrl] = {
                    totalTime: domain.totalTime + tabEnd - tabStart
                };

                var newUrl = event.payload.tab.url;
                newState.domains[newUrl] = {
                    totalTime: 0
                };
                newState.activeTab = {
                    tabUrl: newUrl,
                    timestamp: tabEnd
                };
            }

            return newState;
        });

        renderStream.reduce(function(event, state) {
            var domains = state.domains;
            var newState = Object.keys(domains).map(function(url) {
                return {
                    type: 'tree',
                    x: stringToCoords(url).x,
                    y: stringToCoords(url).y,
                    width: domains[url].totalTime/100,
                    height: domains[url].totalTime/100,
                    theme: stringToColor(url),
                    key: url
                }
            });

            if (log.length > 10) {
                log = log.slice(log.length - 10);
            }
            log.push(newState);
            chrome.storage.sync.set({'log' : log});
            return state;
        });

        chrome.tabs.onActivated.addListener(function(activeInfo) {
            var tabId = activeInfo.tabId;
            chrome.tabs.get(tabId, function(tab) {
                console.log("What is the tab's url?", tab.url);
                renderStream.fire("tabChange", { tab: tab });
            })
        });
    });
});

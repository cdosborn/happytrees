// // Called when the user clicks on the browser action.
// chrome.browserAction.onClicked.addListener(function(tab) {
//   // No tabs or host permissions needed!
//   console.log('Turning ' + tab.url + ' red!');
//   chrome.tabs.executeScript({
//     code: 'document.body.style.backgroundColor="red"'
//   });
// });

// chrome.runtime.onConnect.addListener(function(port) {
//     console.log("We've connected to a content script");
//     port.onMessage.addListener(function(msg) {
//         console.log("event script received msg:" + msg);
//         port.postMessage({ type: "hello", timestamp: new Date(), payload: {}});
//     });
// });

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


// Themes for the trees
var themes = ['red', 'blue', 'orange', 'purple', 'brown', 'pink', 'black', 'white', 'yellow', 'cyan', 'magenta']

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
            // log.push(state);
            // chrome.storage.sync.set({'log' : log});
            // return state;
            var newState = []
            var maxWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            var maxHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

            for (var url in Object.keys[state.domains]) {
                newState.push({
                    type: 'tree',
                    x: getRandomInt(0, maxWidth),
                    y: getRandomInt(0, maxHeight),
                    width: domain[url].totalTime/4000,
                    height: domain[url].totalTime/1000,
                    theme: themes[getRandomInt(0, themes.length)],
                    key: url
                })
            }
            chrome.storage.sync.set({'log' : newState});
            return newState;
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

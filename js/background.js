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

// This is the stream that sets localstorage, it's what triggers renders
var renderStream;

var initialStorage = {
    log: []
};

var initialRenderState = {
    domains: {},
    activeTab: {
        tabUrl: null,
        timestamp: Date.now() 
    },
};

// Set initial state, we will want to tweak this when we release
chrome.storage.sync.set(initialStorage);

// Get storage object with log key
chrome.storage.sync.get('log', function(storage) {
    
    var log = storage.log;

    // REMOVE ME
    window.log = log;

    var lastRenderState = log[log.length - 1] || initialRenderState;
    renderStream = new Stream(lastRenderState);

    renderStream.reduce(function(event, state) {
        var newState = state;
        if (event.type == "tabChange") {
            newState = deepClone(state);
            var stateDomains = state.domains;
            var tabUrl = state.activeTab.tabUrl;
            if (tabUrl) {
               var domain = stateDomains[tab.url];
               var newTotalTime;
               var tabStart = state.activeTab.timestamp;
               var tabEnd = event.timestamp;
               if (domain && domain.totalTime != null) {
                   newTotalTime = domain.totalTime + tabEnd - tabStart;
                   newState.domains[tabUrl].totalTime = newTotalTime; 
                   newState.activeTab = {
                       tabUrl: tabUrl,
                       timestamp: tabEnd
                   };
               }
               
            }
            
        } 

        return newState;
    });
    renderStream.reduce(function(event, state) {
        log.push(state);
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


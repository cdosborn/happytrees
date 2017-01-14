// // Create a port with the connection
// var port = chrome.runtime.connect({name: "knockknock"});

// // Send message (event)
// port.postMessage({ type: "hello", timestamp: new Date(), payload: {}});

// // Listen for messages
// port.onMessage.addListener(function(msg) {
//     console.log("content script received msg:" + msg);   
// });

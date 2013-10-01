/**
 * Because of this Chromium bug (https://code.google.com/p/chromium/issues/detail?id=234497)
 * we are unable to use chrome.storage API in the context, other than background page.
 * Luckily, we can work around this issue with the help of the chrome.runtime API:
 */


chrome.runtime.onConnect.addListener(function(port) {
  if(port.name == "chrome.storage port"){
    port.onMessage.addListener(function(msg) {
      
      var obj = chrome.storage.sync    // chrome.storage.local ?
        , method = obj[msg.method]     // 'get' or 'set'
        , keys = msg.keys
        , message_id = msg.message_id;

      method.call(obj, keys, function(items){
        items = items || {};
        items.message_id = message_id;
        port.postMessage(items);
      })
    });
  }else if(port.name == "chrome.webNavigation port"){
    port.onMessage.addListener(function(msg) {
      webNavigationListeners[msg.tabId] = port;
    });
  }
});


/**
 * The same thing, we can't access chrome.webNavigation API directly from devtools panel
 */

var webNavigationListeners = {};

chrome.webNavigation.onBeforeNavigate.addListener(function(details){
  if(details.parentFrameId == -1){ // which means this is the main frame
    var port = webNavigationListeners[details.tabId];
    if(port){
      port.postMessage(details);
    }
  }
});
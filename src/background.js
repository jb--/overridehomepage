const maxWindowAge = 15; // seconds

const windowStartupEvents = {};
const windowTabClosedEvents = {};


const windowAgeInSeconds = (windowId) => {
  const now = new Date().getTime();
  const windowCreatedTime = windowStartupEvents[windowId] || now;
  const ageInSeconds = (now - windowCreatedTime) / 1000;
  return ageInSeconds;
}

chrome.windows.onCreated.addListener((window) => {
  windowStartupEvents[window.id] = new Date().getTime();
});

const killTheTab = (tab, newPage) => {
  const tabId = tab.id;
  const windowId = tab.windowId;
  // if the window id is in windowClosedTabEvents then close it
  if (windowId in windowTabClosedEvents) {
    console.log("Window is in windowTabClosedEvents, closing it", tab);
    chrome.tabs.remove(tabId, () => {
    });
  }
  else {
    console.log("Window is not in windowTabClosedEvents, updating it", tab);
    windowTabClosedEvents[windowId] = true;
    chrome.tabs.update(tabId, { url: newPage }, () => {
    });
  }
};



chrome.tabs.onCreated.addListener((tab) => {
  const tabId = tab.id;
  const windowAge = windowAgeInSeconds(tab.windowId);
  if (windowAge > maxWindowAge) {
    console.log("Window is too old, not doing anything", tab);
    return;
  }
  console.log("windowAge", windowAge);


  chrome.storage.sync.get(['urls', 'targetUrl'], (result) => {
    console.log("tried to get stuff from local storage", result);
    const urls = result.urls || [];
    const targetUrl = result.targetUrl || "index.html";
    // if both values are non empty continue
    if (targetUrl.length == 0) {
      console.log("Urls and TargetURL need to be configured");
      return;
    }
    if (urls.length == 0) {
      const windowId = tab.windowId;
      if (!(windowId in windowTabClosedEvents)) {
        windowTabClosedEvents[windowId] = true;
        chrome.tabs.update(tabId, { url: targetUrl }, () => {});
      }
    }
    console.log(tab);
    const currentTabHostname = new URL(tab.pendingUrl).hostname;
    // for every url in the list compare against the current tab - if it matches close it
    urls.forEach((url) => {
      console.log("Comparing", currentTabHostname, url);
      const urlHostname = new URL(url).hostname;
      if (currentTabHostname === urlHostname) {
        killTheTab(tab, targetUrl);
      }
    });
  });
});
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    function: openColorChanger
  });
});

function openColorChanger() {
  const bgColor = prompt("Enter background color (e.g., #ff0000 or red):", "#ffffff");
  const btnColor = prompt("Enter button color (e.g., #ff0000 or red):", "#ffffff");
  if (bgColor && btnColor) {
    applyColors(bgColor, btnColor);
    chrome.storage.sync.set({ backgroundColor: bgColor, buttonColor: btnColor });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["backgroundColor", "buttonColor"], ({ backgroundColor, buttonColor }) => {
    if (backgroundColor && buttonColor) {
      chrome.tabs.query({url: "*://*.lyntr.com/*"}, (tabs) => {
        tabs.forEach(tab => {
          chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: applyColors,
            args: [backgroundColor, buttonColor]
          });
        });
      });
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('lyntr.com')) {
    chrome.storage.sync.get(["backgroundColor", "buttonColor"], ({ backgroundColor, buttonColor }) => {
      if (backgroundColor && buttonColor) {
        chrome.scripting.executeScript({
          target: {tabId: tabId},
          func: applyColors,
          args: [backgroundColor, buttonColor]
        });
      }
    });
  }
});

function applyColors(bgColor, btnColor) {
  document.body.style.backgroundColor = bgColor;
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.style.backgroundColor = btnColor;
    button.style.color = "#fff"; 
  });
}

document.getElementById("applyColorButton").addEventListener("click", () => {
  const bgColor = document.getElementById("bgColorInput").value;
  const textColor = document.getElementById("textColorInput").value;
  const btnColor = document.getElementById("btnColorInput").value;
  const logoInput = document.getElementById("logoInput");
  const logoFile = logoInput.files[0];

  if (bgColor || textColor || btnColor || logoFile) {
    if (logoFile) {
      const reader = new FileReader();
      reader.onloadend = function() {
        const logoDataUrl = reader.result;
        applyChanges(bgColor, textColor, btnColor, logoDataUrl);
        storeSettings(bgColor, textColor, btnColor, logoDataUrl);
      };
      reader.readAsDataURL(logoFile);
    } else {
      applyChanges(bgColor, textColor, btnColor, null);
      storeSettings(bgColor, textColor, btnColor, null);
    }
  }
});

document.getElementById("resetButton").addEventListener("click", () => {
  chrome.storage.sync.clear();
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      function: resetToDefault
    });
  });
});

function applyChanges(bgColor, textColor, btnColor, logoDataUrl) {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      function: applyColors,
      args: [bgColor, textColor, btnColor, logoDataUrl]
    });
  });
}

function storeSettings(bgColor, textColor, btnColor, logoDataUrl) {
  chrome.storage.sync.get(["backgroundColor", "textColor", "buttonColor", "logoDataUrl"], (data) => {
    let newSettings = {};
    if (bgColor) newSettings.backgroundColor = bgColor;
    else newSettings.backgroundColor = data.backgroundColor;

    if (textColor) newSettings.textColor = textColor;
    else newSettings.textColor = data.textColor;

    if (btnColor) newSettings.buttonColor = btnColor;
    else newSettings.buttonColor = data.buttonColor;

    if (logoDataUrl) newSettings.logoDataUrl = logoDataUrl;
    else newSettings.logoDataUrl = data.logoDataUrl;

    chrome.storage.sync.set(newSettings);
  });
}

function applyColors(bgColor, textColor, btnColor, logoDataUrl) {
  if (bgColor) document.body.style.backgroundColor = bgColor;

  if (textColor) {
    document.body.style.color = textColor;
    const textElements = document.querySelectorAll('*');
    textElements.forEach(el => {
      if (el.style.color) {
        el.style.color = textColor;
      }
    });
  }

  if (btnColor) {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.style.backgroundColor = btnColor;
      button.style.color = "#fff";
    });
  }

  if (logoDataUrl) {
    const logo = document.querySelector('img.mb-5.size-20.cursor-pointer[src="logo.svg"]');
    if (logo) {
      logo.src = logoDataUrl;
    }
  }
}

function resetToDefault() {
  document.body.style.backgroundColor = "";
  document.body.style.color = "";
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.style.backgroundColor = "";
    button.style.color = "";
  });

  const textElements = document.querySelectorAll('*');
  textElements.forEach(el => {
    if (el.style.color) {
      el.style.color = "";
    }
  });

  const logo = document.querySelector('img.mb-5.size-20.cursor-pointer[src="logo.svg"]');
  if (logo) {
    logo.src = "";
  }
}

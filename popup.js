// Execute the content script and get the selected text
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  chrome.tabs.executeScript(tabs[0].id, { file: "wordcount.js" }, function () {
    // Send a message to the content script to get the selected text
    chrome.tabs.sendMessage(tabs[0].id, { action: "getSelectedText" });
  });
});

chrome.runtime.onMessage.addListener(function (request) {
  if (request.action === "updatePopup") {
    console.log("Received updatePopup message:", request);
    const counters = request.counters;
    const politicalBiasScore = request.politicalBiasScore;

    //Update other counters as before
    updatePopup(counters);
  }
});

function updatePopup(counters) {
  const spaceElem = document.getElementById("space");
  const charsElem = document.getElementById("chars");
  const charswsElem = document.getElementById("charsws");
  const wordsElem = document.getElementById("words");
  const sentencesElem = document.getElementById("sentences");
  const politicalBiasLabelElem = document.getElementById("politicalBiasLabel");
  const politicalBiasProbabilityElem = document.getElementById(
    "politicalBiasProbability"
  );
  const selectedTextElem = document.getElementById("selectedText");

  if (counters) {
    spaceElem.textContent = counters.space;
    charsElem.textContent = counters.chars;
    charswsElem.textContent = counters.charsws;
    wordsElem.textContent = counters.words;
    sentencesElem.textContent = counters.sentences;
    const [label, probability] = counters.politicalBiasScore.split("\n");
    selectedTextElem.textContent = counters.selectedText || "N/A";

    politicalBiasLabelElem.textContent = label || "N/A";
    politicalBiasProbabilityElem.textContent = probability || "N/A";

    politicalBiasLabelElem.classList.remove(
      "political-bias-label-left",
      "political-bias-label-right",
      "political-bias-label-center"
    );
    politicalBiasLabelElem.classList.add(
      `political-bias-label-${label.toLowerCase()}`
    );
    selectedTextElem.style.color =
      label === "left" ? "green" : label === "right" ? "red" : "yellow";

    const probabilityValue = parseFloat(probability);
    if (!isNaN(probabilityValue)) {
      let iconHtml = "";
      let iconColor = "";

      if (label === "left") {
        // star icon for left label
        if (probabilityValue >= 0.9) {
          iconHtml =
            '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>';
          iconColor = "green";
        } else if (probabilityValue >= 0.8 && probabilityValue < 0.9) {
          iconHtml =
            '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>';
          iconColor = "green";
        } else if (probabilityValue >= 0.7 && probabilityValue < 0.8) {
          iconHtml =
            '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>';
          iconColor = "green";
        } else if (probabilityValue >= 0.6 && probabilityValue < 0.7) {
          iconHtml = '<i class="fas fa-star"></i><i class="fas fa-star"></i>';
          iconColor = "green";
        } else if (probabilityValue >= 0.5 && probabilityValue < 0.6) {
          iconHtml = '<i class="fas fa-star"></i>';
          iconColor = "green";
        }
      } else if (label === "right") {
        // icon icon for right label
        if (probabilityValue >= 0.9) {
          // 5 "star" icons
          iconHtml =
            '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>';
          iconColor = "red";
        } else if (probabilityValue >= 0.8 && probabilityValue < 0.9) {
          iconHtml =
            '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>';
          iconColor = "red";
        } else if (probabilityValue >= 0.7 && probabilityValue < 0.8) {
          iconHtml =
            '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>';
          iconColor = "red";
        } else if (probabilityValue >= 0.6 && probabilityValue < 0.7) {
          iconHtml = '<i class="fas fa-star"></i><i class="fas fa-star"></i>';
          iconColor = "red";
        } else if (probabilityValue >= 0.5 && probabilityValue < 0.6) {
          // 1 "star" icon
          iconHtml = '<i class="fas fa-star"></i>';
          iconColor = "red";
        }
      }

      // Set the inner HTML of fakeNewsProbabilityElem directly
      politicalBiasProbabilityElem.innerHTML = `<span style="color: ${iconColor}">${iconHtml}</span>`;
    } else {
      politicalBiasProbabilityElem.textContent = "N/A";
    }
  } else {
    // Handle the case where no text is selected
    spaceElem.textContent = 0;
    charsElem.textContent = 0;
    charswsElem.textContent = 0;
    wordsElem.textContent = 0;
    sentencesElem.textContent = 0;
    politicalBiasLabelElem.textContent = "N/A";
    politicalBiasProbabilityElem.textContent = "N/A";
    politicalBiasLabelElem.classList.remove(
      "political-bias-label-left",
      "political-bias-label-right",
      "political-bias-label-center"
    );
    selectedTextElem.textContent = "N/A";
    selectedTextElem.style.color = "black";
  }
}

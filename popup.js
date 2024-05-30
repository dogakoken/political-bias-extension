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

    // Update other counters as before
    updatePopup(counters);

    // Update speedometer
    updateSpeedometer(counters.politicalBiasLabel);
  }
});

function detectLanguage(text) {
  console.log("Detecting language for text:", text); // Added console log here
  const turkishChars = /[çğıöşüÇĞİÖŞÜ]/;
  const commonTurkishWords = [
    "ve",
    "bir",
    "bu",
    "için",
    "ile",
    "ama",
    "gibi",
    "çünkü",
    "ancak",
    "şimdi",
  ];

  if (turkishChars.test(text)) {
    console.log("Detected Turkish characters");
    return "tr";
  }

  console.log("No Turkish detected, assuming English");
  return "en";
}

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

  const body = document.querySelector("body");
  const politicalBiasLabel = counters.politicalBiasScore
    .split("\n")[0]
    .toLowerCase();
  if (politicalBiasLabel === "left") {
    body.style.backgroundColor = "red";
  } else if (politicalBiasLabel === "right") {
    body.style.backgroundColor = "blue";
  } else if (politicalBiasLabel === "center") {
    body.style.backgroundColor = "#ffcc00";
  } else {
    body.style.backgroundColor = "#563ce7";
  }

  const selectedTextElem = document.getElementById("selectedText");
  if (counters) {
    spaceElem.textContent = counters.space;
    charsElem.textContent = counters.chars;
    charswsElem.textContent = counters.charsws;
    wordsElem.textContent = counters.words;
    sentencesElem.textContent = counters.sentences;
    const [label, probability] = counters.politicalBiasScore.split("\n");
    selectedTextElem.textContent = counters.selectedText || "N/A";

    console.log("Detected language:", detectLanguage(counters.selectedText));

    const detectedLanguage = detectLanguage(counters.selectedText);
    if (detectedLanguage === "tr") {
      // Political Bias Section
      document
        .getElementById("politicalBiasSection")
        .querySelector("h3").textContent = "Politik Eğilim Dedektörü";
      const politicalBiasSection = document.getElementById(
        "politicalBiasSection"
      );

      politicalBiasSection.querySelector(
        "p:nth-of-type(1) strong"
      ).textContent = "Tahmin Edilen Etiket:";
      politicalBiasSection.querySelector(
        "p:nth-of-type(2) strong"
      ).textContent = "Olasılık:";

      // Selected Text Section
      document
        .getElementById("selectedTextSection")
        .querySelector("h3").textContent = "Seçili Metin";

      // Word Counter Section
      document
        .getElementById("wordCounterSection")
        .querySelector("h3").textContent = "Kelime Sayacı";
      const wordCounterSection = document.getElementById("wordCounterSection");

      wordCounterSection.querySelector("p:nth-of-type(1) strong").textContent =
        "Kelime Sayısı:";
      wordCounterSection.querySelector("p:nth-of-type(2) strong").textContent =
        "Boşluk Sayısı:";
      wordCounterSection.querySelector("p:nth-of-type(3) strong").textContent =
        "Karakter Sayısı:";
      wordCounterSection.querySelector("p:nth-of-type(4) strong").textContent =
        "Boşluk Olmadan Karakter:";
      wordCounterSection.querySelector("p:nth-of-type(5) strong").textContent =
        "Cümle Sayısı:";

      document.documentElement.lang = "tr"; // Sayfa dilini Türkçe olarak ayarla
    } else {
      document
        .getElementById("wordCounterSection")
        .querySelector("h3").textContent = "Word Counter";
      document.documentElement.lang = "en"; // Set document language to English
    }

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
    /*selectedTextElem.style.color =
      label === "left" ? "green" : label === "right" ? "red" : "#ffcc00"; This is for changing selected text color same with the background color*/
    selectedTextElem.style.color = "black";

    const probabilityValue = parseFloat(probability);
    if (!isNaN(probabilityValue)) {
      let iconHtml = "";
      let iconColor = "";
      // labelların olasılığına göre çıkan ikonlar. hepsi aynı sadece renkler farklı (left, right ve centera göre)
      if (label === "left" || label === "right" || label === "center") {
        if (probabilityValue >= 1) {
          iconHtml = '<i class="fas fa-star"></i>'.repeat(10);
          iconColor =
            label === "left" ? "red" : label === "right" ? "blue" : "#ffcc00";
        } else if (probabilityValue >= 0.9 && probabilityValue < 1) {
          iconHtml =
            '<i class="fas fa-star"></i>'.repeat(9) +
            '<i class="far fa-star"></i>';
          iconColor =
            label === "left" ? "red" : label === "right" ? "blue" : "#ffcc00";
        } else if (probabilityValue >= 0.8 && probabilityValue < 0.9) {
          iconHtml =
            '<i class="fas fa-star"></i>'.repeat(8) +
            '<i class="far fa-star"></i>'.repeat(2);
          iconColor =
            label === "left" ? "red" : label === "right" ? "blue" : "#ffcc00";
        } else if (probabilityValue >= 0.7 && probabilityValue < 0.8) {
          iconHtml =
            '<i class="fas fa-star"></i>'.repeat(7) +
            '<i class="far fa-star"></i>'.repeat(3);
          iconColor =
            label === "left" ? "red" : label === "right" ? "blue" : "#ffcc00";
        } else if (probabilityValue >= 0.6 && probabilityValue < 0.7) {
          iconHtml =
            '<i class="fas fa-star"></i>'.repeat(6) +
            '<i class="far fa-star"></i>'.repeat(4);
          iconColor =
            label === "left" ? "red" : label === "right" ? "blue" : "#ffcc00";
        } else if (probabilityValue >= 0.5 && probabilityValue < 0.6) {
          iconHtml =
            '<i class="fas fa-star"></i>'.repeat(5) +
            '<i class="far fa-star"></i>'.repeat(5);
          iconColor =
            label === "left" ? "red" : label === "right" ? "blue" : "#ffcc00";
        } else if (probabilityValue >= 0.4 && probabilityValue < 0.5) {
          iconHtml =
            '<i class="fas fa-star"></i>'.repeat(4) +
            '<i class="far fa-star"></i>'.repeat(6);
          iconColor =
            label === "left" ? "red" : label === "right" ? "blue" : "#ffcc00";
        } else if (probabilityValue >= 0.3 && probabilityValue < 0.4) {
          iconHtml =
            '<i class="fas fa-star"></i>'.repeat(3) +
            '<i class="far fa-star"></i>'.repeat(7);
          iconColor =
            label === "left" ? "red" : label === "right" ? "blue" : "#ffcc00";
        } else if (probabilityValue >= 0.2 && probabilityValue < 0.3) {
          iconHtml =
            '<i class="fas fa-star"></i>'.repeat(2) +
            '<i class="far fa-star"></i>'.repeat(8);
          iconColor =
            label === "left" ? "red" : label === "right" ? "blue" : "#ffcc00";
        } else if (probabilityValue >= 0.1 && probabilityValue < 0.2) {
          iconHtml =
            '<i class="fas fa-star"></i>' +
            '<i class="far fa-star"></i>'.repeat(9);
          iconColor =
            label === "left" ? "red" : label === "right" ? "blue" : "#ffcc00";
        } else {
          iconHtml = '<i class="far fa-star"></i>'.repeat(10);
          iconColor =
            label === "left" ? "red" : label === "right" ? "blue" : "#ffcc00";
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

// Speedometer boyutları burada ayarlandı, değiştirilebilir ya da farklı dosyada yazılabılır
document.addEventListener("DOMContentLoaded", function () {
  // Speedometer için gerekli değişkenler
  const speedometerCanvas = document.getElementById("speedometer");
  const politicalBiasLabelElem = document.getElementById("politicalBiasLabel");
  const context = speedometerCanvas.getContext("2d");
  let centerX = speedometerCanvas.width / 2;
  let centerY = speedometerCanvas.height / 2;
  let radius = 72;
  let startAngle = Math.PI * 0.75;
  let endAngle = Math.PI * 2.25;
  let counterClockwise = false;

  politicalBiasLabelElem.addEventListener("DOMNodeInserted", function () {
    let label = politicalBiasLabelElem.textContent.toLowerCase();
    updateSpeedometer(label);
  });

  function updateSpeedometer(label) {
    console.log("Label:", label);
    let angle;
    let color;

    // label'e göre angle değerini belirle
    if (label === "left") {
      angle = Math.PI * 0.95; // sola doğru
      color = "red";
    } else if (label === "right") {
      angle = Math.PI * 2.05; // sağa doğru
      color = "blue";
    } else if (label === "center") {
      // center
      angle = Math.PI * 1.5; // ortada durur
      color = "#ffcc00"; // sarı renk
    } else {
      angle = Math.PI * -1.5; // ortada durur
      color = "#563ce7";
    }
    console.log(color);
    drawSpeedometer(angle, color);
  }

  function drawSpeedometer(angle, color) {
    context.clearRect(0, 0, speedometerCanvas.width, speedometerCanvas.height);
    context.font = "13px Oddval Variable";
    // Speedometer'ın dış çemberini çiz
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2, counterClockwise);
    context.lineWidth = 5;
    context.font = "13px Oddval Variable";
    context.stroke();

    // İbreyi çiz
    let ix = centerX + (radius - 10) * Math.cos(angle);
    let iy = centerY + (radius - 10) * Math.sin(angle);

    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(ix, iy);
    context.lineWidth = 5;
    context.strokeStyle = color;
    context.stroke();

    var gradient = context.createLinearGradient(
      centerX - radius,
      centerY,
      centerX + radius,
      centerY
    );
    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.5, "#ffcc00");
    gradient.addColorStop(1, "blue");

    // Gradyan çemberi çiz
    context.beginPath();
    context.arc(
      centerX,
      centerY,
      radius - 10,
      startAngle,
      endAngle,
      counterClockwise
    );
    context.lineWidth = 10;
    context.strokeStyle = gradient;
    context.stroke();

    context.font = "13px Oddval Variable";

    context.fillStyle = "#000"; // siyah renk metin
    context.textAlign = "center";
    if (document.documentElement.lang === "tr") {
      context.fillText("sol", centerX - radius + 30, centerY + 10); // soldaki metin left
      context.fillText("orta", centerX, centerY - radius + 40); // üstteki metin center
      context.fillText("sağ", centerX + radius - 30, centerY + 10); // sağdaki metin right
      context.fillText("N/A", centerX, centerY + radius - 25); // alttaki metin N/A
    } else {
      context.fillText("left", centerX - radius + 30, centerY + 10); // soldaki metin left
      context.fillText("center", centerX, centerY - radius + 40); // üstteki metin center
      context.fillText("right", centerX + radius - 30, centerY + 10); // sağdaki metin right
      context.fillText("N/A", centerX, centerY + radius - 25); // alttaki metin N/A
    }
  }

  // Speedometer'ı çizmek için ilk çağrı
  drawSpeedometer(Math.PI * -1.5, "#563ce7"); // Başlangıçta ortada durur
});

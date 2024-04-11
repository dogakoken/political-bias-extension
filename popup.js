//fake news yazan yerler political bias olarak değiştirildi
//label olarak yer alan real ve fake, left ve right olarak değiştirildi ve center eklendi
//todo: prediction kodu olmadığı için test edilmedi. test için dummy data verilip test edilebilir.
//todo: ya da prediction kodu gelince test edilip düzenlenebilir.
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

    // Speedometer'ı güncelle
    updateSpeedometer(counters.politicalBiasLabel);
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

  const body = document.querySelector("body");
  const politicalBiasLabel = counters.politicalBiasScore
    .split("\n")[0]
    .toLowerCase();
  if (politicalBiasLabel === "left") {
    body.style.backgroundColor = "green";
  } else if (politicalBiasLabel === "right") {
    body.style.backgroundColor = "red";
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
      label === "left" ? "green" : label === "right" ? "red" : "#ffcc00";

    const probabilityValue = parseFloat(probability);
    if (!isNaN(probabilityValue)) {
      let iconHtml = "";
      let iconColor = "";
      //labelların olasılığına göre çıkan ikonlar. hepsi aynı sadece renkler farklı (left, right ve centera göre)
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
      } else if (label === "center") {
        // icon icon for right label
        if (probabilityValue >= 0.9) {
          // 5 "star" icons
          iconHtml =
            '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>';
          iconColor = "#ffcc00";
        } else if (probabilityValue >= 0.8 && probabilityValue < 0.9) {
          iconHtml =
            '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>';
          iconColor = "#ffcc00";
        } else if (probabilityValue >= 0.7 && probabilityValue < 0.8) {
          iconHtml =
            '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>';
          iconColor = "#ffcc00";
        } else if (probabilityValue >= 0.6 && probabilityValue < 0.7) {
          iconHtml = '<i class="fas fa-star"></i><i class="fas fa-star"></i>';
          iconColor = "#ffcc00";
        } else if (probabilityValue >= 0.5 && probabilityValue < 0.6) {
          // 1 "star" icon
          iconHtml = '<i class="fas fa-star"></i>';
          iconColor = "#ffcc00";
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
//todo: speedometer tasarımı daha prof yapılabilir. şuan basic bir speedometer mevcut
//speedometer boyutları burada ayarlandı, değiştirilebilir ya da farklı dosyada yazılabılır
document.addEventListener("DOMContentLoaded", function () {
  // Speedometer için gerekli değişkenler
  const speedometerCanvas = document.getElementById("speedometer");
  const politicalBiasLabelElem = document.getElementById("politicalBiasLabel");
  const context = speedometerCanvas.getContext("2d");
  let centerX = speedometerCanvas.width / 2;
  let centerY = speedometerCanvas.height / 2;
  let radius = 70;
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
      color = "green";
    } else if (label === "right") {
      angle = Math.PI * 2.05; // sağa doğru
      color = "red";
    } else if (label === "center") {
      //center
      angle = Math.PI * 1.5; // ortada durur
      color = "#ffcc00"; //sarı renk
    } else {
      angle = Math.PI * -1.5; // ortada durur
      color = "#563ce7"; //sarı renk
    }
    console.log(color);
    drawSpeedometer(angle, color);
  }
  function drawSpeedometer(angle, color) {
    context.clearRect(0, 0, speedometerCanvas.width, speedometerCanvas.height);

    // Speedometer'ın dış çemberini çiz
    context.beginPath();
    context.arc(
      centerX,
      centerY,
      radius,
      startAngle,
      endAngle,
      counterClockwise
    );
    context.lineWidth = 5;
    context.strokeStyle = "#000"; //speedometer çerçevesi rengi
    context.stroke();

    // İbreyi çiz
    let ix = centerX + (radius - 4) * Math.cos(angle);
    let iy = centerY + (radius - 4) * Math.sin(angle);

    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(ix, iy);
    context.lineWidth = 5;
    context.strokeStyle = color;
    context.stroke();

    context.font = "15px Arial";

    context.fillStyle = "#000"; // siyah renk metin
    context.textAlign = "center";
    context.fillText("left", centerX - radius + 30, centerY + 10); // soldaki metin left
    context.fillText("center", centerX, centerY - radius + 40); // üstteki metin center
    context.fillText("right", centerX + radius - 30, centerY + 10); // sağdaki metin right
  }

  // Speedometer'ı çizmek için ilk çağrı
  drawSpeedometer(Math.PI * -1.5, "#563ce7"); // Başlangıçta ortada durur
});

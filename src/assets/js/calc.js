/**
 * The whole code here is terrible. But it's a small project and wanted to move quickly.
 * Todo: one day refactor to React or some new JS framework.
 */

const $ = document.querySelector.bind(document);

// It's bad practice but it is a nice shorthand for this small projects
Element.prototype.hide = () => {
  this.style.display = "none";
};

Element.prototype.show = () => {
  this.style.display = "block";
};

function getDisplayText(character) {
  let text = window.calcDisplay.innerText;
  if (character >= 0) text = text + character;
  if (character === -1) text = text.substring(0, text.length - 1);

  let textArray = text.replace(".", "").split("");

  if (textArray.length < 4) {
    textArray = Array(4 - textArray.length)
      .fill("0")
      .concat(textArray);
  }

  if (parseInt(textArray[0], 10) === 0) {
    textArray.shift();
  }

  textArray.splice(textArray.length - 2, 0, ".");

  text = textArray.join("");

  return text;
}

function totalIsAllNines(totalInCents) {
  const totalString = totalInCents.toString();
  for (let i = 0; i < totalString.length; i++) {
    if (totalString.charAt(i) !== "9") {
      return false;
    }
  }

  return true;
}

function positionIsNine(totalInCents, position) {
  const totalString = totalInCents.toString();
  return totalString.charAt(position) === "9";
}

// eslint-disable-next-line
function getIncrementForLastTotalInCents(lastTotalInCents) {
  const totalAsString = lastTotalInCents.toString();
  const totalLength = totalAsString.length;

  if (totalIsAllNines(lastTotalInCents)) {
    return 2;
  }
  if (totalLength < 5 && positionIsNine(lastTotalInCents, 1)) {
    return 11;
  }
  if (
    totalLength >= 5 &&
    positionIsNine(lastTotalInCents, 1) &&
    positionIsNine(lastTotalInCents, 2)
  ) {
    return 11;
  }
  if (positionIsNine(lastTotalInCents, 2)) {
    return 110;
  }

  if (lastTotalInCents < 1000) {
    // 3 digit total
    return 10;
  }
  if (lastTotalInCents < 10000) {
    // 4 digit total
    return 110;
  }
  if (lastTotalInCents < 100000) {
    // 5 digit total
    return 100;
  }
  if (lastTotalInCents < 1000000) {
    // 6 digit total
    return 1100;
  }
  if (lastTotalInCents < 1000000) {
    // 7 digit total
    return 1000;
  }

  return 1000;
}

// --------------------------------------------------
// Takes in billAmount and spits out an array of possible
// tip values and billTotals.
// TODO: take in min% and max% values

function getPalindromicValues(currentText) {
  const billAmountInCents = toFixedNumber(parseFloat(currentText) * 100, 0);

  if (billAmountInCents <= 0) {
    return [];
  }

  let returnValue = [];
  let lastTotalInCents = 0;
  let lastTipAmountInCents = 0;
  const minTipPercent = 0.08;
  const maxTipPercent = 0.25;

  const startTipAmount = toFixedNumber(billAmountInCents * minTipPercent, 0);
  const stopTipAmount = toFixedNumber(billAmountInCents * maxTipPercent, 0);
  // console.log({ startTipAmount, stopTipAmount });

  lastTipAmountInCents = startTipAmount - 1;

  let palindromeFound = false;
  // TODO - Increment by known values

  // FIND THE FIRST PALINDROME
  let maxTries = 10000;
  while (maxTries > 0 && !palindromeFound) {
    // console.log(maxTries);

    lastTipAmountInCents++;
    lastTotalInCents = billAmountInCents + lastTipAmountInCents;
    palindromeFound = isPalindromic(lastTotalInCents);
    maxTries--;

    if (palindromeFound) {
      //lastTipAmountInCents
      returnValue.push({
        tipAmount: lastTipAmountInCents / 100,
        tipPercent: (100 * lastTipAmountInCents) / billAmountInCents,
        totalAmount: lastTotalInCents / 100,
      });
    }
  }

  while (lastTipAmountInCents <= stopTipAmount) {
    // const increment = getIncrementForLastTotalInCents(lastTotalInCents);
    const increment = 1;
    lastTipAmountInCents += increment;

    lastTotalInCents = billAmountInCents + lastTipAmountInCents;
    // We shouldn't need to test for palindromes here
    let palindromeFound = isPalindromic(lastTotalInCents);

    if (palindromeFound) {
      returnValue.push({
        tipAmount: lastTipAmountInCents / 100,
        tipPercent: (100 * lastTipAmountInCents) / billAmountInCents,
        totalAmount: lastTotalInCents / 100,
      });
    }
  }

  return returnValue;
}

// --------------------------------------------------
// Is the integer a palindrome?

function isPalindromic(integerValue) {
  const valueText = "" + integerValue;
  const fullLength = valueText.length;
  const halfLength = parseInt(valueText.length / 2, 10);
  for (let i = 0; i < halfLength; i++) {
    if (valueText.charAt(i) !== valueText.charAt(fullLength - i - 1)) {
      return false;
    }
  }

  return true;
}

function setDisplayText(text) {
  window.calcDisplay.innerText = text;
  if (text === "0.00") {
    window.calcDisplay.classList.add("empty");
  } else {
    window.calcDisplay.classList.remove("empty");
  }
}

// eslint-disable-next-line
function processNumber(number) {
  document.getSelection().removeAllRanges();

  const currentText = getDisplayText(number.toString());

  if (currentText.length > 8) {
    window.calcDisplay.classList.add("shake");
    setTimeout(() => {
      window.calcDisplay.classList.remove("shake");
    }, 500);

    const error = $("#calc-display-error");
    error.innerText = "Only supported up to 5 digits";
    error.show();
    setTimeout(() => {
      error.innerText = "";
      error.hide();
    }, 3000);
    return;
  }

  setDisplayText(currentText);
  performCalculations(currentText);
}

function processBackspace() {
  document.getSelection().removeAllRanges();
  const currentText = getDisplayText(-1);

  setDisplayText(currentText);

  if (currentText === "0.00") {
    clearResults();
    return;
  }

  performCalculations(currentText);
}

function performCalculations(currentText) {
  clearResults();
  const decimalPart = parseInt(currentText.split(".")[0], 10);
  let results = [];
  if (decimalPart >= 5) {
    results = getPalindromicValues(currentText);
  }
  addResults(results, decimalPart);
}

function clearResults() {
  $("#middle-div").show();
  $("#bottom-div").hide();
  $("#calc-results-footer").replaceChildren();
  if ($("#calc-results-scroll > div")) $("#calc-results-scroll > div").remove();
}

function formatDecimal(value, places) {
  value = parseFloat(value).toFixed(places);
  const returnValue = value.toString();

  // if (returnValue.indexOf('.00') > -1) {
  //     // Truncate anything with zero cents
  //     returnValue = returnValue.replace('.00', '');
  // }

  return returnValue;
}

function trimArray(resultArray) {
  let arr = [];
  const maxResults = 16;
  if (resultArray.length > maxResults) {
    resultArray.map((el, i) => {
      if (i % 2) arr.push(el);
    });
  } else {
    arr = resultArray;
  }

  if (arr.length > maxResults) {
    arr = trimArray(arr);
  }

  return arr;
}

function addResults(resultArray, decimalPart) {
  if (decimalPart < 5) {
    $("#calc-results-header").innerText = "Bill amount needs to be above $5";
  } else {
    $("#calc-results-header").innerText = "Tap on a row for additional details";
  }

  if (resultArray.length > 0) {
    resultArray = trimArray(resultArray);
    resultArray.reverse();
    const resultArrayLength = resultArray.length;

    if (resultArrayLength < 5) {
      const message = document.createElement("div");
      const plural = resultArrayLength === 1 ? "" : "s";
      message.innerHTML = `Only ${resultArrayLength} palindrome result${plural} available for this bill amout`;
      $("#calc-results-scroll").prepend(message);
    }

    for (let i = 0; i < resultArrayLength; i++) {
      const tipPercent = resultArray[i].tipPercent;

      const tipPercentFormatted = formatDecimal(tipPercent, 1);
      const tipAmountFormatted = formatDecimal(resultArray[i].tipAmount, 2);
      const totalAmountFormatted = formatDecimal(resultArray[i].totalAmount, 2);
      const tipZoomFn = `tipZoom('${tipPercentFormatted}', '${tipAmountFormatted}', '${totalAmountFormatted}')`;

      let row = document.createElement("tr");
      row.setAttribute("onclick", tipZoomFn);

      let html = "<td>";
      html += '<div class="tip-percent" percent="' + tipPercent + '">';
      html += tipPercentFormatted + "%";
      html += "</div>";
      html += "</td>";
      html += "<td>";
      html += "$" + tipAmountFormatted;
      html += "</td>";
      html += "<td>";
      html += "$" + totalAmountFormatted;
      html += "</td>";

      row.innerHTML = html;
      $("#calc-results-footer").appendChild(row);
    }

    $(".results-table-scroll>tfoot").show();
    $("#middle-div").hide();
    $("#bottom-div").show();
    refreshTipColors();
  } else {
    const message = document.createElement("div");
    message.innerHTML = `No palindrome available for this amount`;
    $("#calc-results-scroll").prepend(message);
  }
}

function getColorForPercent(tipPercent) {
  const bottomTip = 8.0;
  const medianTip = 15.0;
  const topTip = 28.0;
  let tipDelta = 0.0;
  let delta = 0.0;
  let red = 0;
  let green = 0;

  if (tipPercent <= bottomTip) {
    // Red - stiff the server
    green = 0;
    red = 255;
  } else if (tipPercent <= medianTip) {
    // Between bottom and median - bad service
    tipDelta = medianTip - bottomTip;
    delta = tipPercent - bottomTip;
    green = parseInt((delta / tipDelta) * 255, 10);
    red = 255;
  } else if (tipPercent <= topTip) {
    tipDelta = topTip - medianTip;
    delta = tipPercent - medianTip;
    red = parseInt(255 - (255 * delta) / tipDelta, 10);
    green = 255;
  } else {
    red = 0;
    green = 255;
  }

  const returnValue = `rgb(${red}, ${green}, 0)`;
  return returnValue;
}

function refreshTipColors() {
  [...document.querySelectorAll(".tip-percent")].forEach((el) => {
    const percent = parseFloat(el.getAttribute("percent"));
    el.style.backgroundColor = getColorForPercent(percent);
  });
}

function attachSwipeEvent() {
  let scrollXStart = 0;
  let scrollXEnd = 0;

  window.calcDisplay.addEventListener("touchstart", (e) => {
    e.preventDefault();
    scrollXStart = e.touches[0].clientX;
  });

  window.calcDisplay.addEventListener("touchmove", (e) => {
    e.preventDefault();
    scrollXEnd = e.touches[0].clientX;
  });

  window.calcDisplay.addEventListener("touchend", (e) => {
    e.preventDefault();
    if (scrollXEnd - scrollXStart > 40) {
      processBackspace();
    }
  });
}

function attachTipCopyEvent() {
  $("#tipFullScreenWrapper").addEventListener("touchend", (e) => {
    const path = e.composedPath();
    for (let el of path) {
      if (el.id === "tip_amount" || el.id === "total_amount") {
        if (navigator.clipboard) {
          const tip = el.getAttribute("amount");
          navigator.clipboard.writeText(tip).then(
            () => {
              // console.log("copied");
              const elCopy = el.querySelector(".copy");
              elCopy.innerText = "✅ copied";
              setTimeout(() => {
                elCopy.innerText = "📋 copy";
              }, 3000);
            },
            () => {
              // console.log("copy error");
            }
          );
        }
      }
    }
  });
}

const tipFullScreenWrapperController = new AbortController();
const prevent = (e) => {
  e.preventDefault();
};

// eslint-disable-next-line
function tipZoom(tipPercent, tipAmount, totalAmount) {
  window.tipFullScreenWrapper.show();
  setTimeout(() => window.tipFullScreenWrapper.classList.add("in"), 0);

  const container = $("#tipFullScreenContainer");
  container.classList.remove("compact");

  const billAmount = toFixedNumber(parseFloat(getDisplayText()), 2);
  const color = getColorForPercent(tipPercent);

  let html = `
    <div>
        <span>Tip %</span>
        <em style="color: ${color}">${tipPercent}%</em>
    </div>
    <div>
        <span>Bill amount</span>
        <i class="dollar">$</i>${billAmount}
    </div>
    <div id="tip_amount" amount="${tipAmount}">
        <span>Tip amount <span class="copy">📋 copy</span></span>
        <i class="dollar">$</i>${tipAmount}
    </div>
    <div id="total_amount" amount="${totalAmount}">
        <span>Total amount <span class="copy">📋 copy</span></span>
        <i class="dollar">$</i>${totalAmount}
    </div>
  `;

  if (tipPercent < 20) {
    container.classList.add("compact");

    const extraCash = toFixedNumber(
      (billAmount * 20) / 100 - tipAmount,
      2
    ).toFixed(2);

    html += `
      <div class="cash">
        <span>To round to 20% leave cash</span>
        <i class="dollar">$</i>${extraCash}
      </div>
    `;
  }

  container.innerHTML = html;

  container.addEventListener("touchstart", prevent, {
    signal: tipFullScreenWrapperController.signal,
  });

  container.addEventListener("touchmove", prevent, {
    signal: tipFullScreenWrapperController.signal,
  });
}

// eslint-disable-next-line
function closeTipFullScreen() {
  window.tipFullScreenWrapper.classList.remove("in");
  $("#tipFullScreenContainer").replaceChildren();
  tipFullScreenWrapperController.abort();
}

// eslint-disable-next-line
function openMiddleDivWrapper() {
  $("#middle-div-more-wrapper").classList.toggle("open");
}

function toFixedNumber(num, digits, base) {
  var pow = Math.pow(base || 10, digits);
  return Math.round(num * pow) / pow;
}

// ------------------------------

document.addEventListener("DOMContentLoaded", () => {
  window.calcDisplay = $("#calc-display-x"); // not the best to use window. but for small projects it's convenient
  clearResults();
  attachSwipeEvent();
  attachTipCopyEvent();

  window.tipFullScreenWrapper = $("#tipFullScreenWrapper");
  window.tipFullScreenWrapper.addEventListener("transitionend", () => {
    if (!window.tipFullScreenWrapper.classList.contains("in")) {
      window.tipFullScreenWrapper.hide();
    }
  });
});

const $ = document.querySelector.bind(document);

// It's bad practice but it is a nice shorthand for this small projects
Element.prototype.hide = function () {
  this.style.display = "none";
};

Element.prototype.show = function () {
  this.style.display = "block";
};

function getDisplayText() {
  return $("#calc-display-x").innerText;
}

function getDisplayValueInCents() {
  const displayText = getDisplayText();
  if (displayText === "") {
    return 0;
  }

  const displayTextWithoutDecimal = displayText.replace(".", "");
  let returnValue = 0;

  const integersOnlyRegEx = new RegExp("^[0-9]*$");
  if (integersOnlyRegEx.test(displayText)) {
    return parseInt(displayTextWithoutDecimal) * 100;
  }

  const oneDecimalRegEx = new RegExp("^[0-9]+[.]{1}[0-9]{1}$");
  if (oneDecimalRegEx.test(displayText)) {
    return parseInt(displayTextWithoutDecimal) * 10;
  }

  const twoDecimalsRegEx = new RegExp("^[0-9]+[.]{1}[0-9]{2}$");
  if (twoDecimalsRegEx.test(displayText)) {
    return parseInt(displayTextWithoutDecimal);
  }

  return 0;
}

// --------------------------------------------------

function totalIsAllNines(totalInCents) {
  const totalString = totalInCents.toString();
  for (let i = 0; i < totalString.length; i++) {
    if (totalString.charAt(i) !== "9") {
      return false;
    }
  }

  return true;
}

// --------------------------------------------------

function positionIsNine(totalInCents, position) {
  const totalString = totalInCents.toString();
  return totalString.charAt(position) === "9";
}

// --------------------------------------------------

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

function getPalindromicValues() {
  const billAmountInCents = getDisplayValueInCents();

  if (billAmountInCents <= 0) {
    return [];
  }

  let returnValue = [];
  let lastTotalInCents = 0;
  let lastTipAmountInCents = 0;
  const minTipPercent = 0.08;
  const maxTipPercent = 0.22;

  const startTipAmount = parseInt(billAmountInCents * minTipPercent);
  const stopTipAmount = parseInt(billAmountInCents * maxTipPercent);

  lastTipAmountInCents = startTipAmount - 1;

  let palindromeFound = false;
  // TODO - Increment by known values

  // FIND THE FIRST PALINDROME
  while (!palindromeFound) {
    lastTipAmountInCents++;
    lastTotalInCents = billAmountInCents + lastTipAmountInCents;
    palindromeFound = isPalindromic(lastTotalInCents);

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
    const increment = getIncrementForLastTotalInCents(lastTotalInCents);
    lastTipAmountInCents += increment;

    lastTotalInCents = billAmountInCents + lastTipAmountInCents;
    // We shouldn't need to test for palindromes here
    //palindromeFound = isPalindromic(lastTotalInCents);

    returnValue.push({
      tipAmount: lastTipAmountInCents / 100,
      tipPercent: (100 * lastTipAmountInCents) / billAmountInCents,
      totalAmount: lastTotalInCents / 100,
    });
  }

  return returnValue;
}

// --------------------------------------------------
// Is the integer a palindrome?

function isPalindromic(integerValue) {
  const valueText = "" + integerValue;
  const fullLength = valueText.length;
  const halfLength = parseInt(valueText.length / 2);
  for (let i = 0; i < halfLength; i++) {
    if (valueText.charAt(i) !== valueText.charAt(fullLength - i - 1)) {
      return false;
    }
  }

  return true;
}

function setDisplayText(text) {
  $("#calc-display-x").innerText = text;
  $("#calc-display-x").classList.remove("empty");
}

function bufferIsInteger() {
  const currentText = getDisplayText();
  const integersOnlyRegEx = new RegExp("^[0-9]*$");
  return integersOnlyRegEx.test(currentText);
}

function bufferIsAtMaxIntegerLength() {
  const currentText = getDisplayText();
  const integersOnlyRegEx = new RegExp("^[0-9]{4}$");
  return integersOnlyRegEx.test(currentText);
}

function bufferIsComplete() {
  const currentText = getDisplayText();
  const completedRegEx = new RegExp("^[0-9]+[.]{1}[0-9]{2}$");
  return completedRegEx.test(currentText);
}

function processNumber(number) {
  document.getSelection().removeAllRanges();
  if (bufferIsComplete()) {
    // Don't do anything
    return;
  }

  if (bufferIsAtMaxIntegerLength()) {
    // Don't do anything
    return;
  }

  let currentText = getDisplayText();
  if (currentText === "" && number === 0) {
    // Don't do anything
    return;
  }

  currentText = currentText + number.toString();
  setDisplayText(currentText);

  performCalculations();
}

function processDot() {
  document.getSelection().removeAllRanges();
  if (!bufferIsInteger()) {
    // Don't do anything
    return;
  }

  let currentText = getDisplayText();
  currentText = currentText + ".";
  setDisplayText(currentText);
}

function processBackspace() {
  document.getSelection().removeAllRanges();
  let currentText = getDisplayText();
  const currentTextLength = currentText.length;

  if (currentTextLength === 0) {
    return;
  }

  currentText = currentText.substr(0, currentTextLength - 1);

  setDisplayText(currentText);
  performCalculations();

  if (currentText.length === 0) {
    $("#calc-display-x").classList.add("empty");
    clearResults();
  }
}

function performCalculations() {
  clearResults();
  addResults(getPalindromicValues());
}

function clearDisplayText() {
  $("#calc-display-x").innerHTML = "";
  clearResults();
}

function clearResults() {
  $("#middle-div").show();
  $("#bottom-div").hide();
  $("#calc-results-footer").replaceChildren();
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

function addResults(resultArray) {
  resultArray = trimArray(resultArray);
  resultArray.reverse();
  for (let i = 0; i < resultArray.length; i++) {
    const tipPercent = resultArray[i].tipPercent;

    const tipPercentFormatted = formatDecimal(tipPercent, 1);
    const tipAmountFormatted = formatDecimal(resultArray[i].tipAmount, 2);
    const amountFormatted = formatDecimal(resultArray[i].totalAmount, 2);
    const tipZoomFn = `tipZoom('${tipPercentFormatted}', '${tipAmountFormatted}', '${amountFormatted}')`;

    let row = document.createElement("tr");
    row.setAttribute("onclick", tipZoomFn);

    let html = "<td>";
    html += '<div class="tip-percent" percent="' + tipPercent + '">';
    html += formatDecimal(tipPercent, 1) + "%";
    html += "</div>";
    html += "</td>";
    html += "<td>";
    html += "$" + formatDecimal(resultArray[i].tipAmount, 2);
    html += "</td>";
    html += "<td>";
    html += "$" + formatDecimal(resultArray[i].totalAmount, 2);
    html += "</td>";

    row.innerHTML = html;
    $("#calc-results-footer").appendChild(row);
  }

  $(".results-table-scroll>tfoot").show();
  $("#middle-div").hide();
  $("#bottom-div").show();
  refreshTipColors();
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
    green = parseInt((delta / tipDelta) * 255);
    red = 255;
  } else if (tipPercent <= topTip) {
    tipDelta = topTip - medianTip;
    delta = tipPercent - medianTip;
    red = parseInt(255 - (255 * delta) / tipDelta);
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

function isCalculatorVisible() {
  const topHalfDivClasses = $("#top-div").attr("class");
  if (topHalfDivClasses && topHalfDivClasses.indexOf("show-calculator") > -1) {
    return true;
  }

  return false;
}

document.addEventListener("DOMContentLoaded", function () {
  clearDisplayText();
  clearResults();
  attachSwipeEvent();
  attachSnapEvents();
});

// ------------------------------

function attachSwipeEvent() {
  let scrollXStart = 0;
  let scrollXEnd = 0;
  const scrollDiv = $("#calc-display-x");

  scrollDiv.addEventListener("touchstart", (e) => {
    e.preventDefault();
    scrollXStart = e.touches[0].clientX;
  });

  scrollDiv.addEventListener("touchmove", (e) => {
    e.preventDefault();
    scrollXEnd = e.touches[0].clientX;
  });

  scrollDiv.addEventListener("touchend", (e) => {
    e.preventDefault();
    if (scrollXEnd - scrollXStart > 40) {
      processBackspace();
    }
  });
}

const tipFullScreenWrapperController = new AbortController();
const prevent = (e) => {
  e.preventDefault();
};

function tipZoom(tipPercent, tipAmount, totalAmount) {
  const wrapper = $("#tipFullScreenWrapper");
  const container = $("#tipFullScreenContainer");
  wrapper.show();

  const color = getColorForPercent(tipPercent);

  container.innerHTML = `
        <div>
            <span>Tip %</span>
            <em style="color: ${color}">${tipPercent}%</em>
        </div>
        <div>
            <span>Bill amount</span>
            <i class="dollar">$</i>${getDisplayText()}
        </div>
        <div>
            <span>Tip amount</span>
            <i class="dollar">$</i>${tipAmount}
        </div>
        <div>
            <span>Total amount</span>
            <i class="dollar">$</i>${totalAmount}
        </div>
    `;

  container.addEventListener("touchstart", prevent, {
    signal: tipFullScreenWrapperController.signal,
  });

  container.addEventListener("touchmove", prevent, {
    signal: tipFullScreenWrapperController.signal,
  });
}

function closeTipFullScreen() {
  $("#tipFullScreenWrapper").hide();
  $("#tipFullScreenContainer").replaceChildren();
  tipFullScreenWrapperController.abort();
}

// -----------

function attachSnapEvents() {
  const gallery = $("#paginated_gallery");
  const gallery_scroller = gallery.querySelector(".gallery_scroller");
  const gallery_item_size = gallery_scroller.querySelector("div").clientWidth;

  gallery
    .querySelector(".btn.next")
    .addEventListener("click", scrollToNextPage);
  gallery
    .querySelector(".btn.prev")
    .addEventListener("click", scrollToPrevPage);

  function scrollToNextPage() {
    gallery_scroller.scrollBy(gallery_item_size, 0);
  }
  function scrollToPrevPage() {
    gallery_scroller.scrollBy(-gallery_item_size, 0);
  }
}

const fs = require("fs");

console.log(new Date().toISOString());

const stream = fs.createWriteStream("append.txt", { flags: "a" });
for (let i = 100; i < 100000; i++) {
  const { length } = getPalindromicValues(i);
  if (length < 5) {
    stream.write(`${i} - ${length}\n`);
  }
  if (i % 10000 === 0) console.log(i, new Date().toISOString());
}

stream.end();

console.log(new Date().toISOString());

// ------

function getPalindromicValues(currentText) {
  const billAmountInCents = currentText;

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

function toFixedNumber(num, digits, base) {
  var pow = Math.pow(base || 10, digits);
  return Math.round(num * pow) / pow;
}

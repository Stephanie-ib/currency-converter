const amountInput = document.getElementById("amount");
const result = document.getElementById("result");
const swapButton = document.getElementById("swapButton");

const fromRate = document.getElementById("fromRate");
const toRate = document.getElementById("toRate");
const fromAmountDisplay = document.getElementById("fromAmountDisplay");
const toAmountDisplay = document.getElementById("convertedAmountDisplay");

let selectedFromCurrency = "USD";
let selectedToCurrency = "EUR";

// Currency to Country Mapping
const currencyToCountry = {
  AUD: "AU",
  USD: "US",
  BGN: "BG",
  BRL: "BR",
  CAD: "CA",
  CHF: "CH",
  CNY: "CN",
  CZK: "CZ",
  DKK: "DK",
  EUR: "EU",
  GBP: "GB",
  HKD: "HK",
  HUF: "HU",
  IDR: "ID",
  ILS: "IL",
  INR: "IN",
  ISK: "IS",
  JPY: "JP",
  KRW: "KR",
  MXN: "MX",
  MYR: "MY",
  NOK: "NO",
  NZD: "NZ",
  PHP: "PH",
  PLN: "PL",
  RON: "RO",
  SEK: "SE",
  SGD: "SG",
  THB: "TH",
  TRY: "TR",
  ZAR: "ZA",
};

// Currency symbols
const symbolMap = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  CNY: "¥",
  RUB: "₽",
  KRW: "₩",
};

function getFlagImage(code) {
  const img = document.createElement("img");
  img.src = `images/${code.toLowerCase()}.png`;
  img.alt = code + " flag";
  img.width = 20;
  img.height = 14;
  img.style.marginRight = "8px";

  img.onerror = function () {
    this.src = "./images/flag-solid.svg";
  };

  return img;
}

async function loadCurrencyDropdown() {
  try {
    const res = await fetch("https://api.frankfurter.app/currencies");
    const currencies = await res.json();

    populateDropdown("from", currencies);
    populateDropdown("to", currencies);
  } catch (error) {
    result.innerText = "Error loading currencies.";
    console.error(error);
  }
}

function populateDropdown(type, currencies) {
  const list = document.getElementById(`${type}CurrencyList`);
  const selected = document.getElementById(`${type}Selected`);
  const dropdown = document.getElementById(`${type}Dropdown`);

  for (const code in currencies) {
    const item = document.createElement("div");
    item.className = "dropdown-item";

    const flag = getFlagImage(currencyToCountry[code] || "xx");
    item.appendChild(flag);
    item.append(` ${code} - ${currencies[code]}`);
    item.dataset.value = code;

    item.addEventListener("click", () => {
      selected.innerHTML = "";
      selected.appendChild(getFlagImage(currencyToCountry[code] || "xx"));
      selected.append(` ${code} - ${currencies[code]}`);
      dropdown.classList.remove("open");

      if (type === "from") {
        selectedFromCurrency = code;
      } else {
        selectedToCurrency = code;
      }

      if (amountInput.value) convertCurrency(); // auto-update if input exists
    });

    list.appendChild(item);
  }

  // Default selection
  const defaultCode = type === "from" ? "USD" : "EUR";
  selected.innerHTML = "";
  selected.appendChild(getFlagImage(currencyToCountry[defaultCode] || "xx"));
  selected.append(` ${defaultCode} - ${currencies[defaultCode]}`);

  selected.addEventListener("click", () => {
    dropdown.classList.toggle("open");
  });
}

async function convertCurrency() {
  const amount = parseFloat(amountInput.value);
  if (!amount || isNaN(amount) || amount <= 0) {
    result.innerText = "Please enter a valid amount.";
    return;
  }

  const url = `https://api.frankfurter.app/latest?amount=${amount}&from=${selectedFromCurrency}&to=${selectedToCurrency}`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    const converted = data.rates[selectedToCurrency];
    const inverseRate = 1 / converted;
    const symbolFrom = symbolMap[selectedFromCurrency] || "";
    const symbolTo = symbolMap[selectedToCurrency] || "";

    // Display updated amounts
    fromAmountDisplay.innerText = `${symbolFrom}${amount}`;
    toAmountDisplay.innerText = `${symbolTo}${converted.toFixed(2)}`;

    fromRate.innerText = `1 ${selectedFromCurrency} = ${converted.toFixed(
      4
    )} ${selectedToCurrency}`;
    toRate.innerText = `1 ${selectedToCurrency} = ${inverseRate.toFixed(
      4
    )} ${selectedFromCurrency}`;

    document.getElementById(
      "updatedTime"
    ).innerText = `Last updated on: ${new Date().toDateString()}`;
  } catch (err) {
    console.error("Conversion error:", err);
    result.innerText = "Error fetching rates.";
  }
}

// Swap logic
swapButton.addEventListener("click", () => {
  [selectedFromCurrency, selectedToCurrency] = [
    selectedToCurrency,
    selectedFromCurrency,
  ];

  // Swap selected text
  const fromSelected = document.getElementById("fromSelected");
  const toSelected = document.getElementById("toSelected");
  const tempHTML = fromSelected.innerHTML;
  fromSelected.innerHTML = toSelected.innerHTML;
  toSelected.innerHTML = tempHTML;

  convertCurrency();
});

document
  .getElementById("convertButton")
  .addEventListener("click", convertCurrency);

loadCurrencyDropdown();

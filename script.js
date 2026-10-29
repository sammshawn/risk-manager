// ============================================
//  RISK MANAGER — POSITION SIZE CALCULATOR
// ============================================

// ---- DOM REFS ----
const balanceInput   = document.getElementById("balance");
const riskPctInput   = document.getElementById("riskPct");
const stopLossInput  = document.getElementById("stopLoss");
const pipValueInput  = document.getElementById("pipValue");
const resetBtn       = document.getElementById("resetBtn");

const stakeEl         = document.getElementById("stake");
const stakeSubEl      = document.getElementById("stakeSub");
const riskAmountEl    = document.getElementById("riskAmount");
const posSizeEl       = document.getElementById("posSize");
const maxLossEl       = document.getElementById("maxLoss");
const lossesToZeroEl  = document.getElementById("lossesToZero");
const riskLevelText   = document.getElementById("riskLevelText");
const riskMeterFill   = document.getElementById("riskMeterFill");
const adviceBox       = document.getElementById("adviceBox");
const adviceText      = document.getElementById("adviceText");
const riskHint        = document.getElementById("riskHint");

const afterLossesEl    = document.getElementById("afterLosses");
const afterLossesSubEl = document.getElementById("afterLossesSub");
const afterWinsEl      = document.getElementById("afterWins");
const afterWinsSubEl   = document.getElementById("afterWinsSub");

// ---- DEFAULTS ----
const DEFAULTS = {
  balance: 1000,
  riskPct: 1,
  stopLoss: 20,
  pipValue: 1,
};

// ---- CALCULATE ----
function calculate() {
  const balance  = parseFloat(balanceInput.value)  || 0;
  const riskPct  = parseFloat(riskPctInput.value)  || 0;
  const stopLoss = parseFloat(stopLossInput.value) || 0;
  const pipValue = parseFloat(pipValueInput.value) || 0;

  // Risk amount in dollars
  const riskAmount = (balance * riskPct) / 100;

  // Position size in lots
  // Formula: riskAmount / (stopLoss * pipValue)
  const posSize = stopLoss > 0 && pipValue > 0
    ? riskAmount / (stopLoss * pipValue)
    : 0;

  // Stake per trade (this is what the trader actually risks)
  const stake = riskAmount;

  // Render results
  stakeEl.textContent = formatMoney(stake);
  stakeSubEl.textContent = `${riskPct.toFixed(1)}% of your $${balance.toLocaleString()} account`;

  riskAmountEl.textContent = formatMoney(riskAmount);
  posSizeEl.textContent    = posSize.toFixed(2) + " lots";
  maxLossEl.textContent    = "-" + formatMoney(stake);

  // Consecutive losses to zero (approximation: balance / riskAmount)
  const lossesToZero = riskAmount > 0 ? Math.floor(balance / riskAmount) : 0;
  lossesToZeroEl.textContent = lossesToZero > 0 ? lossesToZero + " trades" : "—";

  // Update hint
  riskHint.textContent = `${formatMoney(riskAmount)} risk on a $${balance.toLocaleString()} account`;

  // Risk level meter
  updateRiskMeter(riskPct);

  // Advice
  updateAdvice(riskPct, lossesToZero);

  // What-if scenarios
  updateWhatIf(balance, riskAmount);
}

// ---- RISK METER ----
function updateRiskMeter(riskPct) {
  // Map 0–10% to 0–100% fill
  const fillPct = Math.min(100, (riskPct / 10) * 100);
  riskMeterFill.style.width = fillPct + "%";

  let color, label;
  if (riskPct <= 1) {
    color = "var(--green)"; label = "Safe";
  } else if (riskPct <= 2) {
    color = "var(--green)"; label = "Conservative";
  } else if (riskPct <= 3) {
    color = "var(--amber)"; label = "Moderate";
  } else if (riskPct <= 5) {
    color = "var(--amber)"; label = "Aggressive";
  } else {
    color = "var(--red)"; label = "Danger";
  }
  riskMeterFill.style.background = color;
  riskLevelText.textContent = label;
  riskLevelText.style.color = color;
}

// ---- ADVICE ----
function updateAdvice(riskPct, lossesToZero) {
  adviceBox.classList.remove("warn", "danger");

  if (riskPct <= 1) {
    adviceBox.querySelector(".advice-icon").textContent = "✅";
    adviceText.textContent = "Excellent. Professionals risk 1% or less per trade. You can survive " + lossesToZero + " losses in a row.";
  } else if (riskPct <= 2) {
    adviceBox.querySelector(".advice-icon").textContent = "✅";
    adviceText.textContent = "Solid. This is the standard most pros use. You can survive " + lossesToZero + " losses in a row.";
  } else if (riskPct <= 3) {
    adviceBox.classList.add("warn");
    adviceBox.querySelector(".advice-icon").textContent = "⚠️";
    adviceText.textContent = "Slightly aggressive. Consider dropping to 1–2%. You can only survive " + lossesToZero + " losses in a row.";
  } else if (riskPct <= 5) {
    adviceBox.classList.add("warn");
    adviceBox.querySelector(".advice-icon").textContent = "⚠️";
    adviceText.textContent = "High risk. Only " + lossesToZero + " consecutive losses will wipe your account. Reduce risk.";
  } else {
    adviceBox.classList.add("danger");
    adviceBox.querySelector(".advice-icon").textContent = "🚨";
    adviceText.textContent = "Dangerous. At this risk level, a normal losing streak will blow your account. Cut risk to 1–2% immediately.";
  }
}

// ---- WHAT-IF ----
function updateWhatIf(balance, riskAmount) {
  // Assume 1:1 risk-reward for simplicity — 5 wins = +5 * riskAmount
  const afterLosses = Math.max(0, balance - 5 * riskAmount);
  const afterWins   = balance + 5 * riskAmount;

  afterLossesEl.textContent = formatMoney(afterLosses);
  afterWinsEl.textContent   = formatMoney(afterWins);

  const lossPct = ((balance - afterLosses) / balance) * 100;
  afterLossesSubEl.textContent = `-${lossPct.toFixed(1)}% of account`;

  const winPct = ((afterWins - balance) / balance) * 100;
  afterWinsSubEl.textContent = `+${winPct.toFixed(1)}% of account`;
}

// ---- HELPERS ----
function formatMoney(n) {
  if (!isFinite(n) || isNaN(n)) return "$0.00";
  return "$" + n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ---- EVENT LISTENERS ----
[balanceInput, riskPctInput, stopLossInput, pipValueInput].forEach((el) => {
  el.addEventListener("input", calculate);
});

resetBtn.addEventListener("click", () => {
  balanceInput.value  = DEFAULTS.balance;
  riskPctInput.value  = DEFAULTS.riskPct;
  stopLossInput.value = DEFAULTS.stopLoss;
  pipValueInput.value = DEFAULTS.pipValue;
  calculate();
});

// ---- BOOT ----
calculate();
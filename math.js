/* math.js
 * Deterministic mortgage math. Kept completely separate from ai.js so the
 * AI never does arithmetic (matches the team's "no AI math" guardrail).
 */

// Spitzer (equal-payment) monthly payment.
// principal in currency, annualRatePct e.g. 4.29, years e.g. 30.
function monthlyPayment(principal, annualRatePct, years) {
  const r = (annualRatePct / 100) / 12;
  const n = years * 12;
  if (n <= 0) return 0;
  if (r === 0) return principal / n;          // 0% edge case
  return principal * r / (1 - Math.pow(1 + r, -n));
}

// Total amount paid over the whole loan life.
function totalCost(principal, annualRatePct, years) {
  return monthlyPayment(principal, annualRatePct, years) * years * 12;
}

// Classify how heavy the payment is against monthly income.
function budgetPressure(payment, monthlyIncome) {
  if (!monthlyIncome) return { label: "—", pct: 0, zone: "info" };
  const pct = Math.round((payment / monthlyIncome) * 100);
  let zone = "low", label = "Healthy";
  if (pct >= 36)      { zone = "high";   label = "High"; }
  else if (pct >= 28) { zone = "medium"; label = "Moderate"; }
  return { label, pct, zone };
}

// Compare two offers and return everything the UI needs.
function compareOffers(principal, income, a, b) {
  const payA = monthlyPayment(principal, a.rate, a.years);
  const payB = monthlyPayment(principal, b.rate, b.years);
  const totA = totalCost(principal, a.rate, a.years);
  const totB = totalCost(principal, b.rate, b.years);

  const cheaper = totA <= totB ? "A" : "B";
  const savings = Math.abs(totA - totB);
  const durationsDiffer = a.years !== b.years;

  return {
    a: { ...a, payment: payA, total: totA },
    b: { ...b, payment: payB, total: totB },
    cheaper,
    savings,
    durationsDiffer,
    selectedPressure: budgetPressure(cheaper === "A" ? payA : payB, income)
  };
}

// Format a number as a clean money string.
function money(n) {
  return "₪" + Math.round(n).toLocaleString("en-US");
}

window.MortgageMath = { monthlyPayment, totalCost, budgetPressure, compareOffers, money };

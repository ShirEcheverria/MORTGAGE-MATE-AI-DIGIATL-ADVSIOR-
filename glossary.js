/* glossary.js
 * A small dictionary of Israeli mortgage terms.
 * Used in two places:
 *   1. The local fallback analyzer (when there is no API key) builds its
 *      explanations from here.
 *   2. The "Key Terms Explained" card can show the plain-language meaning.
 *
 * risk levels: "high" (red), "medium" (amber), "low" (green), "info" (neutral)
 */
const GLOSSARY = [
  {
    id: "prime",
    term: "Prime",
    aliases: ["prime", "פריים", "ריבית פריים"],
    short: "A variable interest rate that follows the Bank of Israel rate.",
    long: "Prime is a variable rate. It moves up or down together with the Bank of Israel base rate. If national rates rise, your monthly payment on this part of the loan rises too.",
    risk: "medium"
  },
  {
    id: "index-linked",
    term: "Index-Linked (צמוד מדד)",
    aliases: ["צמוד מדד", "צמודה למדד", "index linked", "index-linked", "cpi", "מדד"],
    short: "The remaining balance grows with inflation (CPI).",
    long: "An index-linked track ties your debt to the Consumer Price Index. When inflation goes up, the amount you still owe goes up as well, even though you keep paying every month. This can make the loan more expensive over time.",
    risk: "high"
  },
  {
    id: "fixed-unlinked",
    term: "Fixed Non-Linked (קל\"צ)",
    aliases: ["קלצ", "קל\"צ", "kalatz", "fixed non-linked", "fixed unlinked", "ריבית קבועה לא צמודה"],
    short: "The rate and the balance never change.",
    long: "A fixed non-linked track (Kalatz) keeps the same interest rate for the whole period and is not tied to inflation. The payment is the most predictable, but the starting rate is usually higher.",
    risk: "low"
  },
  {
    id: "fixed-linked",
    term: "Fixed Index-Linked (ק\"צ)",
    aliases: ["קצ", "ק\"צ", "katz", "fixed linked", "ריבית קבועה צמודה"],
    short: "Fixed rate, but the balance still grows with inflation.",
    long: "A fixed index-linked track (Katz) keeps the same interest rate, but the principal is still linked to the Consumer Price Index. So the rate is stable, yet the amount you owe can still rise with inflation.",
    risk: "high"
  },
  {
    id: "variable",
    term: "Variable Rate",
    aliases: ["variable", "ריבית משתנה", "משתנה"],
    short: "The rate can change at set update points.",
    long: "A variable track changes at fixed update points (for example every 5 years). Your payment may increase or decrease at each update, so future payments are uncertain.",
    risk: "medium"
  },
  {
    id: "ltv",
    term: "Loan-to-Value (LTV)",
    aliases: ["ltv", "loan to value", "loan-to-value", "אחוז מימון"],
    short: "How much of the property value the loan covers.",
    long: "Loan-to-Value is the share of the apartment's price that the loan covers. In Israel it is capped at 75% for a first home. A higher LTV usually means higher risk and a higher interest rate.",
    risk: "info"
  },
  {
    id: "lock-in",
    term: "Early Repayment Fee (עמלת פירעון מוקדם)",
    aliases: ["early repayment", "lock-in", "lock in", "פירעון מוקדם", "עמלת פירעון", "קנס"],
    short: "A possible fee for paying the loan off early.",
    long: "If you repay or refinance a fixed track early, the bank may charge an early repayment fee. It depends on the gap between your rate and current market rates, so it can be large when rates have dropped.",
    risk: "medium"
  },
  {
    id: "spitzer",
    term: "Spitzer Amortization (שפיצר)",
    aliases: ["spitzer", "שפיצר", "לוח שפיצר"],
    short: "Equal monthly payments over the whole period.",
    long: "With a Spitzer schedule you pay the same amount every month. At the start most of it is interest and only a little is principal, which means you pay more interest overall compared with equal-principal schedules.",
    risk: "info"
  }
];

// Find every glossary entry whose term/alias appears in a piece of text.
function matchGlossaryTerms(text) {
  const lower = (text || "").toLowerCase();
  const found = [];
  for (const entry of GLOSSARY) {
    const hit = entry.aliases.some(a => lower.includes(a.toLowerCase()));
    if (hit) found.push(entry);
  }
  return found;
}

// Expose for the browser (no modules / no build step on purpose).
window.GLOSSARY = GLOSSARY;
window.matchGlossaryTerms = matchGlossaryTerms;

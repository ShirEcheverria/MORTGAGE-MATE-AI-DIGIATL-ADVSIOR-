# Mortgage Mate — Expanded Mini MVP (₪)

A 6-screen mobile-web app styled to the Mortgage Mate screenshots.

## Screens
- **Dashboard** — Mortgage Snapshot + budget gauge + tools + Market Insights.
- **Property Search** — three property paths; tap any card to open the **Quick Mortgage Calculator**.
- **Translator** — upload a real file (PDF/TXT) or paste text → plain-language explanation (AI).
- **Compare** — two offers side by side, Spitzer math, Budget Pressure gauge.
- **Assistant** — AI chat about mortgage terms.
- **Profile** — income / loans / property type → feeds Compare.

Nav: bottom tabs (Property / Translator / Compare / Assistant); the logo returns to the
Dashboard; the avatar (top-right) opens your Profile; the bell shows notifications.

## Highlights
- All money is in **shekels (₪)**.
- **Spinning-logo** splash on load + loading animation between screens and while the AI thinks.
- **Quick calculator** modal from Property Search cards (monthly + total repayment).
- **Real document upload**: PDF text is read with pdf.js; .txt is read directly.
- Toasts + a working notifications panel; previously-dead buttons now respond.

## Run it (no install)
Keep all files in one folder and open `index.html`. Works offline; icons, fonts and
pdf.js load from a CDN (need internet at load time). Images are embedded in `assets.js`,
so they never go missing.

## Connect the AI (Assistant chat + Translator)
Open `ai.js` and set your key:
```js
const CONFIG = { PROVIDER: "anthropic", API_KEY: "PASTE-YOUR-KEY-HERE", ... };
```
Save & refresh. With a key the chat talks to the real AI; without one it uses the
built-in offline replies (the Assistant shows a small "demo mode" banner).

## Files
index.html · style.css · app.js · ai.js · math.js · glossary.js · assets.js · logo.png · mark.png · house.png · invest.png · subsidy.png

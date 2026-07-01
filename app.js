/* app.js — Mortgage Mate (full): assets, splash/loader, toasts, notifications,
 * quick calculator, real document upload, AI chat, profile. No build step. */

const profile = { income: 22000, loans: 0, ltv: 75, level: "Basic" };
const chatHistory = [];
let translatorSeeded = false, compareSeeded = false;
const COMPARE_AMOUNT = 1500000;

const SAMPLE_OFFER =
`Bank proposal - apartment financing
Loan amount: 1,500,000 NIS
Track 1: Prime, variable interest 5.25% p.a.
Track 2: Index-linked (צמוד מדד), fixed interest 3.90%
Repayment period: 25 years, Spitzer amortization
Maximum LTV: 75%. Early repayment fee may apply.`;

document.addEventListener("DOMContentLoaded", init);
function init() {
  assignAssets();
  setupNav();
  setupTranslator();
  setupUpload();
  setupAssistant();
  setupProfile();
  setupPropertySearch();
  setupCalc();
  setupChrome();      // bell, toasts, splash
}

/* ---------- assets (base64 from assets.js, so images never go missing) ---------- */
function assignAssets() {
  const A = window.MM_ASSETS || {};
  const set = (id, key) => { const el = document.getElementById(id); if (el && A[key]) el.src = A[key]; };
  set("brandLogo", "logo");
  set("illuHouse", "house");
  set("illuInvest", "invest");
  set("illuSubsidy", "subsidy");
  document.querySelectorAll(".spin-mark").forEach(img => { if (A.mark) img.src = A.mark; });
}

/* ---------- chrome: splash, loader, toast, notifications ---------- */
function setupChrome() {
  setTimeout(() => document.getElementById("splash").classList.add("fade"), 1300);
  setTimeout(() => document.getElementById("splash").classList.add("hidden"), 1850);

  const bell = document.getElementById("bellBtn");
  const panel = document.getElementById("notifPanel");
  bell.addEventListener("click", e => { e.stopPropagation(); panel.classList.toggle("hidden"); });
  document.addEventListener("click", () => panel.classList.add("hidden"));
  panel.addEventListener("click", e => e.stopPropagation());

  document.querySelectorAll(".js-toast").forEach(el =>
    el.addEventListener("click", () => toast(el.dataset.msg)));
}
let toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add("hidden"), 3200);
}
function showLoader() { document.getElementById("loader").classList.remove("hidden"); }
function hideLoader() { document.getElementById("loader").classList.add("hidden"); }

/* ---------- navigation (with spinning-logo loading between screens) ---------- */
function setupNav() {
  document.querySelectorAll("[data-tab]").forEach(el =>
    el.addEventListener("click", () => switchTo(el.dataset.tab)));
}
function switchTo(tab) {
  showLoader();
  setTimeout(() => {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const sc = document.getElementById("screen-" + tab); if (sc) sc.classList.add("active");
    document.querySelectorAll(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.tab === tab));
    if (tab === "translator" && !translatorSeeded) seedTranslator();
    if (tab === "compare" && !compareSeeded) runCompare();
    window.scrollTo({ top: 0 });
    hideLoader();
  }, 420);
}

/* ---------- Property Search ---------- */
function setupPropertySearch() {
  const search = document.getElementById("propSearch");
  search.addEventListener("input", () => {
    const q = search.value.toLowerCase();
    document.querySelectorAll(".prop-card").forEach(c => {
      const hit = !q || c.querySelector(".prop-title").textContent.toLowerCase().includes(q);
      c.style.display = hit ? "flex" : "none";
    });
  });
  document.querySelectorAll(".js-calc").forEach(card =>
    card.addEventListener("click", () => openCalc(card.dataset)));
}

/* ---------- Quick Mortgage Calculator (modal) ---------- */
function setupCalc() {
  const modal = document.getElementById("calcModal");
  document.getElementById("calcClose").addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", e => { if (e.target === modal) modal.classList.add("hidden"); });
  ["calcAmount", "calcRate", "calcYears"].forEach(id =>
    document.getElementById(id).addEventListener("input", calcUpdate));
  document.getElementById("calcToCompare").addEventListener("click", () => {
    modal.classList.add("hidden"); switchTo("compare");
  });
}
function openCalc(d) {
  document.getElementById("calcTitle").textContent = (d.calc || "Quick") + " Calculator";
  document.getElementById("calcAmount").value = d.amount || 1500000;
  document.getElementById("calcRate").value = d.rate || 4.5;
  document.getElementById("calcYears").value = d.years || 30;
  calcUpdate();
  document.getElementById("calcModal").classList.remove("hidden");
}
function calcUpdate() {
  const M = window.MortgageMath;
  const amt = +document.getElementById("calcAmount").value || 0;
  const rate = +document.getElementById("calcRate").value || 0;
  const yrs = +document.getElementById("calcYears").value || 1;
  document.getElementById("calcMonthly").textContent = M.money(M.monthlyPayment(amt, rate, yrs));
  document.getElementById("calcTotal").textContent = M.money(M.totalCost(amt, rate, yrs));
}

/* ---------- Translator ---------- */
function setupTranslator() {
  const lb = document.querySelectorAll(".level-btn");
  lb.forEach(b => b.addEventListener("click", () => {
    lb.forEach(x => x.classList.remove("active"));
    b.classList.add("active"); profile.level = b.dataset.level;
  }));
  document.getElementById("sampleLink").addEventListener("click", () => {
    document.getElementById("offerInput").value = SAMPLE_OFFER;
  });
  document.getElementById("analyzeBtn").addEventListener("click", () => runAnalyze());
}
async function runAnalyze() {
  const inp = document.getElementById("offerInput");
  const t = inp.value.trim();
  if (!t) { inp.focus(); inp.classList.add("shake"); setTimeout(() => inp.classList.remove("shake"), 500); return; }
  showLoader();
  try { renderTranslation(await window.analyze(t, profile.level)); }
  catch { toast("Something went wrong analyzing the document."); }
  finally { hideLoader(); }
}
async function seedTranslator() {
  translatorSeeded = true;
  renderTranslation(await window.analyze(SAMPLE_OFFER, profile.level));
}
function renderTranslation(r) {
  const ex = r.extracted || {}, cc = (ex.confidence || "").toLowerCase();
  const off = r._offline ? `<p class="offline-note">Offline analyzer. Add an API key in ai.js for full AI explanations.</p>` : "";
  const kt = (r.keyTerms || []).map(t => `
    <div class="term-row risk-${t.risk || "info"}"><div class="term-name">${esc(t.term)}<i class="ti ti-info-circle"></i></div><div class="term-text">${esc(t.explanation)}</div></div>`).join("");
  document.getElementById("results").innerHTML = `
    <div class="card reveal"><div class="card-head"><span class="card-icon"><i class="ti ti-file-description"></i></span><span class="card-title">Extracted Information</span></div>
      <div class="row"><span class="row-icon"><i class="ti ti-percentage"></i></span><span class="row-label">Interest Rate</span><span class="row-value">${esc(ex.interestRate || "Not stated")}</span></div>
      <div class="row"><span class="row-icon"><i class="ti ti-link"></i></span><span class="row-label">Linkage Type</span><span class="row-value">${esc(ex.linkageType || "Not stated")}</span></div>
      <div class="row"><span class="row-icon"><i class="ti ti-calendar"></i></span><span class="row-label">Duration</span><span class="row-value">${esc(ex.duration || "Not stated")}</span></div>
      <div class="confidence">Confidence Level: <strong class="conf-${cc}">${esc(ex.confidence || "—")}</strong><span class="conf-dot conf-${cc}"></span></div></div>
    <div class="card reveal"><div class="card-head"><span class="card-icon"><i class="ti ti-sparkles"></i></span><span class="card-title">In Plain Language</span></div><p class="summary-text">${esc(r.summary || "")}</p>${off}</div>
    <div class="card reveal"><div class="card-head"><span class="card-icon"><i class="ti ti-book-2"></i></span><span class="card-title">Key Terms Explained</span></div>${kt || `<p class="term-text">No specific terms were detected.</p>`}</div>`;
}

/* ---------- Real document upload (PDF / TXT / image) ---------- */
function setupUpload() {
  const input = document.getElementById("fileInput");
  const drop = document.getElementById("dropCard");
  document.getElementById("chooseFile").addEventListener("click", () => input.click());
  input.addEventListener("change", () => { if (input.files[0]) handleFile(input.files[0]); });
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("dragover"); }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("dragover"); }));
  drop.addEventListener("drop", e => { const f = e.dataTransfer.files[0]; if (f) handleFile(f); });
}
async function handleFile(file) {
  const nameEl = document.getElementById("fileName");
  nameEl.classList.remove("hidden");
  nameEl.innerHTML = `<i class="ti ti-file"></i> ${esc(file.name)}`;
  showLoader();
  try {
    let text = "";
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      text = await extractPdf(file);
    } else if (file.type.startsWith("text") || file.name.toLowerCase().endsWith(".txt")) {
      text = await file.text();
    } else if (file.type.startsWith("image/")) {
      hideLoader();
      toast("Image uploaded. Image reading needs an API key — please paste the text for now.");
      return;
    }
    if (text.trim()) {
      document.getElementById("offerInput").value = text.trim().slice(0, 6000);
      hideLoader();
      runAnalyze();
    } else { hideLoader(); toast("Couldn't read text from that file. Try pasting the text."); }
  } catch (err) { hideLoader(); toast("Couldn't read that file. Try a PDF/TXT or paste the text."); }
}
async function extractPdf(file) {
  if (!window.pdfjsLib) throw new Error("pdf.js not loaded");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let out = "";
  for (let p = 1; p <= Math.min(pdf.numPages, 5); p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    out += content.items.map(i => i.str).join(" ") + "\n";
  }
  return out;
}

/* ---------- Compare (₪, uses profile income) ---------- */
function runCompare() {
  compareSeeded = true;
  const a = { rate: 4.29, years: 30, link: "Fixed" };
  const b = { rate: 4.89, years: 30, link: "Variable" };
  renderCompare(window.MortgageMath.compareOffers(COMPARE_AMOUNT, profile.income, a, b), COMPARE_AMOUNT);
}
function gaugeSVG(pct) {
  const f = Math.min(pct / 45, 1), ang = Math.round(f * 180 - 90);
  return `<svg viewBox="0 0 110 64" style="width:96px;height:56px"><path d="M8 58 A47 47 0 0 1 31.5 17.3" fill="none" stroke="#7CB36B" stroke-width="7" stroke-linecap="round"/><path d="M31.5 17.3 A47 47 0 0 1 78.5 17.3" fill="none" stroke="#E0A93B" stroke-width="7" stroke-linecap="round"/><path d="M78.5 17.3 A47 47 0 0 1 102 58" fill="none" stroke="#D2694C" stroke-width="7" stroke-linecap="round"/><line x1="55" y1="58" x2="55" y2="24" stroke="#0E2A47" stroke-width="3" stroke-linecap="round" transform="rotate(${ang} 55 58)"/><circle cx="55" cy="58" r="4" fill="#0E2A47"/></svg>`;
}
function offerCard(label, o, best) {
  const M = window.MortgageMath;
  return `<div class="offer-card ${best ? "best" : ""}">${best ? `<div class="best-badge"><i class="ti ti-star"></i> BEST OVERALL</div>` : ""}
    <div class="offer-head"><span class="offer-name">Offer ${label}</span><span class="select-dot ${best ? "on" : ""}"><i class="ti ti-${best ? "circle-check" : "circle"}"></i></span></div>
    <div class="offer-line"><span class="ol-icon"><i class="ti ti-percentage"></i></span><span class="ol-label">Interest Rate</span><span class="ol-val">${o.rate}%<span>${o.link === "Fixed" ? "Fixed" : "Variable"}</span></span></div>
    <div class="offer-line"><span class="ol-icon"><i class="ti ti-calendar"></i></span><span class="ol-label">Term</span><span class="ol-val">${o.years} Years</span></div>
    <div class="offer-line"><span class="ol-icon"><i class="ti ti-link"></i></span><span class="ol-label">Linkage Type</span><span class="ol-val">${o.link}</span></div>
    <div class="offer-foot js-toast" data-msg="Offer ${label}: ${o.rate}% ${o.link}, ${o.years} years, monthly ${M.money(o.payment)}."><div><div class="of-lbl">Est. Monthly Payment</div><div class="of-val">${M.money(o.payment)}</div></div><i class="ti ti-chevron-right"></i></div></div>`;
}
function renderCompare(res, principal) {
  const M = window.MortgageMath, pr = res.selectedPressure, sel = res.cheaper === "A" ? res.a : res.b;
  document.getElementById("compareResults").innerHTML = `
    <div class="card cmp-summary reveal">
      <div class="cs-col"><span class="cs-icon"><i class="ti ti-wallet"></i></span><span class="cs-label">Est. Monthly Payment</span><span class="cs-val">${M.money(sel.payment)}</span><span class="cs-sub">vs. other offer</span></div>
      <div class="cs-col"><span class="cs-icon"><i class="ti ti-currency-dollar"></i></span><span class="cs-label">Loan Amount</span><span class="cs-val">${M.money(principal)}</span><span class="cs-sub">${profile.ltv}% LTV</span></div>
      <div class="cs-col"><span class="cs-label">Budget Pressure</span>${gaugeSVG(pr.pct)}<span class="press-label press-${pr.zone}">${pr.label}</span><span class="cs-sub">${pr.pct}% of income</span></div></div>
    <div class="section-h"><h2>Your Offers</h2></div>
    <div class="offers-row reveal">${offerCard("A", res.a, res.cheaper === "A")}${offerCard("B", res.b, res.cheaper === "B")}</div>
    <div class="card total-card reveal"><div class="tc-flex"><span class="tc-icon"><i class="ti ti-chart-bar"></i></span>
      <div class="tc-body"><div class="card-title">Total Cost Comparison</div><p class="summary-text" style="margin-top:6px">Offer ${res.cheaper} could save you <b class="save-amt">${M.money(res.savings)}</b> over the life of the loan.</p>
      <span class="tc-link js-toast" data-msg="Over the full term, Offer ${res.cheaper} totals less interest, saving about ${M.money(res.savings)}.">View full breakdown <i class="ti ti-chevron-right"></i></span></div>
      <div class="tc-chart"><svg viewBox="0 0 120 54" preserveAspectRatio="none"><polyline fill="none" stroke="#0E2A47" stroke-width="2" points="0,44 20,38 40,32 60,25 80,18 100,11 118,5"/><polyline fill="none" stroke="#7CB36B" stroke-width="2" points="0,46 20,42 40,37 60,32 80,26 100,21 118,16"/></svg><div class="save-pill"><div class="sp-lbl">SAVE</div><div class="sp-val">${M.money(res.savings)}</div></div></div></div></div>`;
  // re-bind toasts inside freshly rendered compare
  document.querySelectorAll("#screen-compare .js-toast").forEach(el =>
    el.addEventListener("click", () => toast(el.dataset.msg)));
}

/* ---------- Assistant (AI chat) ---------- */
function setupAssistant() {
  const box = document.getElementById("chatMessages");
  const inp = document.getElementById("chatInput");
  const snd = document.getElementById("chatSend");
  if (window.aiConfigured && !window.aiConfigured())
    document.getElementById("aiBanner").classList.remove("hidden");

  function add(role, text, typing) {
    const el = document.createElement("div");
    el.className = "msg msg-" + role + (typing ? " typing" : "");
    el.innerHTML = `<div class="bubble">${esc(text)}</div>`;
    box.appendChild(el); box.scrollTop = box.scrollHeight; return el;
  }
  add("assistant", "Hi! I can explain mortgage terms in plain language. Ask me about Prime, index-linking, LTV, or what happens if rates rise.");

  async function submit(text) {
    text = (text || inp.value).trim(); if (!text) return;
    inp.value = ""; add("user", text);
    chatHistory.push({ role: "user", content: text });
    const ty = add("assistant", "…", true);
    const reply = await window.chatReply(chatHistory);
    ty.querySelector(".bubble").textContent = reply; ty.classList.remove("typing");
    chatHistory.push({ role: "assistant", content: reply });
    box.scrollTop = box.scrollHeight;
  }
  snd.addEventListener("click", () => submit());
  inp.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
  document.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => submit(c.dataset.q)));
}

/* ---------- Profile ---------- */
function setupProfile() {
  document.getElementById("saveProfile").addEventListener("click", function () {
    profile.income = +document.getElementById("pIncome").value || 0;
    profile.loans = +document.getElementById("pLoans").value || 0;
    profile.ltv = +document.getElementById("pType").value || 75;
    profile.level = document.getElementById("pLevel").value || "Basic";
    refreshProfileLimits();
    document.querySelectorAll(".level-btn").forEach(b => b.classList.toggle("active", b.dataset.level === profile.level));
    if (compareSeeded) runCompare();
    this.innerHTML = `<i class="ti ti-check"></i> Saved`;
    toast("Profile saved. Your Compare budget pressure is updated.");
    setTimeout(() => this.innerHTML = `<i class="ti ti-device-floppy"></i> Save Profile`, 1500);
  });
  refreshProfileLimits();
}
function refreshProfileLimits() {
  const M = window.MortgageMath, disp = Math.max(profile.income - profile.loans, 0);
  document.getElementById("pDisp").textContent = M.money(disp);
  document.getElementById("pMaxPay").textContent = M.money(disp * 0.38);
  document.getElementById("pLtv").textContent = profile.ltv + "%";
}

/* ---------- helpers ---------- */
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
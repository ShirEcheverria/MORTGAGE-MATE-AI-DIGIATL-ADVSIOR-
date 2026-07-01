/* ai.js — גרסה פשוטה לבדיקה מקומית.
 * מתחברת ישירות ל-Claude. המפתח יושב כאן בקובץ, וזה בסדר כל עוד את בודקת
 * על המחשב שלך בלבד. לפני שמעלים את האפליקציה לאוויר לכל המשתמשים — נעבור
 * לגרסה המאובטחת (server.js) כדי שהמפתח לא ייחשף. */
const CONFIG = {
  // 👇👇 הדביקי כאן את המפתח החדש שלך, בין המרכאות 👇👇
  API_KEY: "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" ,

  MODEL: "claude-sonnet-4-6"
};

const SYSTEM_PROMPT = `You are Mortgage Mate's assistant. Explain Israeli mortgage
terms (Prime, LTV, index-linked / צמוד מדד, Kalatz / קל"צ, variable rate, early
repayment fees, Spitzer) in clear, plain language. Reply in the user's language
(Hebrew or English). Never do arithmetic or give numeric calculations — the app
handles all the math separately. Keep answers short and practical.`;

// ---- מצב מקומי (גיבוי אם אין מפתח או אם החיבור נכשל) ----
window.localChat = function (userText) {
  const text = (userText || "").toLowerCase();
  if (/(rise|rates?|ריבית)/.test(text)) return "If national interest rates rise, variable parts of a mortgage get more expensive.";
  return "I can explain mortgage terms. Try asking about Prime, LTV, or index-linked tracks.";
};

window.localAnalyze = function (rawText, level) {
  return {
    extracted: { interestRate: "Not stated", linkageType: "Not stated", duration: "Not stated", confidence: "Low" },
    summary: "Could not connect to AI, using local mode.",
    keyTerms: []
  };
};

// ---- שיחה אמיתית מול Claude ----
async function chatReply(history) {
  const lastUser = [...history].reverse().find(m => m.role === "user");

  // אם עוד לא הדבקת מפתח — משתמש בתשובות המקומיות.
  if (!CONFIG.API_KEY || CONFIG.API_KEY === "PASTE-YOUR-KEY-HERE") {
    return window.localChat(lastUser ? lastUser.content : "");
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CONFIG.API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: CONFIG.MODEL,
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: history
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Anthropic API Error:", errorText);
      throw new Error("Status: " + res.status);
    }

    const data = await res.json();
    return (data.content || []).map(b => b.text || "").join("").trim();
  } catch (err) {
    console.warn("AI failed, falling back to local:", err.message);
    return window.localChat(lastUser ? lastUser.content : "");
  }
}

// ---- ייצוא לאפליקציה ----
window.chatReply = chatReply;
window.analyze = async function (text, level) { return window.localAnalyze(text, level); };
window.aiConfigured = function () { return !!CONFIG.API_KEY && CONFIG.API_KEY !== "PASTE-YOUR-KEY-HERE"; };

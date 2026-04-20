const API_BASE = "https://zf790xe4jk.execute-api.ap-southeast-1.amazonaws.com";

// ── CSV loader (do not edit) ──────────────────────────────
async function loadCsv(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load CSV: ${path}`);
  const text = await res.text();
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: reject
    });
  });
}

// ── MCQ row mapper (do not edit) ─────────────────────────
function toMcq(rows) {
  return rows.map(r => ({
    id:            (r.id       || "").trim(),
    Question:      (r.question || "").trim(),
    OptionA:       (r.optionA  || "").trim(),
    OptionB:       (r.optionB  || "").trim(),
    OptionC:       (r.optionC  || "").trim(),
    OptionD:       (r.optionD  || "").trim(),
    CorrectAnswer: (r.correct  || "").trim().toUpperCase(),
    Reason:        (r.reason   || "").trim(),
    section: "Quiz",
  }));
}

// ── Summary builder (do not edit) ────────────────────────
function buildSummaryFromCsv(rows, mod) {
  const sentences = rows.map(r => {
    const q   = (r.Question      || "").trim();
    const ans = (r.CorrectAnswer || "").trim();
    const blankCount = (q.match(/\[BLANK\]/g) || []).length;
    let partsAns = blankCount > 1
      ? (ans.includes("/") ? ans.split("/") : ans.split(/\s+/)).map(s => s.trim())
      : [ans];
    const chunks = q.split("[BLANK]");
    const sentenceParts = [];
    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i]) sentenceParts.push({ t: chunks[i] });
      if (i < chunks.length - 1) sentenceParts.push({ b: partsAns[i] ?? ans });
    }
    return sentenceParts;
  });
  return {
    lsKey: `${(mod ? mod.id : "ncse").toUpperCase()}_SUMMARY_V1`,
    title: `${mod ? mod.title : "NCSE"} — Summary`,
    sentences
  };
}

// ── Progress helpers (do not edit) ───────────────────────
const LS_KEY = "NCSE_Agent_Onboarding_Portal_v1";
function loadProgress() { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
function saveProgress(p) { localStorage.setItem(LS_KEY, JSON.stringify(p)); }

const modules = [
  {
    id: "ncse_m1",
    title: "Module 1 — Introduction to NCSE",
    notes: `
- Overview of the NCSE project
- Key contacts and escalation channels
- Service Desk role within NCSE
    `,
    mcqCsv:     "../quizzes_ncse/ncse_m1_mcq.csv",
    summaryCsv: "../quizzes_ncse/ncse_m1_sum.csv",
    passScore: 0
  },

  {
    id: "ncse_m2",
    title: "Module 2 — Call Recordings & Standards",
    notes: `
- Understand call recording procedures
- Know quality standards for calls
- Review and learn from sample recordings
    `,
    mcqCsv:     "../quizzes_ncse/ncse_m2_mcq.csv",
    summaryCsv: "../quizzes_ncse/ncse_m2_sum.csv",
    passScore: 0
  },

  {
    id: "ncse_m3",
    title: "Module 3 — Email Templates",
    notes: `
- Use approved email templates for all responses
- Ensure correct subject line and formatting
- Maintain professional tone in all communications
    `,
    mcqCsv:     "../quizzes_ncse/ncse_m3_mcq.csv",
    summaryCsv: "../quizzes_ncse/ncse_m3_sum.csv",
    passScore: 0
  },

  {
    id: "ncse_m4",
    title: "Module 4 — Escalation List",
    notes: `
- Know the escalation contacts for NCSE
- Understand when to escalate vs resolve at L1
- Always include evidence when escalating
    `,
    mcqCsv:     "../quizzes_ncse/ncse_m4_mcq.csv",
    summaryCsv: "../quizzes_ncse/ncse_m4_sum.csv",
    passScore: 0
  },

  {
    id: "ncse_m5",
    title: "Module 5 — Infinity Guide",
    notes: `
- Navigate the Infinity ticketing system
- Log incidents with correct categorisation
- Use templates and close notes appropriately
    `,
    mcqCsv:     "../quizzes_ncse/ncse_m5_mcq.csv",
    summaryCsv: "../quizzes_ncse/ncse_m5_sum.csv",
    passScore: 0
  },

  {
    id: "ncse_m6",
    title: "Module 6 — Knowledge Articles",
    notes: `
- Refer to knowledge articles before escalating
- Keep knowledge articles updated with new findings
- Use article IDs when logging related incidents
    `,
    mcqCsv:     "../quizzes_ncse/ncse_m6_mcq.csv",
    summaryCsv: "../quizzes_ncse/ncse_m6_sum.csv",
    passScore: 0
  },

];

// ── AWS progress saving (do not edit) ────────────────────
async function saveProgressApi({ userID, moduleID, score, totalQuestions, completed }) {
  try {
    await fetch(`${API_BASE}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID, moduleID, score, totalQuestions, completed })
    });
  } catch (e) { console.error("Failed to save progress:", e); }
}

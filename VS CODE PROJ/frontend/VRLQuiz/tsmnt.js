
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
    lsKey: `${mod.id.toUpperCase()}_SUMMARY_V1`,
    title: `${mod.title} — Summary`,
    sentences
  };
}

// ── Progress helpers (do not edit) ───────────────────────
const LS_KEY = "TSMNT_Agent_Onboarding_Portal_v1";
function loadProgress() { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
function saveProgress(p) { localStorage.setItem(LS_KEY, JSON.stringify(p)); }


const modules = [
  {
    id: "tsmnt_m1",
    title: "Module 1 — Introduction to TSMNT",
    notes: `
- Overview of the TSMNT project
- Key contacts and escalation channels
- Service Desk role within TSMNT
    `,
    mcqCsv:     "../quizzes_tsmnt/tsmnt_m1_mcq.csv",
    summaryCsv: "../quizzes_tsmnt/tsmnt_m1_sum.csv",
    passScore: 0
  },

  {
    id: "tsmnt_m2",
    title: "Module 2 — OneCare ServiceNow Support",
    notes: `
- Understand OneCare ServiceNow workflows
- Log and categorise incidents correctly
- Know escalation paths for ServiceNow issues
    `,
    mcqCsv:     "../quizzes_tsmnt/tsmnt_m2_mcq.csv",
    summaryCsv: "../quizzes_tsmnt/tsmnt_m2_sum.csv",
    passScore: 0
  },

  {
    id: "tsmnt_m3",
    title: "Module 3 — Email Templates",
    notes: `
- Use approved email templates for all responses
- Ensure Incident ID is in the subject line
- CC ltalink@ncs.com.sg on all case emails
    `,
    mcqCsv:     "../quizzes_tsmnt/tsmnt_m3_mcq.csv",
    summaryCsv: "../quizzes_tsmnt/tsmnt_m3_sum.csv",
    passScore: 0
  },

  {
    id: "tsmnt_m4",
    title: "Module 4 — Escalation",
    notes: `
- Know when and how to escalate cases
- Include evidence and steps already tried
- Assign to the correct support group in the system
    `,
    mcqCsv:     "../quizzes_tsmnt/tsmnt_m4_mcq.csv",
    summaryCsv: "../quizzes_tsmnt/tsmnt_m4_sum.csv",
    passScore: 0
  },

  {
    id: "tsmnt_m5",
    title: "Module 5 — Important Emails & Acknowledgement",
    notes: `
- Read and acknowledge all important project emails
- Understand updates and policy changes
- Follow up on action items within deadlines
    `,
    mcqCsv:     "../quizzes_tsmnt/tsmnt_m5_mcq.csv",
    summaryCsv: "../quizzes_tsmnt/tsmnt_m5_sum.csv",
    passScore: 0
  },

  {
    id: "tsmnt_m6",
    title: "Module 6 — Infinity Guide",
    notes: `
- Navigate the Infinity ticketing system
- Log incidents with the correct categorisation
- Use templates and close notes appropriately
    `,
    mcqCsv:     "../quizzes_tsmnt/tsmnt_m6_mcq.csv",
    summaryCsv: "../quizzes_tsmnt/tsmnt_m6_sum.csv",
    passScore: 0
  },

  {
    id: "tsmnt_m7",
    title: "Module 7 — Training Guide",
    notes: `
- Review all training materials before going live
- Understand project-specific SOPs
- Complete all assessments to finish onboarding
    `,
    mcqCsv:     "../quizzes_tsmnt/tsmnt_m7_mcq.csv",
    summaryCsv: "../quizzes_tsmnt/tsmnt_m7_sum.csv",
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

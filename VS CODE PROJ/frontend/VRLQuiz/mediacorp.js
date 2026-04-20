
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
    lsKey: `${(mod ? mod.id : "mc").toUpperCase()}_SUMMARY_V1`,
    title: `${mod ? mod.title : "Mediacorp"} — Summary`,
    sentences
  };
}

// ── Progress helpers (do not edit) ───────────────────────
const LS_KEY = "Mediacorp_Agent_Onboarding_Portal_v1";
function loadProgress() { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
function saveProgress(p) { localStorage.setItem(LS_KEY, JSON.stringify(p)); }

const modules = [
  {
    id: "mc_m1",
    title: "Module 1 — Introduction to Mediacorp",
    notes: `
- Overview of the Mediacorp project
- Key contacts and escalation channels
- Service Desk role within Mediacorp
    `,
    mcqCsv:     "../quizzes_mediacorp/mc_m1_mcq.csv",
    summaryCsv: "../quizzes_mediacorp/mc_m1_sum.csv",
    passScore: 0
  },

  {
    id: "mc_m2",
    title: "Module 2 — SD Training",
    notes: `
- Review all Service Desk training materials
- Understand project-specific workflows
- Complete all assessments before going live
    `,
    mcqCsv:     "../quizzes_mediacorp/mc_m2_mcq.csv",
    summaryCsv: "../quizzes_mediacorp/mc_m2_sum.csv",
    passScore: 0
  },

  {
    id: "mc_m3",
    title: "Module 3 — AD, Account Administration & Mailbox Administration",
    notes: `
- Understand Active Directory account management
- Know the process for mailbox administration
- Handle account creation, deletion and resets correctly
    `,
    mcqCsv:     "../quizzes_mediacorp/mc_m3_mcq.csv",
    summaryCsv: "../quizzes_mediacorp/mc_m3_sum.csv",
    passScore: 0
  },

  {
    id: "mc_m4",
    title: "Module 4 — Applications and Softwares",
    notes: `
- Know the approved applications used at Mediacorp
- Understand basic troubleshooting for common apps
- Know when to escalate application issues
    `,
    mcqCsv:     "../quizzes_mediacorp/mc_m4_mcq.csv",
    summaryCsv: "../quizzes_mediacorp/mc_m4_sum.csv",
    passScore: 0
  },

  {
    id: "mc_m5",
    title: "Module 5 — BitLocker Recovery",
    notes: `
- Understand the BitLocker recovery process
- Know how to retrieve and provide recovery keys safely
- Log BitLocker incidents with the correct categorisation
    `,
    mcqCsv:     "../quizzes_mediacorp/mc_m5_mcq.csv",
    summaryCsv: "../quizzes_mediacorp/mc_m5_sum.csv",
    passScore: 0
  },

  {
    id: "mc_m6",
    title: "Module 6 — Email Templates",
    notes: `
- Use approved email templates for all responses
- Ensure correct subject line and formatting
- Maintain professional tone in all communications
    `,
    mcqCsv:     "../quizzes_mediacorp/mc_m6_mcq.csv",
    summaryCsv: "../quizzes_mediacorp/mc_m6_sum.csv",
    passScore: 0
  },

  {
    id: "mc_m7",
    title: "Module 7 — Escalation",
    notes: `
- Know when and how to escalate cases
- Include evidence and steps already tried
- Assign to the correct support group in the system
    `,
    mcqCsv:     "../quizzes_mediacorp/mc_m7_mcq.csv",
    summaryCsv: "../quizzes_mediacorp/mc_m7_sum.csv",
    passScore: 0
  },

  {
    id: "mc_m8",
    title: "Module 8 — Hardware",
    notes: `
- Understand common hardware issues and basic troubleshooting
- Know when to dispatch hardware support
- Log hardware incidents with correct asset details
    `,
    mcqCsv:     "../quizzes_mediacorp/mc_m8_mcq.csv",
    summaryCsv: "../quizzes_mediacorp/mc_m8_sum.csv",
    passScore: 0
  },

  {
    id: "mc_m9",
    title: "Module 9 — Major Case & High Severity Handling",
    notes: `
- Identify major and high severity incidents quickly
- Follow the correct major incident procedure
- Communicate updates to stakeholders promptly
    `,
    mcqCsv:     "../quizzes_mediacorp/mc_m9_mcq.csv",
    summaryCsv: "../quizzes_mediacorp/mc_m9_sum.csv",
    passScore: 0
  },

  {
    id: "mc_m10",
    title: "Module 10 — MyApps",
    notes: `
- Understand the MyApps portal and its functions
- Troubleshoot common MyApps access issues
- Know the escalation path for MyApps problems
    `,
    mcqCsv:     "../quizzes_mediacorp/mc_m10_mcq.csv",
    summaryCsv: "../quizzes_mediacorp/mc_m10_sum.csv",
    passScore: 0
  },

  {
    id: "mc_m11",
    title: "Module 11 — Network Connectivity",
    notes: `
- Troubleshoot common network connectivity issues
- Know when to escalate network-related incidents
- Capture the right details when logging network issues
    `,
    mcqCsv:     "../quizzes_mediacorp/mc_m11_mcq.csv",
    summaryCsv: "../quizzes_mediacorp/mc_m11_sum.csv",
    passScore: 0
  },

  {
    id: "mc_m12",
    title: "Module 12 — NEWS Department",
    notes: `
- Understand the specific needs of the NEWS department
- Know priority handling for NEWS-related incidents
- Be aware of broadcast-critical systems and their impact
    `,
    mcqCsv:     "../quizzes_mediacorp/mc_m12_mcq.csv",
    summaryCsv: "../quizzes_mediacorp/mc_m12_sum.csv",
    passScore: 0
  },

  {
    id: "mc_m13",
    title: "Module 13 — Office 365 (Teams, OneDrive, Outlook)",
    notes: `
- Troubleshoot common Office 365 issues
- Know how to handle Teams, OneDrive and Outlook problems
- Understand licensing and access-related queries
    `,
    mcqCsv:     "../quizzes_mediacorp/mc_m13_mcq.csv",
    summaryCsv: "../quizzes_mediacorp/mc_m13_sum.csv",
    passScore: 0
  },

  {
    id: "mc_m14",
    title: "Module 14 — Printer",
    notes: `
- Troubleshoot common printer issues
- Know the process for printer driver installation
- Understand when to escalate printer hardware faults
    `,
    mcqCsv:     "../quizzes_mediacorp/mc_m14_mcq.csv",
    summaryCsv: "../quizzes_mediacorp/mc_m14_sum.csv",
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

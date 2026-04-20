const API_BASE = "https://zf790xe4jk.execute-api.ap-southeast-1.amazonaws.com";

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

function toMcq(rows) {
  return rows.map(r => ({
    id: (r.id || "").trim(),
    // your UI expects these keys:
    Question: (r.question || "").trim(),
    OptionA: (r.optionA || "").trim(),
    OptionB: (r.optionB || "").trim(),
    OptionC: (r.optionC || "").trim(),
    OptionD: (r.optionD || "").trim(),
    CorrectAnswer: (r.correct || "").trim().toUpperCase(),
    Reason: (r.reason || "").trim(),
    // optional: since you don't have section column
    section: "Quiz",
  }));
}

function buildSummaryFromCsv(rows) {
  // rows expected columns: Question, CorrectAnswer, Reason
  const sentences = rows.map(r => {
    const q = (r.Question || "").trim();
    const ans = (r.CorrectAnswer || "").trim();

    // Count [BLANK]
    const blankCount = (q.match(/\[BLANK\]/g) || []).length;

    // Decide how to split answers for multiple blanks
    let partsAns = [];
    if (blankCount > 1) {
      if (ans.includes("/")) {
        partsAns = ans.split("/").map(s => s.trim());
      } else {
        partsAns = ans.split(/\s+/).map(s => s.trim());
      }
    } else {
      partsAns = [ans];
    }

    // Build sentenceParts = [{t:"text"}, {b:"answer"}, ...]
    const chunks = q.split("[BLANK]");
    const sentenceParts = [];

    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i]) sentenceParts.push({ t: chunks[i] });

      if (i < chunks.length - 1) {
        sentenceParts.push({ b: (partsAns[i] ?? ans) }); // fallback if mismatch
      }
    }

    return sentenceParts;
  });

  return {
    lsKey: "M1_SUMMARY_V1",         // change if needed
    title: "Module 1 Summary",
    sentences
  };
}

const LS_KEY = "VRL_Agent_Onboarding_Portal_v1";

/**
 * Modules:
 * - Use `sections` (array) if you want multiple note cards
 * - OR use `notes` (string with "- " bullets) for a simple single notes card
 */

const modules = [
  {
    id: "m1",
    title: "Module 1 — Introduction to LTALink",
    sections: [
      {
        title: "Module Overview",
        points: [
          "What is LTALink?",
          "Who uses LTALink",
          "LTA Location & Operating Hours",
          "LTA Hotline & Contact channels",
          "The Service Desk's Role in supporting LTALink",
          "Typical LTALink cases handled by the Service Desk"
        ]
      },

      {
        title: "Service Desk Role (Overview)",
        points: [
          "Acts as the first point of contact",
          "Provides technical assistance and guidance",
          "Ensures issues are logged accurately",
          "Escalates cases when required"
        ]
      },
      {
        title: "What the Service Desk Helps With",
        points: [
          "Login or access-related issues",
          "System or application errors",
          "Technical issues affecting transactions",
          "Redirecting users to the correct channel"
        ]
      },
      {
        title: "What the Service Desk Does NOT Do",
        points: [
          "Access or modify backend systems or databases",
          "Retrieve, view, or disclose sensitive or restricted information",
          "Provide advice on business rules, policies, or eligibility",
          "Disclose internal support team contacts"
        ]
      },
      {
        title: "Typical LTALink Cases",
        points: [
          "User unable to login successfully",
          "Errors during payment transactions",
          "Access or role-related issues",
          "Technical issues requiring escalation"
        ]
      }
    ],
    mcqCsv: "../quizzes_test/m1_mcq.csv",
    summaryCsv: "../quizzes_test/m1_sum.csv",
    mcqData: [],
    summary: null,
    passScore: 0
  },

  {
    id: "m2",
    title: "Module 2 — Intro, Type of Users and Login",
    notes: `
- Confirm login method and role
- Check whether user is onboarded correctly
- Capture steps taken + where it fails
    `,
     mcqCsv: "../quizzes_test/m2_mcq.csv",
     summaryCsv: "../quizzes_test/m2_sum.csv",
    passScore: 0
  },

  {
    id: "m3",
    title: "Module 3 — Glossary of Terms",
    notes: `
- Learn key VRL terms (AO/ESA/EA/GA/HVPO)
- Understand common fields used in tickets
- Use consistent wording when logging cases
    `,
    mcqCsv:"../quizzes_test/m3_mcq.csv",
    summaryCsv: "../quizzes_test/m3_sum.csv",
    passScore: 0
  },

  {
    id: "m4",
    title: "Module 4 — ESA Login and Troubleshooting",
    notes: `
- Use a consistent short description: <System> - <Issue> - <Error code>
- Fill in: user/company/contact, steps to reproduce, expected vs actual, impact
- If anything missing: **Not provided**
- Mask NRIC/phone/email as [REDACTED]
  `,
    mcqCsv: "../quizzes_test/m4_mcq.csv",
    summaryCsv: "../quizzes_test/m4_sum.csv",
    passScore: 0
  },

  {
    id: "m5",
    title: "Module 5 — Troubleshooting Common Apps",
    notes: `
- Identify scenario type: login/onboarding/transaction/role/access
- Capture: what user is trying to do + exact screen where it fails
- Check user type: Singpass Business / Corppass / Foreign ID
  `,
    mcqCsv: "../quizzes_test/m5_mcq.csv",
    summaryCsv: "../quizzes_test/m5_sum.csv",
    passScore: 2
  },

  {
    id: "m6",
    title: "Module 6 — Escalation Pathways (L2 / LTA Account Admin / LTA CSU)",
    notes: `
- Escalate to L2 for system/app issues that require deeper investigation
- Escalate to LTA Account Admin for account setup/access rights related matters
- Escalate to CSU for process/procedure/business rule related cases (if applicable)
- Always include evidence + what you already tried
  `,
    mcqCsv: "../quizzes_test/m6_mcq.csv",
    summaryCsv: "../quizzes_test/m6_sum.csv",
    passScore: 2
  },

  {
    id: "m7",
    title: "Module 7 — Common VRL Scenarios",
    notes: `
- Identify the user’s function/transaction
- Capture exact error message and point of failure
- Use known checks before escalating
  `,
    mcqCsv: "../quizzes_test/m7_mcq.csv",
    summaryCsv: "../quizzes_test/m7_sum.csv",
    passScore: 2
  },

  {
    id: "m8",
    title: "Module 8 — Email Handling (Replies, Follow-ups, Closure)",
    notes: `
- Keep replies clear, professional, and structured
- Ask for missing details explicitly
- Confirm resolution before closing
  `,
    mcqCsv: "../quizzes_test/m8_mcq.csv",
    summaryCsv: "../quizzes_test/m8_sum.csv",
    passScore: 2
  },

  {
    id: "m9",
    title: "Module 9 — Autolog Email and Replying to OneCall",
    notes: `
- Ensure correct categorization when logging
- Use standard templates where applicable
- Record timestamp and key details accurately
  `,
    mcqCsv: "../quizzes_test/m9_mcq.csv",
    summaryCsv: "../quizzes_test/m9_sum.csv",
    passScore: 2
  },

  {
    id: "m10",
    title: "Module 10 — Call Opening & Verification Etiquette",
    notes: `
- Verify caller details and login method
- Gather the exact transaction and error message
- Summarize back to user to confirm understanding
  `,
    quiz: [
      { q: "What should you verify first?", keywords: ["details", "login"] },
      { q: "What should you summarize back?", keywords: ["issue", "problem", "understanding"] },
      { q: "What must you capture exactly?", keywords: ["error"] }
    ],
    passScore: 2
  },
];

function loadProgress() {
  return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
}
function saveProgress(p) {
  localStorage.setItem(LS_KEY, JSON.stringify(p));
}
function isUnlocked(i, progress) {
  return true;
}

function renderSummaryForModule(m) {
  const card = document.getElementById("m1SummaryCard");
  const titleEl = document.getElementById("summaryTitle");
  const paraEl = document.getElementById("summaryParagraph");
  const msgEl = document.getElementById("summaryMsg");
  const checkBtn = document.getElementById("checkSummaryBtn");
  const clearBtn = document.getElementById("clearSummaryBtn");

  if (!card || !titleEl || !paraEl || !msgEl || !checkBtn || !clearBtn) return;

  if (!m.summary) {
    card.style.display = "none";
    return;
  }

  const summary = m.summary;
  const SUM_LS_KEY = summary.lsKey; // avoid shadowing your main LS_KEY

  card.style.display = "block";
  titleEl.textContent = summary.title || `${m.title} Summary`;
  msgEl.textContent = "";

  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(SUM_LS_KEY)) || {}; } catch { }

  paraEl.innerHTML = "";
  const ol = document.createElement("ol");
  ol.className = "summaryList";

  let blankIndex = 0;

  summary.sentences.forEach(sentenceParts => {
    const li = document.createElement("li");
    li.dataset.answers = "";

    sentenceParts.forEach(part => {
      if (part.t) {
        li.append(document.createTextNode(part.t));
      } else {
        const key = `b${blankIndex}`;
        const input = document.createElement("input");
        input.type = "text";
        input.className = "blankInput";
        input.value = saved[key] || "";
        input.dataset.answer = (part.b || "").trim().toLowerCase();
        input.dataset.key = key;

        li.dataset.answers += (li.dataset.answers ? ", " : "") + part.b;

        input.addEventListener("input", () => {
          saved[key] = input.value;
          localStorage.setItem(SUM_LS_KEY, JSON.stringify(saved));
          msgEl.textContent = "Saved.";
        });

        li.append(input);
        blankIndex++;
      }
    });

    const hintLine = document.createElement("div");
    hintLine.className = "answerHint";
    hintLine.style.display = "none";
    hintLine.textContent = `Correct answers: ${li.dataset.answers}`;
    li.append(hintLine);

    ol.append(li);
  });

  paraEl.append(ol);

  checkBtn.onclick = () => {
    const inputs = paraEl.querySelectorAll("input.blankInput");
    let correct = 0;

    inputs.forEach(input => {
      const user = input.value.trim().toLowerCase();
      const expected = (input.dataset.answer || "").trim().toLowerCase();

      const li = input.closest("li");
      const hint = li ? li.querySelector(".answerHint") : null;

      input.classList.remove("ok", "bad");
      if (hint) hint.style.display = "none";

      if (!user) return;

      if (user === expected) {
        input.classList.add("ok");
        correct++;
      } else {
        input.classList.add("bad");
        if (hint) hint.style.display = "block";
      }
    });

    msgEl.textContent = `${correct} / ${inputs.length} correct`;
  };

  clearBtn.onclick = () => {
    localStorage.removeItem(SUM_LS_KEY);
    renderSummaryForModule(m);
    msgEl.textContent = "Cleared.";
  };
}



// Convert markdown-like notes into HTML bullet list
function renderNotes(notesText = "") {
  const lines = notesText
    .trim()
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const bullets = lines
    .filter(l => l.startsWith("- "))
    .map(l => l.slice(2)); // remove "- "

  // Minimal support for **bold**
  const toHtml = (text) =>
    text.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

  return `
    <ul>
      ${bullets.map(b => `<li>${toHtml(b)}</li>`).join("")}
    </ul>
  `;
}

function renderSidebar() {
  const progress = loadProgress();
  const list = document.getElementById("moduleList");
  list.innerHTML = "";

  const completedCount = modules.filter(m => progress[m.id]?.completed).length;
  const pct = Math.round((completedCount / modules.length) * 100);

  document.getElementById("progressText").textContent =
    `Progress: ${completedCount}/${modules.length} modules (${pct}%)`;
  document.getElementById("progressBar").style.width = `${pct}%`;

  modules.forEach((m, idx) => {
    const unlocked = isUnlocked(idx, progress);
    const completed = !!progress[m.id]?.completed;

    const div = document.createElement("div");
    div.className = "module" + (unlocked ? "" : " locked");
    div.innerHTML = `
      <div>
        <b>${m.title}</b><br/>
        <span class="badge">${completed ? "Completed" : unlocked ? "Open" : "Locked"}</span>
      </div>
      <div>${completed ? "✅" : unlocked ? "➡️" : "🔒"}</div>
    `;

    div.onclick = () => {
      if (!unlocked) return;
      openModule(m.id);
    };

    list.appendChild(div);
  });
}

async function openModule(moduleId) {
  const m = modules.find(x => x.id === moduleId);
  // ---- Load MCQ from CSV if configured ----
  if (m.mcqCsv && (!m.mcqData || m.mcqData.length === 0)) {
    try {
      const rows = await loadCsv(m.mcqCsv);
      m.mcqData = toMcq(rows);
    } catch (e) {
      console.error(e);
      // show something in UI if needed
    }
  }
  const progress = loadProgress();

  if (window.hideM1Summary) window.hideM1Summary();

  // SHOW / HIDE MODULE 1 SUMMARY (IMPORTANT)
  const m1Card = document.getElementById("m1SummaryCard");
  if (m1Card) {
    m1Card.style.display = (moduleId === "m1") ? "block" : "none";
  }

  // --- LESSON / NOTES AREA ---
  let lessonHtml = `<h2>${m.title}</h2>`;

  // If module has sections -> show multiple cards
  if (m.sections && Array.isArray(m.sections) && m.sections.length > 0) {
    lessonHtml += `
     <div class="deck" data-module="${m.id}">
      <div class="deckTop">
        <button class="deckBtn" id="deckPrev" type="button">←</button>
        <div class="deckCounter" id="deckCounter"></div>
        <button class="deckBtn" id="deckNext" type="button">→</button>
      </div>

      <div class="card deckCard" id="deckCard"></div>
    </div>
  `;
  } else {
    // Fallback: module uses notes string
    lessonHtml += `
      <div class="card">
        <h3>Notes</h3>
        ${renderNotes(m.notes || "")}
      </div>
    `;
  }




  document.getElementById("lesson").innerHTML = lessonHtml;
  renderSummaryForModule(m);

  // ---- Deck rendering (for sections) ----
  if (m.sections && Array.isArray(m.sections) && m.sections.length > 0) {
    const key = `deck_${m.id}_index`;
    let idx = parseInt(sessionStorage.getItem(key) || "0", 10);
    if (Number.isNaN(idx) || idx < 0) idx = 0;
    if (idx > m.sections.length - 1) idx = m.sections.length - 1;

    const counter = document.getElementById("deckCounter");
    const card = document.getElementById("deckCard");
    const prev = document.getElementById("deckPrev");
    const next = document.getElementById("deckNext");

    const renderDeck = () => {
      const sec = m.sections[idx];
      counter.textContent = `${idx + 1} / ${m.sections.length}`;
      card.innerHTML = `
      <h3>${sec.title}</h3>
      <ul>
        ${(sec.points || []).map(p => `<li>${p}</li>`).join("")}
      </ul>
    `;
      prev.disabled = idx === 0;
      next.disabled = idx === m.sections.length - 1;
      sessionStorage.setItem(key, String(idx));
    };

    prev.onclick = () => { if (idx > 0) { idx--; renderDeck(); } };
    next.onclick = () => { if (idx < m.sections.length - 1) { idx++; renderDeck(); } };

    renderDeck();
  }


  // --- QUIZ AREA (Module 1 MCQ only for now) ---
  const questions = m.mcqData || [];
  const quizEl = document.getElementById("quiz");

  // clear first
  quizEl.innerHTML = "";

  // if no MCQ for this module, show message (or keep blank)
  if (!questions.length) {
    quizEl.innerHTML = `<p class="muted">No MCQ quiz for this module yet.</p>`;
    return;
  }

  quizEl.innerHTML = `
  <h3>${m.title} Quiz (MCQ)</h3>

  ${(() => {
      // group questions by section title
      const groups = new Map();
      questions.forEach((q) => {
        const key = q.section || "Quiz";
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(q);
      });

      let globalIndex = 0;

      return Array.from(groups.entries()).map(([sectionTitle, items]) => `
      <div class="quizBlock">
        <h4 class="quizSectionTitle">${sectionTitle}</h4>

        ${items.map(q => {
        const i = globalIndex++;
        return `
            <div class="quizQ">
              <div><b>Q${i + 1}.</b> ${q.Question}</div>

              ${["A", "B", "C", "D"].map(letter => `
                <label class="mcq-option">
                  <span class="mcq-letter">${letter})</span>
                  <span class="mcq-text">${q["Option" + letter]}</span>
                  <input
                    type="radio"
                    name="${m.id}_q${i}"
                    value="${letter}"
                    class="mcq-radio"
                  >
                </label>
              `).join("")}

              <div id="reason_${m.id}_${i}" class="muted" style="display:none;"></div>
            </div>
          `;
      }).join("")}
      </div>
    `).join("");
    })()}

  <button class="btn" id="submitQuiz">Submit</button>
  <p id="result"></p>
`;

  // ✅ Append classification below MCQ (only for modules that have it)
  if (m.classificationData && Array.isArray(m.classificationData)) {
    renderClassificationQuiz(m.classificationData);
  }

  document.getElementById("submitQuiz").onclick = async () => {
    let score = 0;

    questions.forEach((q, i) => {
      const selected = document.querySelector(`input[name="${m.id}_q${i}"]:checked`);
      if (selected && selected.value === q.CorrectAnswer) score++;

      const reason = document.getElementById(`reason_${m.id}_${i}`);
      if (reason) {
        reason.style.display = "block";
        reason.innerHTML = `<b>Explanation:</b> ${q.Reason}`;
      }
    });

    const passMark = m.passScore ?? 2;
    const passed = score >= passMark;

    document.getElementById("result").textContent =
      passed ? `✅ Passed (${score}/${questions.length})`
        : `❌ Not passed (${score}/${questions.length})`;

    try {
      const currentUser = JSON.parse(localStorage.getItem("portalUser")) || {};
      const userID =
        currentUser.userID ||
        currentUser.email ||
        currentUser.staffId ||
        currentUser.fullName ||
        "test-user";

      await saveProgressApi({
        userID,
        moduleID: m.id,
        score,
        totalQuestions: questions.length,
        completed: passed
      });

      console.log(`Saved module result for ${m.id}`);
    } catch (err) {
      console.error("Failed to save module result:", err);
    }

    if (passed) {
      progress[m.id] = { completed: true };
      saveProgress(progress);
      renderSidebar();
    }
  };

  function renderClassificationQuiz(data) {
    const quizEl = document.getElementById("quiz");

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
    <h3>Module 2 — Classification (Matching)</h3>
    <div id="classList"></div>
    <button class="btn" id="classSubmit">Check Answers</button>
    <p id="classResult"></p>
  `;

    quizEl.appendChild(wrapper);

    const list = wrapper.querySelector("#classList");
    const locations = ["VRL-AO", "VRL-ESA", "VRL-EA", "VRL-GA", "VRL-HVPO", "VRL-LTA"];

    data.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "quizQ";
      row.innerHTML = `
      <div><b>${idx + 1}.</b> ${item.characteristic}</div>
      <select class="classSelect" data-correct="${item.correctLocation}">
        <option value="">Select VRL Location</option>
        ${locations.map(l => `<option value="${l}">${l}</option>`).join("")}
      </select>
      <div class="muted classFeedback" style="margin-top:6px;"></div>
    `;
      list.appendChild(row);
    });

    wrapper.querySelector("#classSubmit").onclick = () => {
      const selects = wrapper.querySelectorAll(".classSelect");
      let score = 0;

      selects.forEach(sel => {
        const correct = sel.dataset.correct;
        const fb = sel.parentElement.querySelector(".classFeedback");
        if (sel.value === correct) { score++; fb.textContent = "✅ Correct"; }
        else fb.textContent = `❌ Correct answer: ${correct}`;
      });

      wrapper.querySelector("#classResult").textContent = `Score: ${score}/${selects.length}`;
    };
  }
}


  // ✅ DOMContentLoaded MUST be outside openModule
  window.addEventListener("DOMContentLoaded", async () => {
    if (!document.getElementById("moduleList")) return; // ← add this line
    
    renderSidebar();
    const m1 = modules.find(m => m.id === "m1");
    if (m1?.summaryCsv) {
      try {
        const rows = await loadCsv(m1.summaryCsv);
        m1.summary = buildSummaryFromCsv(rows);
      } catch (e) { console.error("Failed to load M1 summary CSV:", e); }
    }
    await openModule("m1");
});

  // Save progress to AWS
  async function saveProgressApi({ userID, moduleID, score, totalQuestions, completed }) {
    const res = await fetch(`${API_BASE}/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userID,
        moduleID,
        score,
        totalQuestions,
        completed
      })
    });

    if (!res.ok) {
      throw new Error("Failed to save progress");
    }

    return res.json();
  }

  // Load progress from AWS
  async function loadProgressApi(userID, moduleID) {
    const url = `${API_BASE}/progress?userID=${encodeURIComponent(userID)}&moduleID=${encodeURIComponent(moduleID)}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Failed to load progress");
    }

    return res.json();
  }      
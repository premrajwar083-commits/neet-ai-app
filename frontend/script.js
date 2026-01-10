let questions = [];
let currentIndex = 0;
let score = 0;
let selected = null;

const chapters = {
  Biology: [
    "The Living World",
    "Biological Classification",
    "Plant Kingdom",
    "Animal Kingdom"
  ],
  Physics: [
    "Kinematics",
    "Laws of Motion",
    "Work, Energy & Power",
    "Gravitation"
  ],
  Chemistry: [
    "Some Basic Concepts",
    "Structure of Atom",
    "Chemical Bonding",
    "States of Matter"
  ]
};

const subjectSelect = document.getElementById("subject");
const chapterSelect = document.getElementById("chapter");

// Populate chapters based on selected subject
function populateChapters() {
  const subject = subjectSelect.value;
  chapterSelect.innerHTML = "";
  chapters[subject].forEach(chap => {
    const option = document.createElement("option");
    option.value = chap;
    option.textContent = chap;
    chapterSelect.appendChild(option);
  });
}

// Initial population
populateChapters();
subjectSelect.addEventListener("change", populateChapters);

// Start Exam
async function startExam() {
  const subject = subjectSelect.value;
  const chapter = chapterSelect.value;
  const total = Number(document.getElementById("total").value);

  try {
    const response = await fetch("http://localhost:5000/api/start-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, chapter, total })
    });

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      alert("No questions received!");
      return;
    }

    questions = data;
    currentIndex = 0;
    score = 0;

    document.getElementById("setup").classList.add("hidden");
    document.getElementById("exam").classList.remove("hidden");

    showQuestion();
  } catch (err) {
    console.error(err);
    alert("Server not running or API error!");
  }
}

// Show question
function showQuestion() {
  const q = questions[currentIndex];
  const questionEl = document.getElementById("question");
  const optionsDiv = document.getElementById("options");
  const nextBtn = document.querySelector("#exam button");

  selected = null;
  questionEl.innerText = `${currentIndex + 1}. ${q.question}`;
  optionsDiv.innerHTML = "";
  nextBtn.disabled = true;

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.style.display = "block";
    btn.style.margin = "5px 0";

    btn.onclick = () => {
      selected = opt;
      document.querySelectorAll("#options button").forEach(b => {
        b.style.background = "";
        b.style.color = "black";
      });
      btn.style.background = "#90ee90";
      nextBtn.disabled = false;
    };

    optionsDiv.appendChild(btn);
  });
}

// Next question
function nextQuestion() {
  const q = questions[currentIndex];
  if (!selected) {
    alert("Please select an option!");
    return;
  }

  const buttons = document.querySelectorAll("#options button");
  buttons.forEach(btn => {
    if (btn.innerText === q.correctAnswer) {
      btn.style.background = "#28a745"; // green
      btn.style.color = "white";
    } else if (btn.innerText === selected) {
      btn.style.background = "#dc3545"; // red
      btn.style.color = "white";
    }
    btn.disabled = true;
  });

  q.userAnswer = selected;
  if (selected === q.correctAnswer) score++;

  // Show explanation
  const explanationEl = document.createElement("div");
  explanationEl.style.marginTop = "10px";
  explanationEl.style.background = "#f0f0f0";
  explanationEl.style.padding = "10px";
  explanationEl.style.borderRadius = "5px";
  explanationEl.innerHTML = `<strong>Explanation:</strong> ${q.explanation}`;
  document.getElementById("options").appendChild(explanationEl);

  setTimeout(() => {
    currentIndex++;
    if (currentIndex >= questions.length) {
      showReview();
    } else {
      showQuestion();
    }
  }, 2000);
}

// Review screen
function showReview() {
  document.getElementById("exam").classList.add("hidden");
  const container = document.querySelector(".container");
  container.innerHTML = `<h1>📋 Review & Score</h1>
                         <h2>Score: ${score} / ${questions.length}</h2>`;

  questions.forEach((q, index) => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.margin = "10px 0";
    div.style.padding = "10px";
    div.style.borderRadius = "5px";

    let optionsHTML = "";
    q.options.forEach(opt => {
      let color = "";
      if (opt === q.correctAnswer) color = "green";
      else if (opt === q.userAnswer && opt !== q.correctAnswer) color = "red";
      optionsHTML += `<div style="color:${color};">${opt}</div>`;
    });

    div.innerHTML = `
      <p><strong>Q${index + 1}:</strong> ${q.question}</p>
      <p><strong>Your Answer:</strong> ${q.userAnswer || "No Answer"}</p>
      <p><strong>Options:</strong><br>${optionsHTML}</p>
      <p><strong>Explanation:</strong> ${q.explanation}</p>
    `;
    container.appendChild(div);
  });

  const restartBtn = document.createElement("button");
  restartBtn.innerText = "Restart Exam";
  restartBtn.style.marginTop = "20px";
  restartBtn.onclick = () => location.reload();
  container.appendChild(restartBtn);
}

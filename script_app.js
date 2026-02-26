/* =================================================
   FOCUSFORGE - CLEAN STABLE BUILD
================================================= */
/* =========================
   LOCAL AUDIO SYSTEM
========================= */

const completeSound = new Audio("complete.mp3");
const warningSound = new Audio("warning.mp3");

completeSound.preload = "auto";
warningSound.preload = "auto";

function unlockAudio() {
    completeSound.play().then(() => {
        completeSound.pause();
        completeSound.currentTime = 0;
    }).catch(err => console.log("Audio unlock failed:", err));

    warningSound.play().then(() => {
        warningSound.pause();
        warningSound.currentTime = 0;
    }).catch(err => console.log("Audio unlock failed:", err));
}

// Required for browser autoplay policies
document.addEventListener("click", unlockAudio, { once: true });

/* =========================
   QUOTES
========================= */

const quotes = [
    "Small steps every day.",
    "Discipline beats motivation.",
    "Focus now. Relax later.",
    "You’re building your future.",
    "One session at a time.",
    "Stay locked in.",
    "Consistency creates greatness.",
    "Do it tired. Do it bored.",
    "No distractions. Just progress.",
    "Future you is watching."
];

function changeQuote() {
    const quoteEl = document.getElementById("quote");
    if (!quoteEl) return;

    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteEl.innerText = `"${quotes[randomIndex]}"`;
}

/* =========================
   TIMER CORE
========================= */

let studyTime = 25 * 60;
let breakTime = 5 * 60;
let currentTime = studyTime;
let isStudy = true;
let timer = null;
let running = false;

/* =========================
   DATA
========================= */

let streak = parseInt(localStorage.getItem("streak")) || 0;
let xp = parseInt(localStorage.getItem("xp")) || 0;
let lastCompletedDate = localStorage.getItem("lastCompletedDate");

/* =========================
   CONFETTI
========================= */

const confettiScript = document.createElement("script");
confettiScript.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
document.body.appendChild(confettiScript);

/* =========================
   DISPLAY
========================= */

function updateDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;

    document.getElementById("timer").innerText =
        minutes.toString().padStart(2, "0") +
        ":" +
        seconds.toString().padStart(2, "0");

    document.getElementById("mode").innerText =
        isStudy ? "Study Time" : "Break Time";

    document.getElementById("streak").innerText = "Streak: " + streak;
    document.getElementById("xp").innerText =
        "XP: " + xp + " | Level: " + Math.floor(xp / 100);

    localStorage.setItem("streak", streak);
    localStorage.setItem("xp", xp);
}

/* =========================
   DAILY RESET
========================= */

function checkDailyReset() {
    if (!lastCompletedDate) return;

    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (
        lastCompletedDate !== today &&
        lastCompletedDate !== yesterday.toDateString()
    ) {
        streak = 0;
    }
}

checkDailyReset();

/* =========================
   MAIN TIMER
========================= */

function startTimer() {
    if (running) return;
    running = true;

    changeQuote();

    timer = setInterval(() => {
        if (currentTime > 0) {
            currentTime--;
            updateDisplay();
        } else {
            completeSession();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    running = false;
}

function resetTimer() {
    clearInterval(timer);
    running = false;
    isStudy = true;
    currentTime = studyTime;
    updateDisplay();
}

function completeSession() {
    if (isStudy) {
        const today = new Date().toDateString();

        if (lastCompletedDate !== today) {
            streak++;
            xp += 20;
            lastCompletedDate = today;
            localStorage.setItem("lastCompletedDate", today);

            if (streak === 5 && window.confetti) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }

        completeSound.currentTime = 0;
        completeSound.play();
    }

    isStudy = !isStudy;
    currentTime = isStudy ? studyTime : breakTime;
    updateDisplay();
}

/* =========================
   APPLY CUSTOM TIME
========================= */

function applyTime() {
    const newStudy = parseInt(document.getElementById("studyInput").value);
    const newBreak = parseInt(document.getElementById("breakInput").value);

    if (newStudy > 0 && newBreak > 0) {
        studyTime = newStudy * 60;
        breakTime = newBreak * 60;
        currentTime = studyTime;
        isStudy = true;
        updateDisplay();
    }
}

/* =========================
   SIDEBAR
========================= */

function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const toggle = document.querySelector(".toggle-btn");

    sidebar.classList.toggle("closed");

    toggle.style.left = sidebar.classList.contains("closed")
        ? "20px"
        : "270px";
}

/* =========================
   DEEP FOCUS MODE
========================= */

let deepFocusActive = false;
let focusTimer = null;
let focusTimeLeft = 0;

function startDeepFocus() {
    if (deepFocusActive) return;

    clearInterval(timer);
    running = false;

    const focusMinutes = parseInt(document.getElementById("focusInput").value);
    if (!focusMinutes || focusMinutes <= 0) return;

    deepFocusActive = true;
    focusTimeLeft = focusMinutes * 60;

    document.body.classList.add("deep-focus");

    enterFullscreen();
    runDeepFocusTimer();
}

function runDeepFocusTimer() {
    updateFocusDisplay();

    focusTimer = setInterval(() => {
        if (focusTimeLeft > 0) {
            focusTimeLeft--;
            updateFocusDisplay();
        } else {
            endDeepFocus();
        }
    }, 1000);
}

function updateFocusDisplay() {
    const minutes = Math.floor(focusTimeLeft / 60);
    const seconds = focusTimeLeft % 60;

    document.getElementById("timer").innerText =
        minutes.toString().padStart(2, "0") +
        ":" +
        seconds.toString().padStart(2, "0");
}

function endDeepFocus() {
    clearInterval(focusTimer);
    deepFocusActive = false;

    document.body.classList.remove("deep-focus");

    if (document.fullscreenElement) {
        document.exitFullscreen();
    }

    completeSound.currentTime = 0;
    completeSound.play();

    alert("Deep Focus Complete 🔥");
}

/* =========================
   FULLSCREEN LOCK
========================= */

function enterFullscreen() {
    if (deepFocusActive && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
}

document.addEventListener("fullscreenchange", () => {
    if (deepFocusActive && !document.fullscreenElement) {
        setTimeout(() => {
            if (deepFocusActive) enterFullscreen();
        }, 50);
    }
});

/* =========================
   TAB SWITCH DETECTION
========================= */

document.addEventListener("visibilitychange", () => {
    if (deepFocusActive && document.hidden) {
        warningSound.currentTime = 0;
        warningSound.play();
    }
});

/* =========================
   RELOAD BLOCK
========================= */

window.addEventListener("beforeunload", function (e) {
    if (deepFocusActive) {
        e.preventDefault();
        e.returnValue = "You are in Deep Focus Mode!";
    }
});

/* =========================
   INIT
========================= */

updateDisplay();
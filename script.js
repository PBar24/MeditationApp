let countdown;
let breathingInterval;
let selectedMoodBefore = null;
let selectedMoodAfter = null;
let isMeditating = false;

// DOM Elements
const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const minutesInput = document.getElementById('minutes');
const circle = document.getElementById('circle');
const breathingText = document.getElementById('breathingText');
const moodPrompt = document.getElementById('moodPrompt');
const moodBtns = document.querySelectorAll('.mood-btn');
const historyList = document.getElementById('historyList');
const totalTimeDisplay = document.getElementById('totalTime');
const gong = document.getElementById('gong');
const themeToggle = document.getElementById('darkModeToggle');

// Dark Mode
themeToggle.addEventListener('change', () => {
    document.body.setAttribute('data-theme', themeToggle.checked ? 'dark' : 'light');
});

// Mood Selection
moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        moodBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        if (!isMeditating) {
            selectedMoodBefore = btn.getAttribute('data-mood');
        } else {
            selectedMoodAfter = btn.getAttribute('data-mood');
            saveSession(minutesInput.value);
        }
    });
});

function timer(seconds) {
    clearInterval(countdown);
    const now = Date.now();
    const then = now + seconds * 1000;

    isMeditating = true;
    startBreathing();
    displayTime(seconds);

    countdown = setInterval(() => {
        const secondsLeft = Math.round((then - Date.now()) / 1000);

        if (secondsLeft < 0) {
            clearInterval(countdown);
            stopBreathing();
            gong.play();
            moodPrompt.textContent = "Session complete! How do you feel now?";
            moodBtns.forEach(b => b.classList.remove('selected'));
            return;
        }
        displayTime(secondsLeft);
    }, 1000);
}

function startBreathing() {
    let inhale = true;
    breathingText.textContent = "Inhale";
    circle.classList.add('expand');

    breathingInterval = setInterval(() => {
        inhale = !inhale;
        breathingText.textContent = inhale ? "Inhale" : "Exhale";
        inhale ? circle.classList.add('expand') : circle.classList.remove('expand');
    }, 4000);
}

function stopBreathing() {
    clearInterval(breathingInterval);
    circle.classList.remove('expand');
    breathingText.textContent = "Done";
}

function displayTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    display.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function saveSession(mins) {
    const history = JSON.parse(localStorage.getItem('medHistory')) || [];
    history.push({
        date: new Date().toLocaleDateString(),
        duration: mins,
        mood: `${selectedMoodBefore || '?' } → ${selectedMoodAfter || '?'}`
    });
    localStorage.setItem('medHistory', JSON.stringify(history));
    loadHistory();
    isMeditating = false;
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('medHistory')) || [];
    historyList.innerHTML = '';
    let total = 0;

    history.slice().reverse().forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${entry.date}</span> <span>${entry.mood}</span> <span>${entry.duration}m</span>`;
        historyList.appendChild(li);
        total += parseInt(entry.duration);
    });
    totalTimeDisplay.textContent = total;
}

startBtn.addEventListener('click', () => {
    const mins = minutesInput.value;
    if (mins > 0) timer(mins * 60);
});

resetBtn.addEventListener('click', () => {
    clearInterval(countdown);
    clearInterval(breathingInterval);
    isMeditating = false;
    display.textContent = "00:00";
    circle.classList.remove('expand');
    breathingText.textContent = "Ready?";
});

document.getElementById('clearHistory').addEventListener('click', () => {
    localStorage.removeItem('medHistory');
    loadHistory();
});

loadHistory();
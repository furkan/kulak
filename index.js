// Simple synth using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const noteFrequencies = {
  C3: 130.81,
  "C#3": 138.59,
  D3: 146.83,
  "D#3": 155.56,
  E3: 164.81,
  F3: 174.61,
  "F#3": 185.0,
  G3: 196.0,
  "G#3": 207.65,
  A3: 220.0,
  "A#3": 233.08,
  B3: 246.94,
  C4: 261.63,
  "C#4": 277.18,
  D4: 293.66,
  "D#4": 311.13,
  E4: 329.63,
  F4: 349.23,
  "F#4": 369.99,
  G4: 392.0,
  "G#4": 415.3,
  A4: 440.0,
  "A#4": 466.16,
  B4: 493.88,
  C5: 523.25,
};

let targetNote = null;
let isPlaying = false;
let playCount = 0;

const themeToggle = document.getElementById("themeToggle");
let isDark = false;

const c4Elements = document.querySelectorAll('div[data-note="C4"]');

themeToggle.addEventListener("click", () => {
  isDark = !isDark;
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light",
  );
  themeToggle.textContent = isDark ? "☀️" : "🌙";
});

function playNote(frequency, duration = 0.5) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  filter.type = "lowpass";
  filter.frequency.value = 2000;

  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function updateDots(count) {
  const dots = document.querySelectorAll(".dot");
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index < count);
  });
}

function activateC4Keys() {
  c4Elements.forEach((c4Element) => {
    if (c4Element.classList.contains("active")) {
      return;
    } else {
      c4Element.classList.add("active");
    }
  });
}

function updatePlayButton() {
  const playButton = document.getElementById("playButton");
  const playIcon = playButton.querySelector(".play-icon");
  const replayIcon = playButton.querySelector(".replay-icon");

  if (targetNote) {
    playIcon.classList.add("hidden");
    replayIcon.classList.remove("hidden");
  } else {
    playIcon.classList.remove("hidden");
    replayIcon.classList.add("hidden");
  }
}

function deactivateC4Keys() {
  c4Elements.forEach((c4Element) => {
    if (c4Element.classList.contains("active")) {
      c4Element.classList.remove("active");
    } else {
      return;
    }
  });
}

function playSequence() {
  if (isPlaying) return;
  isPlaying = true;

  if (targetNote) {
    // If there's already a target note, just replay it
    playNote(noteFrequencies[targetNote]);
    isPlaying = false;
    return;
  }

  playCount = 0;
  updateDots(0);

  // Choose random target note (excluding C4)
  const possibleNotes = Object.keys(noteFrequencies).filter(
    (note) => note !== "C4",
  );
  targetNote = possibleNotes[Math.floor(Math.random() * possibleNotes.length)];
  console.log(targetNote);

  // Play sequence: C4 three times, then target note
  const playNextNote = () => {
    if (playCount < 3) {
      activateC4Keys();
      setTimeout(deactivateC4Keys, 500);
      playNote(noteFrequencies["C4"]);
      updateDots(playCount + 1);
      playCount++;
      setTimeout(playNextNote, 1000);
    } else {
      playNote(noteFrequencies[targetNote]);
      isPlaying = false;
      updatePlayButton();
    }
  };

  playNextNote();
}

// Add click handlers
document.getElementById("playButton").addEventListener("click", () => {
  // Start audio context on first interaction
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  playSequence();
});

// Add click handlers for piano keys
document.querySelectorAll(".white-key, .black-key").forEach((key) => {
  key.addEventListener("click", () => {
    const note = key.dataset.note;
    if (note) {
      playNote(noteFrequencies[note]);
      // Check if it matches the target note
      if (note === targetNote) {
        key.classList.add("correct");
        setTimeout(() => {
          // alert("Correct! Well done!");
          key.classList.remove("correct");
          targetNote = null;
          updateDots(0);
          updatePlayButton();
        }, 500);
      } else if (targetNote) {
        // Only give feedback if there's an active target
        key.classList.add("incorrect");
        setTimeout(() => key.classList.remove("incorrect"), 500);
      }
    }
  });
});

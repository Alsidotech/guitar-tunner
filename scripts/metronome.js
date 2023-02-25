import Timer from './timer.js';

const tempoDisplay = document.querySelector('.tempo');
const tempoSlider = document.querySelector('.slider');
const subtractBeats = document.querySelector('#subtract-beats');
const addBeats = document.querySelector('#add-beats');
const beatsValue = document.querySelector('#beats-value');
const beatsValueDown = document.querySelector('#beats-value-down');
const beatsValueUp = document.querySelector('#beats-value-up');
const playPauseBtn = document.querySelector('#play-pause');

const click1 = new Audio('./assets/audio/click1.mp3');
const click2 = new Audio('./assets/audio/click2.mp3');

let bpm = 120;
let beatsTotal = bpm;
let beatsValuePlus = beatsTotal + 1;
let beatsValueMinus = beatsTotal - 1;
let count = 0;
let isRunning = false;

tempoSlider.addEventListener('input', () => {
    bpm = tempoSlider.value;
    validateTempo();
    updateMetronome();
});

subtractBeats.addEventListener('click', () => {
    if (beatsTotal <= 40) { return };
    beatsTotal--;
    beatsValuePlus = beatsTotal + 1;
    beatsValueMinus = beatsTotal - 1;
    beatsValue.textContent = beatsTotal;
    beatsValueUp.textContent = beatsValuePlus;
    beatsValueDown.textContent = beatsValueMinus;
    bpm = beatsTotal;
    validateTempo();
    updateMetronome();
    count = 0;
});

addBeats.addEventListener('click', () => {
    if (beatsTotal >= 220) { return };
    beatsTotal++;
    beatsValuePlus = beatsTotal + 1;
    beatsValueMinus = beatsTotal - 1;
    beatsValue.textContent = beatsTotal;
    beatsValueUp.textContent = beatsValuePlus;
    beatsValueDown.textContent = beatsValueMinus;
    bpm = beatsTotal;
    validateTempo();
    updateMetronome();
    count = 0;
});

playPauseBtn.addEventListener('click', () => {
    count = 0;
    if (!isRunning) {
        metronome.start();
        isRunning = true;
        playPauseBtn.textContent = 'Pause';
    } else {
        metronome.stop();
        isRunning = false;
        playPauseBtn.textContent = 'Play';
    }
});

function updateMetronome() {
    tempoDisplay.textContent = bpm;
    tempoSlider.value = bpm;
    metronome.timeInterval = 60000 / bpm;
}

function validateTempo() {
    if (bpm <= 40) { return };
    if (bpm >= 220) { return };
}

function playClick() {
    if (count === beatsTotal) {
        count = 0;
    }
    console.log("Play: ", count, beatsTotal);
    // if (count === 0) {
    //     click1.play();
    //     click1.currentTime = 0;
    // } else {
    if (count > 0) {
        click2.play();
    }
    // click2.currentTime = 0;
    // }
    count++;
}

const metronome = new Timer(playClick, 60000 / bpm, { immediate: true });
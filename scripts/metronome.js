import Metronome from './metronomeTimer.js';

const metronome = new Metronome();

const tempo = document.querySelector('.tempo');
const tempoSlider = document.querySelector('.slider');
const subtractBeats = document.querySelector('#subtract-beats');
const addBeats = document.querySelector('#add-beats');
const beatsValue = document.querySelector('#beats-value');
const beatsValueDown = document.querySelector('#beats-value-down');
const beatsValueUp = document.querySelector('#beats-value-up');
const playPauseBtn = document.querySelector('#play-pause');

tempo.textContent = metronome.tempo;

// Add Event Listeners
tempoSlider.addEventListener('input', (event) => {
    metronome.tempo = event.target.value;
    tempo.textContent = metronome.tempo;
});

subtractBeats.addEventListener('click', () => {
    if (metronome.tempo <= 40) { return };
    metronome.tempo--;
    beatsValue.textContent = metronome.tempo;
    beatsValueUp.textContent = metronome.tempo + 1;
    beatsValueDown.textContent = metronome.tempo - 1;
});

addBeats.addEventListener('click', () => {
    if (metronome.tempo >= 220) { return };
    metronome.tempo++;
    beatsValue.textContent = metronome.tempo;
    beatsValueUp.textContent = metronome.tempo + 1;
    beatsValueDown.textContent = metronome.tempo - 1;
});

playPauseBtn.addEventListener('click', function() {
    metronome.startStop();

    if (metronome.isRunning) {
        playPauseBtn.textContent = 'Pause';
    } else {
        playPauseBtn.textContent = 'Play';
    }
});
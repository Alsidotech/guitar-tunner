var AudioContext = window.AudioContext || window.webkitAudioContext;
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var thestream
var audioContext = null;
var analyser = null;
var mediaStreamSource = null;
var audioSelect;
var constraints;
var rafID = null;
var buflen = 2048;
var buf = new Float32Array(buflen);
var equal = [
    Math.pow(2, 0 / 12), // unision
    Math.pow(2, 1 / 12), // minor second
    Math.pow(2, 2 / 12), // major second
    Math.pow(2, 3 / 12), // minor third
    Math.pow(2, 4 / 12), // major third
    Math.pow(2, 5 / 12), // perfect fourth
    Math.pow(2, 6 / 12), // tritone
    Math.pow(2, 7 / 12), // perfect fifth
    Math.pow(2, 8 / 12), // minor sixth
    Math.pow(2, 9 / 12), // major sixth
    Math.pow(2, 10 / 12), // minor seventh
    Math.pow(2, 11 / 12), // major seventh
    Math.pow(2, 12 / 12), // octave
];

audioSelect = document.getElementById('audioSource')
let sliderStringName = document.querySelector("#slider-label-string-name");
let sliderFrequency = document.querySelector("#slider-label-frequency");
let slider = document.querySelector("#slider");
const startStopBtn = document.querySelector(".startStopBtn")
let isRunning = 0

// tune.js
class Tune {
    constructor(options) {
        if (!options) { options = {} }
        // options
        this.temperament = options.temperament || 'equal'; // temperament
        this.fundamental = options.fundamental || 440; // fundamental frequency
        this.ratios = options.ratios || equal;
        this.targetFrequencies = options.targetFrequencies || [];
        this.midPoints = options.midPoints || [];
        this.frequency = options.frequency || 440; // incoming frequency

        this.setTemperament(this.temperament);

        startStopBtn.querySelector('span').addEventListener('click', initialize)
    }

    // set temperament
    setTemperament(e) {
        this.temperament = e;

        // calculate new ratios
        var newRatios = [];
        // console.log(e)
        window[e].forEach(function(r, i) {

            // other temperaments (non-pure ratios)
            if (e == 'equal') {
                newRatios.push(r);
            }
        });

        // update the ratios
        this.setRatios(newRatios)
    }

    // set ratios (upadtes tuning ratios) (send an array of ratios)
    setRatios(e) {

        try {
            this.ratios = e;
            var funda = this.fundamental;

            // calculate target frequencies given the ratios
            var newTargetFreqs = [];
            e.forEach(function(r, i) {
                newTargetFreqs.push(r * funda);
            });

            // console.log(newTargetFreqs)
            // array of target frequencies
            this.targetFrequencies = newTargetFreqs;

            // function to calculate mid points
            function diff(ary) {
                var newA = [];
                for (var i = 1; i < ary.length; i++) {
                    var x = ary[i] - ary[i - 1];
                    newA.push(x / 2);
                }
                return newA;
            }

            var newMidPoints = [];
            // for each target frequency, find the  halfway point (in Hz) and push to newMidPoints array
            diff(newTargetFreqs).forEach(function(v, i) { newMidPoints.push(newTargetFreqs[i] + v); });
            this.midPoints = newMidPoints;
        } catch (err) { console.error(err); }
    }

    // tune (calcultes cents)
    tune(e) {

        this.frequency = e;

        //get Wavelength
        // this.wavelength = this.speedOfSound / this.frequency;
        var frequency = e;
        var cents;

        // get the highest of the midPoints, then devide by two
        // this will be the low threshold...if higher, we multiply by 2
        var highMidPoint = this.midPoints[this.midPoints.length - 1] / 2;

        // multiply/divide frequency until between 440 & 880
        for (let step = 0; step < 100; step++) {
            if (frequency < highMidPoint) { frequency = frequency * 2; } else if (frequency > highMidPoint * 2) { frequency = frequency / 2; } else { break; }
        }

        // for each value in midPoints array, loop until
        // we find the first value our frequency is greater than

        var midPoints = this.midPoints;
        var targ = this.targetFrequencies;
        //console.log(targ)
        midPoints.some(function(v, i) {
            if (frequency < v) {
                // calulate cents
                cents = 1200 * Math.log2(frequency / targ[i]);
                return frequency < v;
            }
        });
        return cents;
    }

    // ===== static functions ===== //
    static noteFromPitch(frequency) {
        var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
        return Math.round(noteNum) + 69;
    }

    // frequency to MIDI
    static ftom(freq) {
        const note = Math.round(69 + 12 * Math.log2(freq / 440));
        return note;
    }

    // convert MIDI note to note name
    static getNoteName(e, accidental) {

        //var notesDefault = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
        var notesFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        var notesSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        // negative number will default to flat
        // positive number will default to sharp
        if (!accidental) {
            if (e < 0) { e = Math.abs(e); return notesFlat[e % 12]; } else { return notesSharp[e % 12]; }
        }
        // or use a second argument 'sharp' or 'flat'
        else if (accidental == 'flat') { return notesFlat[e % 12]; } else if (accidental == 'sharp') { return notesSharp[e % 12]; }

    }
}

function initialize(e) {
    if (isRunning) {
        startStopBtn.querySelector("span").innerText = 'Start'
        document.location.reload(true)
    }
    startStopBtn.querySelector("span").innerText = 'Stop'
    isRunning = 1
    audioContext = new(window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    navigator.mediaDevices.getUserMedia({ video: false, audio: !this.isCameraAccessGranted, }).then(() => { enumm(); });
    updatePitch()
}

function enumm() {
    navigator.mediaDevices.enumerateDevices().then(gotDevices).then(toggleLiveInput).catch(handleError);
}

function toggleLiveInput() {
    if (thestream) {
        thestream.getTracks().forEach(function(track) { track.stop(); });
    }
    getUserMedia(constraints, gotStream);
}

function gotStream(stream) {
    thestream = stream
    mediaStreamSource = audioContext.createMediaStreamSource(stream);
    mediaStreamSource.connect(analyser);
}

function handleError(error) { console.error("Error: ", error); }

function getUserMedia(constraints, callback) {
    try {

        console.log(audioSelect.options[audioSelect.selectedIndex].value)
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        constraints = {
                audio: {
                    deviceId: { exact: audioSelect.options[audioSelect.selectedIndex].value },
                    channelCount: 2,
                    autoGainControl: false,
                    channelCount: 2,
                    echoCancellation: false,
                    latency: 0,
                    noiseSuppression: false,
                    sampleRate: 48000,
                    sampleSize: 16,
                    volume: 1.0
                        //audio:true
                },
                video: false
            }
            //navigator.getUserMedia(dictionary, callback, error);
        navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
    } catch (e) { /*   alert('getUserMedia threw exception :' + e); */ }
}

function gotDevices(deviceInfos) {
    for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        const option = document.createElement("option");
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === "audioinput") {
            option.text = deviceInfo.label || "microphone " + (audioSelect.length + 1);
            audioSelect.appendChild(option);
        }
    }
}

function getStream() {
    if (window.stream) {
        window.stream.getTracks().forEach(function(track) {
            track.stop();
        });
    }
}

function autoCorrelate(buf, sampleRate) {
    // Implements the ACF2+ algorithm
    var SIZE = buf.length;
    var rms = 0;

    for (var i = 0; i < SIZE; i++) {
        var val = buf[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);

    if (rms < 0.01) { // not enough signal
        return -1;
    }
    var r1 = 0,
        r2 = SIZE - 1,
        thres = 0.2;
    for (var i = 0; i < SIZE / 2; i++) { if (Math.abs(buf[i]) < thres) { r1 = i; break; } }
    for (var i = 1; i < SIZE / 2; i++) { if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; } }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    var c = new Array(SIZE).fill(0);
    for (var i = 0; i < SIZE; i++) {
        for (var j = 0; j < SIZE - i; j++) {
            c[i] = c[i] + buf[j] * buf[j + i];
        }
    }
    var d = 0;
    while (c[d] > c[d + 1]) d++;
    var maxval = -1,
        maxpos = -1;
    for (var i = d; i < SIZE; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }
    var T0 = maxpos;

    var x1 = c[T0 - 1],
        x2 = c[T0],
        x3 = c[T0 + 1];
    a = (x1 + x3 - 2 * x2) / 2;
    b = (x3 - x1) / 2;
    if (a) { T0 = T0 - b / (2 * a); }

    return sampleRate / T0;
}

function updatePitch() {
    analyser.getFloatTimeDomainData(buf);
    var ac = autoCorrelate(buf, audioContext.sampleRate);
    if (ac == -1) {
        sliderStringName.innerText = "-";
        slider.value = "0.0"
        sliderFrequency.style.left = "51%";
    } else {
        frequency = ac;
        Tune.getNoteName(Tune.ftom(frequency))
        const note = Tune.noteFromPitch(frequency)

        var detune = tuner.tune(frequency)
        slider.value = detune

        if (detune < 0) {
            marginLeft = Math.ceil(50 + detune / 2) + 1 + "%";
            sliderFrequency.innerText = "Nizko" // Low => Nizko
        } else if (detune == 0) {
            marginLeft = "51%"
            sliderFrequency.innerText = "Pravilno" // Pravilno => Normal
        } else {
            marginLeft = Math.ceil(50 + detune / 2) + 1 + "%";
            sliderFrequency.innerText = "Visoko" //Visoko => High
            console.log("Detune: ", format(detune));
        }
        sliderStringName.innerText = Tune.getNoteName(Tune.ftom(frequency) * -1)
        sliderFrequency.style.left = marginLeft;
        sliderStringName.style.left = marginLeft;
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    }
    rafID = window.requestAnimationFrame(updatePitch);
}

// add (+) if positive, and round to 4 decimals
function format(e) {
    return (e < 0 ? "" : "+") + (e).toFixed(0);
}
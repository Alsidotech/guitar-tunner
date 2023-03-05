let soundIndication;

//Call initialize() when page is loaded
window.addEventListener("load", initialize);

//frequencies and names of guitar strngs in standard tuning
// var standard_frequency = new Array(261.63, 329.63, 392, 440);
var standard_frequency = new Array(88, 331, 393, 440);
var strings_name = new Array("C", "E", "G", "A");
var string; //this variable holds name of string being tuned

//As the name suggests, this function is called when page is loaded
function initialize() {
    draw();
    var constraints = { audio: true }; //only request audio from microphones, video not required
    //Request permission to record audio. If allowed, call use_stream function, which will process "audio stream".
    //Show error in console if permission is not granted
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            console.log("Connected live audio input :)"); //Yeah, we're happy
            use_stream(stream);
        })
        .catch(function(err) {
            console.log(err.name + ": " + err.message);
        }); // always check for errors at the end.
}

//This function take audio stream as input and processes it to recognise guitar string being played and frequency of input audio
function use_stream(stream) {
    //Create an audio context object
    var audio_context = new(window.AudioContext || window.webkitAudioContext)();
    //Create a new MediaStreamAudioSourceNode object from given stream
    var microphone = audio_context.createMediaStreamSource(stream);
    //Create Analyser node which will used to analyse the signal
    var analyser = audio_context.createAnalyser();
    //Connect MediaStreamAudioSourceNode object microphone with analyser
    microphone.connect(analyser);
    //Twice of number of samples of input audio we want to capture. 4096 seemed sufficient.
    //Higher values will take more CPU time, and may not be doable in real time.
    analyser.fftSize = 2048; //4096
    //Number of sample = 2048
    var bufferLength = analyser.frequencyBinCount;

    //This function will store the data from audio stream into an array, and find its frequency
    //This is THE FUNCTION
    function auto_correlation() {
        var difference, min_diff, offset, amplitude, string_offset;
        //Array to take Time Domain Data from analyser and store it
        var buffer = new Float32Array(bufferLength);
        analyser.getFloatTimeDomainData(buffer);
        //First I check amplitude of input, if amplitude is less than certain threshold, tt's just noise. Why to waste time on it!
        amplitude = 0;
        for (var j = 0; j < bufferLength; j++)
            amplitude += buffer[j];
        amplitude /= bufferLength;
        if (amplitude > 0.00025) //arbitrary chosen: It seems that values lower than this are just noise
        {
            //Compare the signal with itself and different offsets(6 offsets for 6 strings).
            //Offset which gives minimum difference will correspond to the string being tuned.
            min_diff = 1000000000;
            for (var i = 0; i < 4; i++) {
                difference = 0;
                // Eg. sample rate is 8 samples/second
                // frequency = 2 
                // 4 samples are taken per wave = offset with which wave will match with itself
                offset = Math.floor((audio_context.sampleRate) / standard_frequency[i]);
                for (var j = 0; j < bufferLength - offset; j++) {
                    difference += Math.abs(buffer[j] - buffer[j + offset]);
                }
                difference /= bufferLength;
                if (difference < min_diff) {
                    min_diff = difference;
                    string = i; //detected string
                }
            }

            // limits on offsets to which will will correlate waveform
            // limits will be the mid-point of offset of this string and next strings in both directions.
            // Arbitrary values taken for corner strings.
            // We have narrowed down our search for frequency of input signal
            // Input frequency will be between to those corresponding to upper_limit and lower_limit
            var upper_limit, lower_limit;
            if (string == 0)
                upper_limit = 650;
            else upper_limit = Math.floor(((audio_context.sampleRate) / standard_frequency[string - 1] + (audio_context.sampleRate) / standard_frequency[string]) / 2);
            if (string == 5)
                lower_limit = 100;
            else lower_limit = Math.floor(((audio_context.sampleRate) / standard_frequency[string] + (audio_context.sampleRate) / standard_frequency[string + 1]) / 2);

            //Now as we know the string being tuned and frequencies around it
            //compare the input signal with itself with offsets in range [lower_limit, upper_limit]
            // Whichever offset gives minimum difference, corresponds to frequency of input signal
            min_diff = 1000000000;
            for (var i = lower_limit; i <= upper_limit; i++) {
                difference = 0;
                for (var j = 0; j < bufferLength - i; j++) {
                    difference += Math.abs(buffer[j] - buffer[j + i]);
                }
                if (difference < min_diff) {
                    min_diff = difference;
                    //The offset corresponding to frequency of input signal
                    offset = i;
                }
            }
            //Frequency of input signal
            frequency = Math.floor((audio_context.sampleRate) / offset);
            // Frequencies for offset <120 or >630 will be just noises, as they are far from range of guitar strings
            // If frequency is well within the range, draw input chart on screen displaying tuning information
            if (offset > 120 && offset < 630) {
                // console.log("string = "+string+"  f = "+frequency+"  offset = "+offset+"\n");
                // console.log("upper_limit = "+upper_limit+"  lower_limit = "+lower_limit+"\n");
                draw(frequency)
            }
        }
        //Recursion: Call itself after every 250ms to be ever-ready to take input and process it
        setTimeout(auto_correlation, 250);
    }
    //Calling auto_correlation once on page load
    auto_correlation();
}

function draw(frequency) {
    let cents = 1200 * Math.log2(frequency / standard_frequency[string]);
    let sliderFrequency = document.querySelector("#slider-label-frequency");
    let sliderStringName = document.querySelector("#slider-label-string-name");
    let slider = document.querySelector("#slider");

    if (frequency) {
        let marginLeft;
        const min = -(Math.abs(cents) + 1000)
        const max = Math.abs(cents) + 1000
        const per = Math.ceil((Math.abs(cents) + 1000) * 2 / 100)
        slider.min = min
        slider.max = max
        slider.value = cents
        console.log("Frequency: ", frequency);

        if (cents < 0) {
            marginLeft = Math.ceil(50 + cents / per) + 1 + "%";
            sliderFrequency.innerText = "Nizko" // Low => Nizko
        } else if (cents === 0) {
            marginLeft = "51%"
            sliderFrequency.innerText = "Pravilno" // Pravilno => Normal
        } else {
            marginLeft = Math.ceil(50 + cents / per) + 1 + "%";
            sliderFrequency.innerText = "Visoko" //Visoko => High
        }
        sliderStringName.innerText = strings_name[string] + ' ' + frequency
        sliderFrequency.style.left = marginLeft;
        sliderStringName.style.left = marginLeft;

        return;
    }

    slider.value = "0.0"
    sliderFrequency.style.left = "51%";

}
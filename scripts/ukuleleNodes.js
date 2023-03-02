window.addEventListener('DOMContentLoaded', (event) => {
    // Get references to the HTML elements
    const stringSelectors = document.querySelectorAll('.st');
    const stringSelectorsMobile = document.querySelectorAll('.st-mobile');
    const audioElements = document.querySelectorAll('audio');

    //Strings for Web
    // Loop through each selector and add an event listener
    stringSelectors.forEach((selector, index) => {
        selector.addEventListener('click', () => {
            // Get the audio element corresponding to the selected string
            const audioElement = audioElements[index];
            // Set the audio element's source to the corresponding frequency
            audioElement.src = `./assets/audio/nodes/${selector.innerText}4.mp3`;
            // Play the audio
            audioElement.play();
        });
    });

    //Strings for mobile
    // Loop through each selector and add an event listener
    stringSelectorsMobile.forEach((selector, index) => {
        selector.addEventListener('click', () => {
            // Get the audio element corresponding to the selected string
            const audioElement = audioElements[index];
            // Set the audio element's source to the corresponding frequency
            audioElement.src = `./assets/audio/nodes/${selector.innerText}4.mp3`;
            // Play the audio
            audioElement.play();
        });
    });
});
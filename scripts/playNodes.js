window.addEventListener('DOMContentLoaded', (event) => {
    // Grab HTML Elements
    const stringWebE1 = document.querySelector('.string-web-E1');
    const StringWebB2 = document.querySelector('.string-web-B2');
    const stringWebG3 = document.querySelector('.string-web-G3');
    const stringWebD4 = document.querySelector('.string-web-D4');
    const stringWebA5 = document.querySelector('.string-web-A5');
    const stringWebE6 = document.querySelector('.string-web-E6');

    const stringE1 = document.querySelector('.string-E1');
    const StringB2 = document.querySelector('.string-B2');
    const stringG3 = document.querySelector('.string-G3');
    const stringD4 = document.querySelector('.string-D4');
    const stringA5 = document.querySelector('.string-A5');
    const stringE6 = document.querySelector('.string-E6');

    // Add Event Listeners
    stringWebE1.addEventListener('click', () => {
        cloneAndPlay(E1);
    });

    StringWebB2.addEventListener('click', () => {
        cloneAndPlay(B2);
    });

    stringWebG3.addEventListener('click', () => {
        cloneAndPlay(G3);
    });

    stringWebD4.addEventListener('click', () => {
        cloneAndPlay(D4);
    });

    stringWebA5.addEventListener('click', () => {
        cloneAndPlay(A5);
    });

    stringWebE6.addEventListener('click', () => {
        cloneAndPlay(E6);
    });

    stringE1.addEventListener('click', () => {
        cloneAndPlay(E1);
    });

    StringB2.addEventListener('click', () => {
        cloneAndPlay(B2);
    });

    stringG3.addEventListener('click', () => {
        cloneAndPlay(G3);
    });

    stringD4.addEventListener('click', () => {
        cloneAndPlay(D4);
    });

    stringA5.addEventListener('click', () => {
        cloneAndPlay(A5);
    });

    stringE6.addEventListener('click', () => {
        cloneAndPlay(E6);
    });
});

// function that will clone the audio node, and play it
function cloneAndPlay(audioNode) {
    // the true parameter will tell the function to make a deep clone (cloning attributes as well)
    var clone = audioNode.cloneNode(true);
    clone.play();
}
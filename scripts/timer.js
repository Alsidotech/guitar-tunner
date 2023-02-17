const metronomeContainer = document.querySelector('.metronome-container');
const led = document.querySelectorAll('.led');

const colors = ['rgba(152, 165, 37, 0.21)', 'rgba(37, 165, 88, 0.21)', 'rgba(37, 110, 165, 0.21)', 'rgba(165, 37, 97, 0.21)']
let index = 0

// Add accurate timer constructor function
function Timer(callback, timeInterval, options) {
    this.timeInterval = timeInterval;

    // Add method to start timer
    this.start = () => {
            // Set the expected time. The moment in time we start the timer plus whatever the time interval is. 
            this.expected = Date.now() + this.timeInterval;
            // Start the timeout and save the id in a property, so we can cancel it later
            this.theTimeout = null;

            if (options.immediate) {
                callback();
            }

            this.timeout = setTimeout(this.round, this.timeInterval);
            console.log('Timer Started');
        }
        // Add method to stop timer
    this.stop = () => {

            clearTimeout(this.timeout);
            console.log('Timer Stopped');
        }
        // Round method that takes care of running the callback and adjusting the time
    this.round = () => {
        console.log('timeout', this.timeout);
        // The drift will be the current moment in time for this round minus the expected time..
        let drift = Date.now() - this.expected;
        // Run error callback if drift is greater than time interval, and if the callback is provided
        if (drift > this.timeInterval) {
            // If error callback is provided
            if (options.errorCallback) {
                options.errorCallback();
            }
        }
        callback();
        // Increment expected time by time interval for every round after running the callback function.
        this.expected += this.timeInterval;
        console.log('Drift:', drift);
        console.log('Next round time interval:', this.timeInterval - drift);
        metronomeContainer.style.background = `radial-gradient(116.99% 103.56% at 50% 100%, rgba(33, 41, 41, 0) 0%, ${colors[index]} 87.75%), linear-gradient(0deg, #FFFFFF, #FFFFFF)`;
        led[index].classList.add('led-color')

        switch (index) {
            case 0:
                led[3].classList.remove('led-color')
                index++;
                break;
            case 3:
                led[index - 1].classList.remove('led-color')
                index = 0;
                break
            default:
                led[index - 1].classList.remove('led-color')
                index++;
        }

        // Run timeout again and set the timeInterval of the next iteration to the original time interval minus the drift.
        this.timeout = setTimeout(this.round, this.timeInterval - drift);
    }
}

export default Timer;
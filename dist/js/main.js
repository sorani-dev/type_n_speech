"use strict"

// Init SpeechSynth API
const synth = window.speechSynthesis

// DOM Elements
const inputForm = document.querySelector('form');
/** @type HTMLInputElement */
const textInput = document.querySelector('#text-input');
/** @type HTMLSelectElement */
const voiceSelect = document.querySelector('#voice-select');
/** @type HTMLInputElement */
const pitch = document.querySelector('#pitch');
const pitchValue = document.querySelector('#pitch-value');
/** @type HTMLInputElement */
const rate = document.querySelector('#rate');
const rateValue = document.querySelector('#rate-value');
/** @type HTMLInputElement */
const volume = document.querySelector('#volume');
const volumeValue = document.querySelector('#volume-value');
/** @type HTMLButtonElement */
const controlButton = document.querySelector('button')
/** @type HTMLBodyElement */
const body = document.querySelector('body')

/** @type SpeechSynthesisVoice[]  Init voices array */
let voices = [];

/**
 * Get the voices installed on the system
 */
const getVoices = () => {
    voices = synth.getVoices().sort((a, b) => {
        const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
        if (aname < bname) return -1;
        else if (aname > bname) return 1;
        return 0;
    })
    voices = synth.getVoices();

    // Loop through voices and create an option for each one
    voices.forEach(voice => {
        // Create an option element
        const option = document.createElement('option')
        // Fill option with voice and language
        option.textContent = `${voice.name} (${voice.lang})`

        // Default option
        if (voice.default) {
            option.selected = true;
            option.textContent += ' -- DEFAULT';
        }

        // Set needed option attributes
        option.setAttribute('data-lang', voice.lang)
        option.setAttribute('data-name', voice.name)

        voiceSelect.appendChild(option)
    })

    // Set the voice to the selected
    const selectedIndex = voiceSelect.selectedIndex >= 0 ? voiceSelect.selectedIndex : 0
    voiceSelect.selectedIndex = selectedIndex
}


const startBackgroundAnimation = () => {
    body.style.background = '#141414 url(\'../images/wave.gif\')';
    body.style.backgroundRepeat = 'repeat-x';
    body.style.backgroundSize = '100% 100%';
}

const endBackgroundAnimation = () => {
    body.style.background = '#141414';
}

/**
 * Speak input text
 * @param {boolean} resetVoice 
 * @returns 
 */
const speak = (resetVoice = false) => {

    // Add background animation
    startBackgroundAnimation()


    // Check voice changed
    if (resetVoice) {
        synth.cancel()
    }

    // Check if speaking
    if (synth.speaking) {
        console.error('Already speaking...');
        return;
    }

    // Exit if no text
    if (textInput.value.trim() === '') {
        return;
    }

    // Get speak text
    const speakText = new SpeechSynthesisUtterance(textInput.value.trim())

    // Speak ended
    speakText.onend = e => {
        console.log('Done speaking...');
        controlButton.textContent = 'Speak It'
        endBackgroundAnimation()
    }

    // Speak error
    speakText.onerror = e => {
        console.error('Something went wrong', e);
    }

    speakText.onpause = e => {
        controlButton.textContent = 'Speak It'
        endBackgroundAnimation()
    }

    speakText.onresume = e => {
        controlButton.textContent = 'Pause It'
        startBackgroundAnimation()
    }

    speakText.onstart = e => {
        controlButton.textContent = 'Pause It'
    }


    // Selected voice
    const selectedVoice = voiceSelect.selectedOptions[0].getAttribute('data-name');

    voices.forEach(voice => {
        if (voice.name === selectedVoice) {
            speakText.voice = voice;
        }
    })

    // Set pitch and rate
    speakText.rate = rate.value;
    speakText.pitch = pitch.value;
    speakText.volume = parseInt(volume.value, 10) / 100;

    // Speak
    synth.speak(speakText);
}

// Populate voices
getVoices();
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = getVoices;
}


/**
 * Event Listeners
 */

// Text form submit listener
inputForm.addEventListener('submit', e => {
    e.preventDefault();
    if (synth.paused) {
        synth.resume()
        return
    }
    if (synth.speaking) {
        synth.pause()
        return
    }
    speak()
    textInput.blur();
})

// Rate value change
rate.addEventListener('change', e => rateValue.textContent = rate.value)

// Pitch value change
pitch.addEventListener('change', e => pitchValue.textContent = pitch.value)

// Volume value change
volume.addEventListener('change', e => volumeValue.textContent = volume.value)

// Voice selected change
voiceSelect.addEventListener('change', e => {
    speak(true);
})

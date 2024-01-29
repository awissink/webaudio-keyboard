document.addEventListener("DOMContentLoaded", function(event) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const globalGain = audioCtx.createGain();
    globalGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    globalGain.connect(audioCtx.destination);

    const keyboardFrequencyMap = {
        '90': 261.625565300598634,  // Z - C
        '83': 277.182630976872096, // S - C#
        '88': 293.664767917407560,  // X - D
        '68': 311.126983722080910, // D - D#
        '67': 329.627556912869929,  // C - E
        '86': 349.228231433003884,  // V - F
        '71': 369.994422711634398, // G - F#
        '66': 391.995435981749294,  // B - G
        '72': 415.304697579945138, // H - G#
        '78': 440.000000000000000,  // N - A
        '74': 466.163761518089916, // J - A#
        '77': 493.883301256124111,  // M - B
        '81': 523.251130601197269,  // Q - C
        '50': 554.365261953744192, // 2 - C#
        '87': 587.329535834815120,  // W - D
        '51': 622.253967444161821, // 3 - D#
        '69': 659.255113825739859,  // E - E
        '82': 698.456462866007768,  // R - F
        '53': 739.988845423268797, // 5 - F#
        '84': 783.990871963498588,  // T - G
        '54': 830.609395159890277, // 6 - G#
        '89': 880.000000000000000,  // Y - A
        '55': 932.327523036179832, // 7 - A#
        '85': 987.766602512248223,  // U - B
    }

    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);

    var activeOscillators = {};
    const gainNodes = {};
    let selectedWaveform = 'sine'; // Default

    const waveformSelector = document.getElementById('waveform-select');

    waveformSelector.addEventListener('change', function(event) {
        selectedWaveform = event.target.value;
        for (const key in activeOscillators) {
            activeOscillators[key].oscillator.type = selectedWaveform;
        }
    });

    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            playNote(key);
            updateKeyColor(key, true);
        }
    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {
            if (activeOscillators[key]) {
                const { oscillator, gainNode } = activeOscillators[key];
                oscillator.stop();
                oscillator.disconnect();
                gainNode.disconnect();
                delete activeOscillators[key];
            }
            updateKeyColor(key, false);
        }
    }

    function playNote(key) {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime);
        osc.type = selectedWaveform;

        const releaseTime = 0.2;
        const currentTime = audioCtx.currentTime;

        osc.connect(gainNode);
        gainNode.connect(globalGain);

        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.8, currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + releaseTime);

        osc.start();
        osc.stop(currentTime + releaseTime);
        activeOscillators[key] = { oscillator: osc, gainNode: gainNode };
    }

    function updateKeyColor(key, addColor) {
        const keyElement = document.querySelector(`[data-note="${key}"]`);
        if (addColor) {
            const hue = (Math.random() * 360).toFixed(2);
            keyElement.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
            keyElement.style.color = 'white';
            activeKeyColors[key] = hue;
        } else {
            keyElement.style.backgroundColor = '';
            keyElement.style.color = 'black';
            delete activeKeyColors[key];
        }
    }
});
const form = document.getElementById('tone-form');
const volumeInput = document.getElementById('volume');
const volumeDisplay = document.getElementById('volume-display');
const canvas = document.getElementById('progress-bar');
const ctx = canvas.getContext('2d');

let audioContext = null;

// Update volume display
volumeInput.addEventListener('input', () => {
    volumeDisplay.textContent = `${(volumeInput.value * 100).toFixed(0)}%`;
});

// Handle form submission
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const frequency = parseFloat(document.getElementById('frequency').value);
    const duration = parseFloat(document.getElementById('duration').value);
    const volume = parseFloat(volumeInput.value);

    try {
        const response = await fetch('/generate_audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frequency, duration, volume }),
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        playAudio(data.audio, data.sample_rate, duration, volume);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while generating audio.');
    }
});

// Function to play audio data
function playAudio(audioData, sampleRate, duration, volume) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const buffer = audioContext.createBuffer(1, audioData.length, sampleRate);
    buffer.copyToChannel(new Float32Array(audioData), 0);

    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start();

    // Display progress bar
    let startTime = Date.now();
    const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min((elapsed / duration) * 100, 100);

        drawProgressBar(progress);

        if (elapsed >= duration) {
            clearInterval(interval);
        }
    }, 50);
}

// Draw progress bar
function drawProgressBar(progress) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, (progress / 100) * canvas.width, canvas.height);
}

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
        // Send the data to the backend for audio generation
        const response = await fetch('/generate_audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frequency, duration, volume }),
        });

        // Check if the response is valid
        if (!response.ok) {
            throw new Error('Failed to generate audio');
        }

        const data = await response.json();

        // If the data contains an error, handle it
        if (data.error) {
            throw new Error(data.error);
        }

        // Play the audio with the generated data
        playAudio(data.audio, data.sample_rate, duration, volume);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while generating audio.');
    }
});

// Function to play audio data
function playAudio(audioData, sampleRate, duration, volume) {
    // Initialize audio context if it is not yet initialized
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Resume the AudioContext if it was previously suspended
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // Create an audio buffer from the generated audio data
    const buffer = audioContext.createBuffer(1, audioData.length, sampleRate);
    buffer.copyToChannel(new Float32Array(audioData), 0);

    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    // Create a gain node and set the volume
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;

    // Connect the audio graph
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start playing the audio
    source.start();

    // Display progress bar
    let startTime = Date.now();
    const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min((elapsed / duration) * 100, 100);

        // Draw the progress bar on the canvas
        drawProgressBar(progress);

        // Stop the interval when the audio finishes
        if (elapsed >= duration) {
            clearInterval(interval);
        }
    }, 50); // Update every 50ms for smoother progress
}

// Draw progress bar on the canvas
function drawProgressBar(progress) {
    // Clear previous progress
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set the color and fill the progress bar
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, (progress / 100) * canvas.width, canvas.height);
}

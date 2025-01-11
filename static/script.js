// Dynamically update volume display
const volumeSlider = document.getElementById("volume");
const volumeDisplay = document.getElementById("volume-display");
volumeSlider.addEventListener("input", () => {
  volumeDisplay.textContent = Math.round(volumeSlider.value * 100) + "%";
});

// Dynamically update playback speed display
const speedSlider = document.getElementById("playback-speed");
const speedDisplay = document.getElementById("speed-display");
speedSlider.addEventListener("input", () => {
  speedDisplay.textContent = speedSlider.value + "x";
});

// Handle form submission and play audio
const form = document.getElementById("tone-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Get input values
  const frequency = parseFloat(document.getElementById("frequency").value);
  const duration = parseFloat(document.getElementById("duration").value);
  const volume = parseFloat(volumeSlider.value);
  const playbackSpeed = parseFloat(speedSlider.value);

  try {
    const response = await fetch("/generate_audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ frequency, duration, volume }),
    });

    const data = await response.json();
    if (data.error) {
      alert(`Error: ${data.error}`);
      return;
    }

    // Create AudioBuffer from response
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const audioBuffer = audioContext.createBuffer(
      1,
      data.audio.length,
      data.sample_rate
    );
    audioBuffer.getChannelData(0).set(new Float32Array(data.audio));

    // Play the audio with adjusted playback speed
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = playbackSpeed; // Adjust playback speed
    source.connect(audioContext.destination);
    source.start(0);

    // Update progress bar while the audio is playing
    updateProgressBar(audioContext, audioBuffer.duration);
  } catch (error) {
    console.error("Error generating audio:", error);
  }
});

// Function to update the progress bar (using the canvas)
// Function to update the progress bar (using the canvas)
function updateProgressBar(audioContext, duration) {
  const canvas = document.getElementById("progress-canvas");
  const context = canvas.getContext("2d");

  // Set the border (box outline) of the progress bar
  context.lineWidth = 2;
  context.strokeStyle = "#333"; // Color of the border
  context.strokeRect(0, 0, canvas.width, canvas.height); // Draw the box outline

  let startTime = audioContext.currentTime;
  const endTime = startTime + duration;
  const totalTime = endTime - startTime;

  // Update progress on the canvas
  function update() {
    const currentTime = audioContext.currentTime;
    const progress = ((currentTime - startTime) / totalTime) * 100;

    // Update the canvas progress
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame
    context.fillStyle = "#4CAF50"; // Color of the progress bar
    context.fillRect(0, 0, (canvas.width * progress) / 100, canvas.height);

    // Reapply the border after clearing the canvas
    context.strokeRect(0, 0, canvas.width, canvas.height); // Draw the box outline again

    if (currentTime < endTime) {
      requestAnimationFrame(update);
    }
  }

  update();
}

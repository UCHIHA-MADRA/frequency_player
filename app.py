from flask import Flask, render_template, request, jsonify
import numpy as np
import os
from flask_cors import CORS  # Added CORS for cross-origin requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

SAMPLE_RATE = 44100

# Function to generate audio waveform data
def generate_audio_wave(frequency, duration, volume):
    # Generate the time points based on the duration and sample rate
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), False)
    # Generate sine wave for the given frequency and amplitude (volume)
    wave = volume * np.sin(2 * np.pi * frequency * t)
    return wave.tolist()

# Route for the main page (index.html)
@app.route('/')
def index():
    return render_template('index.html')

# API endpoint to generate audio wave data
@app.route('/generate_audio', methods=['POST'])
def generate_audio():
    try:
        # Ensure the request is in JSON format
        data = request.get_json()
        
        # Extract data from JSON payload
        frequency = float(data['frequency'])
        duration = float(data['duration'])
        volume = float(data['volume'])
        
        # Generate audio wave based on parameters
        audio_wave = generate_audio_wave(frequency, duration, volume)
        
        # Return the generated audio data and sample rate in a JSON response
        return jsonify({'audio': audio_wave, 'sample_rate': SAMPLE_RATE})
    
    except Exception as e:
        # Return error message if something goes wrong
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    # Set the port for the application, default to 5000
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

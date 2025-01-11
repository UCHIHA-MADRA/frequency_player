from flask import Flask, render_template, request, jsonify
import numpy as np
import os

app = Flask(__name__)

SAMPLE_RATE = 44100

# Function to generate audio waveform data
def generate_audio_wave(frequency, duration, volume):
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), False)
    wave = volume * np.sin(2 * np.pi * frequency * t)
    return wave.tolist()

# Route for the main page
@app.route('/')
def index():
    return render_template('index.html')

# API endpoint to generate audio wave data
@app.route('/generate_audio', methods=['POST'])
def generate_audio():
    try:
        data = request.get_json()
        frequency = float(data['frequency'])
        duration = float(data['duration'])
        volume = float(data['volume'])

        audio_wave = generate_audio_wave(frequency, duration, volume)
        return jsonify({'audio': audio_wave, 'sample_rate': SAMPLE_RATE})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
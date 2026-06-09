from flask import Flask, request, jsonify
import pandas as pd
from joblib import load
from flask_cors import CORS

# Load the trained model
import os
backend_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(backend_dir, 'stroke_prediction_model.joblib')
model = load(model_path)

#initialize the flask app
app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        df = pd.DataFrame([data])

        prediction = model.predict(df)[0]

        print(f"prediction: {prediction}")

        return jsonify({"stroke": int(prediction)}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/')
def home():
    return "Welcome to the Stroke Prediction API"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
from flask import Blueprint, request, jsonify
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.losses import MeanSquaredError # <-- 1. WAJIB TAMBAHKAN IMPOR INI
from sklearn.preprocessing import StandardScaler
import joblib
import os

# Definisikan Blueprint
lstm_predict_bp = Blueprint('lstm_predict_bp', __name__)

# --- Muat Model dan Scaler ---
model = None
scaler = None

try:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, '..', 'models', 'model_lstm.h5')
    scaler_path = os.path.join(base_dir, '..', 'models', 'scaler.joblib')

    if os.path.exists(model_path):
        # --- 2. WAJIB UBAH BARIS INI ---
        # Tambahkan custom_objects untuk membantu Keras mengenali 'mse'
        model = load_model(model_path, custom_objects={'mse': MeanSquaredError()})
        print("SUCCESS: Model LSTM berhasil dimuat.")

        if os.path.exists(scaler_path):
            scaler = joblib.load(scaler_path)
            print("SUCCESS: Scaler berhasil dimuat dari file.")
        else:
            # Fallback jika file scaler.joblib tidak ada
            scaler = StandardScaler()
            plausible_glucose_range = np.array(range(40, 400)).reshape(-1, 1)
            scaler.fit(plausible_glucose_range)
            print("WARNING: Menggunakan scaler estimasi.")
    else:
        print("WARNING: File model_lstm.h5 tidak ditemukan.")

except Exception as e:
    print(f"ERROR: Gagal memuat model atau scaler: {e}")
# ----------------------------------------------------


@lstm_predict_bp.route('/glucose-trend', methods=['POST'])
def predict_glucose_trend():
    # Sisa kode di bawah ini tidak perlu diubah
    if model is None or scaler is None:
        return jsonify({"error": "Layanan prediksi tren glukosa tidak tersedia di server."}), 503

    try:
        data = request.json
        glucose_readings = data.get('glucose_readings')

        if not glucose_readings or len(glucose_readings) != 3:
            return jsonify({"error": "Input tidak valid. Harap berikan 3 nilai glukosa terakhir."}), 400

        input_data = np.array(glucose_readings).reshape(-1, 1)
        scaled_input = scaler.transform(input_data)
        X_new = scaled_input.reshape(1, 3, 1)

        predicted_scaled = model.predict(X_new)
        predicted_glucose = scaler.inverse_transform(predicted_scaled)[0]

        response_data = {
            "message": "Prediksi tren glukosa untuk 5 hari ke depan berhasil.",
            "predictions": [round(float(val), 2) for val in predicted_glucose],
            "average_prediction": round(float(np.mean(predicted_glucose)), 2)
        }
        
        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error saat prediksi tren glukosa: {e}")
        return jsonify({"error": "Terjadi kesalahan internal saat melakukan prediksi."}), 500
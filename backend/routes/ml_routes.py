# File: routes/ml_routes.py

from flask import Blueprint, request, jsonify
import joblib
import numpy as np
import os # Pastikan 'os' sudah diimpor

ml_bp = Blueprint("ml", __name__)

# --- Gunakan kode ini untuk memuat model ---
try:
    # Mendapatkan path absolut dari direktori tempat file ini berada (/routes)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Membangun path ke file model ('..' naik satu direktori, lalu masuk ke /models/)
    # Pastikan nama folder adalah 'models' (dengan 's')
    model_path = os.path.join(base_dir, '..', 'models', 'best_rf_model.pkl')
    scaler_path = os.path.join(base_dir, '..', 'models', 'scaler.pkl')

    # Memuat file menggunakan path absolut
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    print("SUCCESS: Model dan scaler prediksi berhasil dimuat.")

except FileNotFoundError:
    model = None
    scaler = None
    print("WARNING: Gagal memuat model atau scaler. Periksa kembali path dan nama file.")
# --- Akhir bagian pemuatan model ---


@ml_bp.route("/predict", methods=["POST"])
def predict():
    # ... sisa kode Anda tidak perlu diubah ...
    if model is None or scaler is None:
        return jsonify({"error": "Model prediksi tidak tersedia di server"}), 503

    try:
        data_json = request.json
        
        gender = int(data_json["gender"])
        age = int(data_json["age"])
        hypertension = int(data_json["hypertension"])
        heart_disease = int(data_json["heart_disease"])
        smoking_history = int(data_json["smoking_history"])
        berat = float(data_json["berat"])
        tinggi = float(data_json["tinggi"])
        hba1c = float(data_json["hba1c_level"])
        glucose = float(data_json["blood_glucose"])

        # Kalkulasi BMI
        tinggi_m = tinggi / 100
        bmi = berat / (tinggi_m ** 2)

        # Buat data untuk prediksi
        data_to_predict = np.array([[gender, age, hypertension, heart_disease, smoking_history, bmi, hba1c, glucose]])

        # Normalisasi data
        scaled_data = scaler.transform(data_to_predict)

        # Prediksi menggunakan model
        prediction = model.predict(scaled_data)[0]
        
        hasil_prediksi = {
            "prediction_code": int(prediction),
            "result": "Risiko Tinggi" if prediction == 1 else "Risiko Rendah",
            "message": "Prediksi berhasil dihitung."
        }

        return jsonify(hasil_prediksi), 200

    except KeyError as e:
        return jsonify({"error": f"Data input tidak lengkap, field '{str(e)}' tidak ditemukan."}), 400
    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Tipe data salah: {str(e)}"}), 400
    except Exception as e:
        print(f"Terjadi kesalahan saat prediksi: {str(e)}")
        return jsonify({"error": f"Terjadi kesalahan internal di server: {str(e)}"}), 500
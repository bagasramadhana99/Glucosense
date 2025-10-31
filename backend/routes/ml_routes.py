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

        tinggi_m = tinggi / 100
        bmi = round(berat / (tinggi_m ** 2), 2)

        data_to_predict = np.array([[gender, age, hypertension, heart_disease, smoking_history, bmi, hba1c, glucose]])
        scaled_data = scaler.transform(data_to_predict)
        prediction = model.predict(scaled_data)[0]

        risk_factors = []
        if hba1c >= 6.5:
            risk_factors.append({"feature": "HbA1c", "value": f"{hba1c}%", "status": "Tinggi"})
        elif hba1c < 4.0:
            risk_factors.append({"feature": "HbA1c", "value": f"{hba1c}%", "status": "Rendah"})

        if glucose >= 140:
            risk_factors.append({"feature": "Glukosa", "value": f"{glucose} mg/dL", "status": "Tinggi"})
        elif glucose < 70:
            risk_factors.append({"feature": "Glukosa", "value": f"{glucose} mg/dL", "status": "Rendah"})

        if bmi >= 25:
            risk_factors.append({"feature": "BMI", "value": f"{bmi}", "status": "Overweight"})
        elif bmi < 18.5:
            risk_factors.append({"feature": "BMI", "value": f"{bmi}", "status": "Kurus"})

        if age >= 45:
            risk_factors.append({"feature": "Usia", "value": f"{age} tahun", "status": "Risiko usia"})

        if hypertension == 1:
            risk_factors.append({"feature": "Hipertensi", "value": "Ya", "status": "Berisiko"})
        if heart_disease == 1:
            risk_factors.append({"feature": "Penyakit Jantung", "value": "Ya", "status": "Berisiko"})

        if smoking_history == 1:
            risk_factors.append({"feature": "Riwayat Merokok", "value": "Ya", "status": "Risiko tambahan"})

        hasil_prediksi = {
            "prediction_code": int(prediction),
            "result": "Risiko Tinggi" if prediction == 1 else "Risiko Rendah",
            "message": "Prediksi berhasil dihitung.",
            "risk_factors": risk_factors,
            "probability": 100 if prediction == 1 else 0
        }

        return jsonify(hasil_prediksi), 200

    except Exception as e:
        print(f"Terjadi kesalahan saat prediksi: {str(e)}")
        return jsonify({"error": f"Kesalahan internal server: {str(e)}"}), 500
    except KeyError as e:
        return jsonify({"error": f"Data input tidak lengkap, field '{str(e)}' tidak ditemukan."}), 400
    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Tipe data salah: {str(e)}"}), 400
    except Exception as e:
        print(f"Terjadi kesalahan saat prediksi: {str(e)}")
        return jsonify({"error": f"Terjadi kesalahan internal di server: {str(e)}"}), 500
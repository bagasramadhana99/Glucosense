from flask import Blueprint, request, jsonify
from db import db_connection  # Dekorator koneksi database
from models.sensor_model import (
    update_sensor_value_model,
    update_batch_sensors_model,
    get_current_sensor_values_model
)

# Definisi blueprint
sensor_bp = Blueprint('sensor_bp', __name__)

# PATCH /api/sensors/update
@sensor_bp.route('/update', methods=['PATCH'])
@db_connection
def update_batch_sensors(cursor):
    """Update nilai glukosa dan detak jantung sekaligus."""
    data = request.json
    glucose_value = data.get('glucose')
    heart_rate_value = data.get('heart_rate')

    if glucose_value is None or heart_rate_value is None:
        return jsonify({"error": "Payload harus berisi 'glucose' dan 'heart_rate'"}), 400

    affected_rows = update_batch_sensors_model(cursor, glucose_value, heart_rate_value)
    if affected_rows < 2:
        return jsonify({"warning": f"Hanya {affected_rows} sensor yang diperbarui."}), 200

    return jsonify({"message": "Nilai kedua sensor berhasil diperbarui"}), 200

# GET /api/sensors/latest
@sensor_bp.route('/latest', methods=['GET'])
@db_connection
def get_latest_sensor_values(cursor):
    """Mengambil nilai sensor terbaru (glukosa dan detak jantung)."""
    sensor_values = get_current_sensor_values_model(cursor)
    response_data = {
        "glucose": sensor_values.get(1, 0),
        "heart_rate": sensor_values.get(2, 0)
    }
    return jsonify(response_data), 200

# PATCH /api/sensors/<int:sensor_id>
@sensor_bp.route('/<int:sensor_id>', methods=['PATCH'])
@db_connection
def update_sensor_value(cursor, sensor_id):
    """Update satu nilai sensor berdasarkan ID."""
    data = request.json
    if 'value' not in data:
        return jsonify({"error": "Payload harus berisi 'value'"}), 400

    new_value = data['value']
    affected_rows = update_sensor_value_model(cursor, sensor_id, new_value)
    if affected_rows == 0:
        return jsonify({"error": f"Sensor dengan ID {sensor_id} tidak ditemukan"}), 404

    return jsonify({"message": f"Nilai sensor {sensor_id} berhasil diperbarui"}), 200

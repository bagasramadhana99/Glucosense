from flask import Blueprint, jsonify, request
from db import get_connection
from datetime import datetime
from .auth_routes import token_required

monitoring_bp = Blueprint('monitoring_bp', __name__)

@monitoring_bp.route('/monitoring', methods=['GET'])
def get_monitoring():
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT m.id, m.user_id, u.name AS namaPasien, m.heart_rate, m.glucose_level, m.timestamp
            FROM monitoring m
            JOIN users u ON m.user_id = u.id
            ORDER BY m.timestamp DESC
        """
        cursor.execute(query)
        data = cursor.fetchall()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching all monitoring data: {e}")
        return jsonify({"error": "Gagal mengambil data"}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

# Tambahan alias agar /monitoring juga bisa POST
@monitoring_bp.route('/monitoring', methods=['POST'])
def create_monitoring_alias():
    return save_monitoring()

@monitoring_bp.route('/monitoring/save', methods=['POST'])
def save_monitoring():
    conn = None
    cursor = None
    try:
        data = request.json
        name = data.get('name')
        glucose_level = data.get('glucose_level')
        heart_rate = data.get('heart_rate')

        if not all([name, glucose_level, heart_rate]):
            return jsonify({"error": "Data tidak lengkap"}), 400

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM users WHERE name = %s", (name,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "User tidak ditemukan"}), 404

        user_id = user[0]
        #timestamp = datetime.utcnow().isoformat() + 'Z'
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute("""
            INSERT INTO monitoring (user_id, glucose_level, heart_rate, timestamp)
            VALUES (%s, %s, %s, %s)
        """, (user_id, glucose_level, heart_rate, timestamp))

        conn.commit()
        return jsonify({"message": "Hasil pemeriksaan berhasil disimpan"}), 201
    except Exception as e:
        print(f"Error saving monitoring data: {e}")
        return jsonify({"error": "Gagal menyimpan data"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

@monitoring_bp.route('/monitoring/me', methods=['GET'])
@token_required
def get_my_monitoring(current_user_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT id, user_id, heart_rate, glucose_level, timestamp
            FROM monitoring
            WHERE user_id = %s
            ORDER BY timestamp DESC
        """
        cursor.execute(query, (current_user_id,))
        data = cursor.fetchall()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching personal monitoring data: {e}")
        return jsonify({"error": "Gagal mengambil riwayat pribadi"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

@monitoring_bp.route('/monitoring/<int:monitoring_id>', methods=['DELETE'])
def delete_monitoring(monitoring_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM monitoring WHERE id = %s", (monitoring_id,))
        conn.commit()

        if cursor.rowcount > 0:
            return jsonify({"message": "Data pemeriksaan berhasil dihapus"}), 200
        else:
            return jsonify({"error": "Data pemeriksaan tidak ditemukan"}), 404
    except Exception as e:
        print(f"Error deleting monitoring data: {e}")
        return jsonify({"error": "Gagal menghapus data"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

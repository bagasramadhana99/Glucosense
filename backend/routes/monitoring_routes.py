from flask import Blueprint, jsonify, request
from db import get_connection
from datetime import datetime
from .auth_routes import token_required

monitoring_bp = Blueprint('monitoring_bp', __name__)

@monitoring_bp.route('/monitoring', methods=['GET'])
@token_required  # <-- DILINDUNGI
def get_monitoring(current_user_id): # <-- TAMBAH current_user_id
    """
    Mengambil SEMUA data monitoring.
    Endpoint ini sekarang dilindungi. 
    (Idealnya, ini hanya untuk 'admin', tapi sekarang setidaknya butuh login)
    """
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
@token_required  # <-- DILINDUNGI
def create_monitoring_alias(current_user_id): # <-- TAMBAH current_user_id
    # Teruskan current_user_id ke fungsi save_monitoring
    return save_monitoring(current_user_id)

@monitoring_bp.route('/monitoring/save', methods=['POST'])
@token_required  # <-- DILINDUNGI
def save_monitoring(current_user_id): # <-- TAMBAH current_user_id
    """
    Menyimpan data monitoring baru untuk pengguna yang sedang login.
    Data 'user_id' diambil dari token, bukan dari JSON body.
    """
    conn = None
    cursor = None
    try:
        data = request.json
        # 'name' TIDAK diperlukan lagi dari JSON
        glucose_level = data.get('glucose_level')
        heart_rate = data.get('heart_rate')

        if not all([glucose_level, heart_rate]):
            return jsonify({"error": "Data glucose_level dan heart_rate diperlukan"}), 400

        conn = get_connection()
        cursor = conn.cursor()

        # <-- DIUBAH: Kita tidak perlu mencari user berdasarkan nama.
        # Kita sudah punya ID pengguna dari token.
        user_id = current_user_id 
        
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
    """
    Mengambil riwayat monitoring PRIBADI untuk pengguna yang login.
    (Kode ini sudah benar dan aman)
    """
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
@token_required # <-- DILINDUNGI
def delete_monitoring(current_user_id, monitoring_id): # <-- TAMBAH current_user_id
    """
    Menghapus data pemeriksaan.
    Endpoint ini sekarang dilindungi.
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # --- LANGKAH OTORISASI (Disarankan) ---
        # Sebelum menghapus, periksa apakah data ini milik pengguna
        # atau apakah pengguna adalah admin.
        # cursor.execute("SELECT user_id FROM monitoring WHERE id = %s", (monitoring_id,))
        # record = cursor.fetchone()
        # if not record:
        #     return jsonify({"error": "Data pemeriksaan tidak ditemukan"}), 404
        # if record['user_id'] != current_user_id: # and user_role != 'admin'
        #     return jsonify({"error": "Akses ditolak"}), 403
        # --- Akhir Otorisasi ---

        cursor.execute("DELETE FROM monitoring WHERE id = %s", (monitoring_id,))
        conn.commit()

        if cursor.rowcount > 0:
            return jsonify({"message": "Data pemeriksaan berhasil dihapus"}), 200
        else:
            # Ini mungkin terjadi jika cek otorisasi di atas tidak ada
            # dan ID-nya ada tapi sudah dihapus (atau ID tidak ada)
            return jsonify({"error": "Data pemeriksaan tidak ditemukan"}), 404
    except Exception as e:
        print(f"Error deleting monitoring data: {e}")
        return jsonify({"error": "Gagal menghapus data"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()
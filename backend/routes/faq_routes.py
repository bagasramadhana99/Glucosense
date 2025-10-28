from flask import Blueprint, jsonify, request
from db import get_connection
from models.faq_model import (
    get_all_faqs_model,
    add_faq_model,
    update_faq_model,
    delete_faq_model
)

faq_bp = Blueprint('faq_bp', __name__)

# READ: Mengambil semua FAQ (digunakan oleh admin dan pasien)
@faq_bp.route('/faq', methods=['GET'])
def get_faqs():
    conn = None
    try:
        conn = get_connection()
        faqs = get_all_faqs_model(conn)
        return jsonify(faqs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

# CREATE: Menambahkan FAQ baru (hanya untuk admin)
@faq_bp.route('/faq', methods=['POST'])
def add_faq():
    conn = None
    try:
        data = request.json
        if not data or 'judul' not in data or 'deskripsi' not in data:
            return jsonify({"error": "Data tidak lengkap"}), 400
        
        conn = get_connection()
        new_faq_id = add_faq_model(conn, data)
        return jsonify({"message": "FAQ berhasil ditambahkan", "id": new_faq_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

# UPDATE: Memperbarui FAQ yang ada (hanya untuk admin)
@faq_bp.route('/faq/<int:faq_id>', methods=['PUT'])
def update_faq(faq_id):
    conn = None
    try:
        data = request.json
        if not data or 'judul' not in data or 'deskripsi' not in data:
            return jsonify({"error": "Data tidak lengkap"}), 400

        conn = get_connection()
        affected_rows = update_faq_model(conn, faq_id, data)
        if affected_rows == 0:
            return jsonify({"error": "FAQ tidak ditemukan"}), 404
        return jsonify({"message": "FAQ berhasil diperbarui"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

# DELETE: Menghapus FAQ (hanya untuk admin)
@faq_bp.route('/faq/<int:faq_id>', methods=['DELETE'])
def delete_faq(faq_id):
    conn = None
    try:
        conn = get_connection()
        affected_rows = delete_faq_model(conn, faq_id)
        if affected_rows == 0:
            return jsonify({"error": "FAQ tidak ditemukan"}), 404
        return jsonify({"message": "FAQ berhasil dihapus"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()
import jwt
import datetime
from functools import wraps
from flask import Blueprint, request, jsonify
from db import get_connection
from models.user_model import get_user_by_email_for_login_model

auth_bp = Blueprint('auth_bp', __name__)

# PENTING: Ganti ini dengan SECRET_KEY dari environment di production
SECRET_KEY = "ini-adalah-kunci-rahasia-saya-yang-super-aman-dan-panjang"

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint untuk login user/pasien. Mengembalikan JWT jika sukses."""
    data = request.json
    email = data.get('email')
    password_candidate = data.get('password')

    if not email or not password_candidate:
        return jsonify({"message": "Email dan password diperlukan"}), 400

    conn = None
    try:
        conn = get_connection()
        user = get_user_by_email_for_login_model(conn, email)

        # Debugging
        print("=== DEBUG LOGIN ===")
        print("Email:", email)
        print("Password Input:", password_candidate)
        print("User found:", bool(user))

        if user:
            print("Password Stored:", user['password'])
            valid = (user['password'] == password_candidate)
            print("Password Valid:", valid)
        else:
            print("No user found")

        # Verifikasi user dan password (tanpa hashing)
        if not user or user['password'] != password_candidate:
            return jsonify({"message": "Email atau password salah"}), 401

        # Buat token JWT (kadaluarsa dalam 7 hari)
        token_payload = {
            'user_id': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }
        token = jwt.encode(token_payload, SECRET_KEY, algorithm="HS256")

        user_info = {
            "id": user['id'],
            "name": user['name'],
            "email": user['email'],
            "role": user['role']
        }

        return jsonify({
            "message": "Login berhasil",
            "token": token,
            "user": user_info
        }), 200

    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"message": "Terjadi kesalahan internal saat login"}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()


# ================================
# Token Required Decorator
# ================================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Format token tidak valid!'}), 401

        if not token:
            return jsonify({'message': 'Token tidak ditemukan!'}), 401

        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user_id = decoded['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token sudah kedaluwarsa!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token tidak valid!'}), 401

        return f(current_user_id, *args, **kwargs)

    return decorated

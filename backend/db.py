import mysql.connector
from functools import wraps
from flask import jsonify

# 1. Impor disederhanakan, kita hanya butuh 'Error' dari mysql.connector
from mysql.connector import Error

# Kredensial database server Anda
DB_HOST = '103.59.160.21'
DB_USER = 'glucosen_user'
DB_PASSWORD = 'FSj397hEUFJTaFG'
DB_NAME = 'glucosen_data'

#DB_HOST = '145.79.15.182'
#DB_USER = 'glucosense'
#DB_PASSWORD = 'pendeteksiglukosa100mmhg'
#DB_NAME = 'glucosense'

def get_connection():
    """Fungsi dasar untuk membuat koneksi ke database."""
    conn = None
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
    except Error as e:
        print(f"Error saat menghubungkan ke database MySQL: {e}")
    return conn

def db_connection(f):
    """
    Decorator untuk menangani koneksi database secara otomatis.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        conn = get_connection()
        if conn is None or not conn.is_connected():
            return jsonify({"message": "Koneksi database gagal"}), 503
        
        cursor = conn.cursor(dictionary=True)
        try:
            result = f(cursor, *args, **kwargs)
            conn.commit()
            return result
        # 2. Blok 'except' diubah dari MySQLError menjadi Error
        except Error as e:
            conn.rollback()
            print(f"Database error: {e}")
            # Logika untuk memeriksa e.errno tetap berfungsi dengan kelas Error
            if hasattr(e, 'errno'):
                if e.errno == 1062: # Duplikat entri
                    return jsonify({"message": "Data dengan nilai unik yang sama sudah ada.", "error": str(e)}), 409
                if e.errno == 1451: # Foreign key constraint
                    return jsonify({"message": "Tidak bisa menghapus/memperbarui data karena masih digunakan.", "error": str(e)}), 409
            return jsonify({"message": "Terjadi kesalahan pada database.", "error": str(e)}), 500
        except Exception as e:
            conn.rollback()
            print(f"An unexpected error occurred: {e}")
            return jsonify({"message": "Terjadi kesalahan tak terduga pada server.", "error": str(e)}), 500
        finally:
            cursor.close()
            conn.close()
    return decorated_function
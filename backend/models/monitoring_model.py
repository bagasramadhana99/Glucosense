from datetime import datetime

def add_monitoring_record_model(cursor, user_id, glucose, heart_rate):
    """Menyimpan sebuah catatan baru ke tabel monitoring."""
    query = """
        INSERT INTO monitoring (user_id, glucose_level, heart_rate, timestamp) 
        VALUES (%s, %s, %s, %s)
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(query, (user_id, glucose, heart_rate, timestamp))
    return cursor.lastrowid

def get_all_monitoring_model(cursor):
    """Mengambil semua riwayat monitoring untuk ditampilkan di tabel admin."""
    query = """
        SELECT m.id, u.name AS namaPasien, m.glucose_level, m.heart_rate, m.timestamp 
        FROM monitoring m
        JOIN users u ON m.user_id = u.id
        ORDER BY m.timestamp DESC
    """
    cursor.execute(query)
    return cursor.fetchall()

def delete_monitoring_model(cursor, monitoring_id):
    """Menghapus sebuah catatan monitoring berdasarkan ID-nya."""
    query = "DELETE FROM monitoring WHERE id = %s"
    cursor.execute(query, (monitoring_id,))
    return cursor.rowcount
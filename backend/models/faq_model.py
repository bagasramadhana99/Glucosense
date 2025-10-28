def get_all_faqs_model(conn):
    """Mengambil semua data dari tabel faq."""
    cursor = conn.cursor(dictionary=True)
    query = "SELECT * FROM faq ORDER BY id DESC"
    cursor.execute(query)
    faqs = cursor.fetchall()
    cursor.close()
    return faqs

def add_faq_model(conn, data):
    """Menambahkan data baru ke tabel faq."""
    cursor = conn.cursor()
    query = "INSERT INTO faq (judul, deskripsi) VALUES (%s, %s)"
    cursor.execute(query, (data['judul'], data['deskripsi']))
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    return new_id

def update_faq_model(conn, faq_id, data):
    """Memperbarui data di tabel faq berdasarkan ID."""
    cursor = conn.cursor()
    query = "UPDATE faq SET judul = %s, deskripsi = %s WHERE id = %s"
    cursor.execute(query, (data['judul'], data['deskripsi'], faq_id))
    conn.commit()
    affected_rows = cursor.rowcount
    cursor.close()
    return affected_rows

def delete_faq_model(conn, faq_id):
    """Menghapus data dari tabel faq berdasarkan ID."""
    cursor = conn.cursor()
    query = "DELETE FROM faq WHERE id = %s"
    cursor.execute(query, (faq_id,))
    conn.commit()
    affected_rows = cursor.rowcount
    cursor.close()
    return affected_rows
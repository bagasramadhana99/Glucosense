from mysql.connector import Error  # Tetap dipakai untuk menangani error database

def get_all_users_model(conn):
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, age, email, gender, address, role FROM users")
    users = cursor.fetchall()
    cursor.close()
    return users

def get_user_by_id_model(conn, user_id):
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, age, email, gender, address, role FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    return user

def get_user_by_email_for_login_model(conn, email):
    """Mengambil user berdasarkan email, termasuk password untuk verifikasi login."""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, email, role, password FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    return user

def add_user_model(conn, user_data):
    cursor = conn.cursor()
    # Simpan password secara langsung (TIDAK DIHASH)
    sql = """
        INSERT INTO users (name, age, email, gender, address, password, role)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    try:
        cursor.execute(sql, (
            user_data.get('name'),
            user_data.get('age'),
            user_data.get('email'),
            user_data.get('gender'),
            user_data.get('address'),
            user_data.get('password'),  # langsung disimpan
            user_data.get('role')
        ))
        conn.commit()
        return cursor.lastrowid
    except Error as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()

def update_user_model(conn, user_id, user_data):
    cursor = conn.cursor()
    
    set_clauses = []
    params = []

    if 'name' in user_data:
        set_clauses.append("name = %s")
        params.append(user_data['name'])
    if 'age' in user_data:
        set_clauses.append("age = %s")
        params.append(user_data['age'])
    if 'email' in user_data:
        set_clauses.append("email = %s")
        params.append(user_data['email'])
    if 'gender' in user_data:
        set_clauses.append("gender = %s")
        params.append(user_data['gender'])
    if 'address' in user_data:
        set_clauses.append("address = %s")
        params.append(user_data['address'])
    if 'role' in user_data:
        set_clauses.append("role = %s")
        params.append(user_data['role'])
    if 'password' in user_data and user_data['password']:
        # TANPA hashing
        set_clauses.append("password = %s")
        params.append(user_data['password'])

    if not set_clauses:
        return 0  # Tidak ada perubahan

    sql = "UPDATE users SET " + ", ".join(set_clauses) + " WHERE id = %s"
    params.append(user_id)

    try:
        cursor.execute(sql, tuple(params))
        conn.commit()
        return cursor.rowcount
    except Error as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()

def delete_user_model(conn, user_id):
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        return cursor.rowcount
    except Error as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()

def get_patients_model(conn):
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, email, age FROM users WHERE role = 'patient'")
    patients = cursor.fetchall()
    cursor.close()
    return patients

# File: models/user_model.py

def get_patients_model(conn):
    cursor = conn.cursor(dictionary=True)
    # --- PERBAIKAN DI SINI ---
    # Tambahkan kolom 'created_at' ke dalam query SELECT
    query = """
        SELECT id, name, email, age, created_at 
        FROM users 
        WHERE role = 'patient'
    """
    cursor.execute(query)
    patients = cursor.fetchall()
    cursor.close()
    return patients
# Semua fungsi sekarang menerima 'cursor' sebagai argumen pertama.
# Tidak perlu lagi membuat atau menutup cursor di dalam fungsi-fungsi ini.

def update_sensor_value_model(cursor, sensor_id, value):
    """Memperbarui satu nilai sensor berdasarkan ID-nya."""
    query = "UPDATE sensors SET sensor_value = %s WHERE sensor_id = %s"
    cursor.execute(query, (value, sensor_id))
    return cursor.rowcount

def update_batch_sensors_model(cursor, glucose_val, heart_rate_val):
    """Memperbarui nilai glukosa dan detak jantung dalam satu query."""
    query = """
        UPDATE sensors
        SET sensor_value = CASE sensor_id
            WHEN 1 THEN %s
            WHEN 2 THEN %s
        END
        WHERE sensor_id IN (1, 2)
    """
    cursor.execute(query, (glucose_val, heart_rate_val))
    return cursor.rowcount

def get_current_sensor_values_model(cursor):
    """Mengambil nilai terakhir dari kedua sensor."""
    query = "SELECT sensor_id, sensor_value FROM sensors WHERE sensor_id IN (1, 2)"
    cursor.execute(query)
    results = cursor.fetchall()
    
    # Mengubah hasil query menjadi format dictionary: {1: 120.5, 2: 85.0}
    sensor_values = {row['sensor_id']: row['sensor_value'] for row in results}
    return sensor_values

def get_current_sensor_values_model(cursor):
    """Mengambil nilai terakhir dari kedua sensor."""
    query = "SELECT sensor_id, sensor_value FROM sensors WHERE sensor_id IN (1, 2)"
    cursor.execute(query)
    results = cursor.fetchall()
    
    # Mengubah hasil query menjadi format dictionary: {1: 120.5, 2: 85.0}
    sensor_values = {row['sensor_id']: row['sensor_value'] for row in results}
    return sensor_values
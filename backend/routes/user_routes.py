from flask import Blueprint, request, jsonify
from db import get_connection
from models.user_model import (
    get_all_users_model,
    get_user_by_id_model,
    get_user_by_email_for_login_model,
    add_user_model,
    update_user_model,
    delete_user_model,
    get_patients_model
)
from mysql.connector import Error as MySQLError

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/users', methods=['GET'])
def get_users():
    conn = None
    try:
        conn = get_connection()
        if conn is None:
            return jsonify({"message": "Database connection failed"}), 503
        
        users = get_all_users_model(conn)
        return jsonify(users)
    except MySQLError as e:
        print(f"Database error getting users: {e}")
        return jsonify({"message": "Could not retrieve users", "error": str(e)}), 500
    except Exception as e:
        print(f"Unexpected error getting users: {e}")
        return jsonify({"message": "An unexpected error occurred", "error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = None
    try:
        conn = get_connection()
        if conn is None:
            return jsonify({"message": "Database connection failed"}), 503
            
        user = get_user_by_id_model(conn, user_id)
        if user:
            return jsonify(user)
        else:
            return jsonify({"message": "User not found"}), 404
    except MySQLError as e:
        print(f"Database error getting user {user_id}: {e}")
        return jsonify({"message": "Could not retrieve user", "error": str(e)}), 500
    except Exception as e:
        print(f"Unexpected error getting user {user_id}: {e}")
        return jsonify({"message": "An unexpected error occurred", "error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@user_bp.route('/users', methods=['POST'])
def create_user():
    data = request.json
    conn = None

    if not data:
        return jsonify({"message": "Request body is empty"}), 400

    required_fields = ['name', 'email', 'password', 'role']
    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    if missing_fields:
        return jsonify({"message": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    try:
        conn = get_connection()
        if conn is None:
            return jsonify({"message": "Database connection failed"}), 503
            
        existing_user = get_user_by_email_for_login_model(conn, data['email'])
        if existing_user:
            return jsonify({"message": "Email already exists"}), 409

        new_user_id = add_user_model(conn, data)
        return jsonify({"message": "User added successfully", "id": new_user_id}), 201
    except MySQLError as e:
        if e.errno == 1062:
             return jsonify({"message": "Email already exists (database constraint)", "error": str(e)}), 409
        print(f"Database error creating user: {e}")
        return jsonify({"message": "Failed to add user", "error": str(e)}), 500
    except Exception as e:
        print(f"Unexpected error creating user: {e}")
        return jsonify({"message": "An unexpected error occurred", "error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    conn = None

    if not data:
        return jsonify({"message": "Request body is empty or no fields to update"}), 400

    try:
        conn = get_connection()
        if conn is None:
            return jsonify({"message": "Database connection failed"}), 503

        user_to_update = get_user_by_id_model(conn, user_id)
        if not user_to_update:
            return jsonify({"message": "User not found"}), 404
        
        if 'email' in data and data['email'] != user_to_update['email']:
            existing_user_with_new_email = get_user_by_email_for_login_model(conn, data['email'])
            if existing_user_with_new_email:
                return jsonify({"message": "New email is already in use by another account"}), 409

        affected_rows = update_user_model(conn, user_id, data)
        if affected_rows > 0:
            return jsonify({"message": "User updated successfully"})
        else:
            return jsonify({"message": "User data was not changed or no valid fields provided"}), 200
    except MySQLError as e:
        if e.errno == 1062:
             return jsonify({"message": "Email already exists (database constraint)", "error": str(e)}), 409
        print(f"Database error updating user {user_id}: {e}")
        return jsonify({"message": "Failed to update user", "error": str(e)}), 500
    except Exception as e:
        print(f"Unexpected error updating user {user_id}: {e}")
        return jsonify({"message": "An unexpected error occurred", "error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    conn = None
    try:
        conn = get_connection()
        if conn is None:
            return jsonify({"message": "Database connection failed"}), 503
        
        user_to_delete = get_user_by_id_model(conn, user_id)
        if not user_to_delete:
            return jsonify({"message": "User not found"}), 404
            
        affected_rows = delete_user_model(conn, user_id)
        if affected_rows > 0:
            return jsonify({"message": "User deleted successfully"})
        else:
            return jsonify({"message": "User not found or something went wrong during deletion"}), 404

    except MySQLError as e:
        if e.errno == 1451:
            return jsonify({
                "message": "Cannot delete user because their data is being used in other parts of the application.",
                "error": "Foreign key constraint violation"
            }), 409
        print(f"Database error deleting user {user_id}: {e}")
        return jsonify({"message": "Failed to delete user due to a database error", "error": str(e)}), 500
    except Exception as e:
        print(f"Unexpected error deleting user {user_id}: {e}")
        return jsonify({"message": "An unexpected error occurred", "error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@user_bp.route('/patients', methods=['GET'])
def get_patients():
    conn = None
    try:
        conn = get_connection()
        if conn is None:
            return jsonify({"message": "Database connection failed"}), 503
            
        patients = get_patients_model(conn)
        return jsonify(patients)
    except MySQLError as e:
        print(f"Database error getting patients: {e}")
        return jsonify({"message": "Could not retrieve patients", "error": str(e)}), 500
    except Exception as e:
        print(f"Unexpected error getting patients: {e}")
        return jsonify({"message": "An unexpected error occurred", "error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

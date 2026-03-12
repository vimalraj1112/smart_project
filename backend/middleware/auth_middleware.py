from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models.user_model import UserModel

def jwt_required_middleware(f):
    """Decorator that verifies JWT and injects current user."""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception:
            return jsonify({'error': 'Missing or invalid token'}), 401
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    """Decorator that enforces admin role."""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception:
            return jsonify({'error': 'Missing or invalid token'}), 401
        user = UserModel.query.get(int(get_jwt_identity()))
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated

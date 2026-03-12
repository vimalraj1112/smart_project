from flask import jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity
from models import db
from models.user_model import UserModel

class AuthController:

    @staticmethod
    def register():
        """Register a new user. Role always defaults to 'user'."""
        data = request.get_json() or {}
        name     = data.get('name', '').strip()
        email    = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not name or not email or not password:
            return jsonify({'error': 'Name, email and password are required'}), 400

        if UserModel.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 409

        user = UserModel(name=name, email=email, role='user')   # ← always 'user'
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        token = create_access_token(identity=str(user.id))
        return jsonify({'message': 'Registered successfully', 'token': token,
                        'user': user.to_dict()}), 201

    @staticmethod
    def login():
        """Login and return JWT token."""
        data     = request.get_json() or {}
        email    = data.get('email', '').strip().lower()
        password = data.get('password', '')

        user = UserModel.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401

        token = create_access_token(identity=str(user.id))
        return jsonify({'token': token, 'user': user.to_dict()}), 200

    @staticmethod
    def me():
        """Return current authenticated user."""
        user_id = int(get_jwt_identity())
        user = UserModel.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'user': user.to_dict()}), 200

    @staticmethod
    def list_users():
        """Return all users (used for member assignment dropdowns)."""
        users = UserModel.query.all()
        return jsonify({'users': [u.to_dict() for u in users]}), 200

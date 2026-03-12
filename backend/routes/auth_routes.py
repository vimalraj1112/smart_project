from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.auth_controller import AuthController

auth_bp = Blueprint('auth', __name__)

auth_bp.route('/register', methods=['POST'])(AuthController.register)
auth_bp.route('/login',    methods=['POST'])(AuthController.login)

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    return AuthController.me()

@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    return AuthController.list_users()

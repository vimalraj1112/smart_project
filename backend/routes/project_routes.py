from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.project_controller import ProjectController

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/', methods=['GET'])
@jwt_required()
def get_all():
    return ProjectController.get_all()

@projects_bp.route('/', methods=['POST'])
@jwt_required()
def create():
    return ProjectController.create()

@projects_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_one(project_id):
    return ProjectController.get_one(project_id)

@projects_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update(project_id):
    return ProjectController.update(project_id)

@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete(project_id):
    return ProjectController.delete(project_id)

@projects_bp.route('/<int:project_id>/members', methods=['POST'])
@jwt_required()
def add_member(project_id):
    return ProjectController.add_member(project_id)

@projects_bp.route('/<int:project_id>/members/<int:user_id>', methods=['DELETE'])
@jwt_required()
def remove_member(project_id, user_id):
    return ProjectController.remove_member(project_id, user_id)

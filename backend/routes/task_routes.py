from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.task_controller import TaskController

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/', methods=['GET'])
@jwt_required()
def get_all():
    return TaskController.get_all()

@tasks_bp.route('/', methods=['POST'])
@jwt_required()
def create():
    return TaskController.create()

@tasks_bp.route('/<int:task_id>', methods=['GET'])
@jwt_required()
def get_one(task_id):
    return TaskController.get_one(task_id)

@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required()
def update(task_id):
    return TaskController.update(task_id)

@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete(task_id):
    return TaskController.delete(task_id)

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date
from models import db
from models.task import Task
from models.project import Project
from models.user import User

tasks_bp = Blueprint('tasks', __name__)

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)


@tasks_bp.route('/', methods=['GET'])
@jwt_required()
def get_tasks():
    user = get_current_user()
    project_id = request.args.get('project_id', type=int)

    if user.role == 'admin':
        query = Task.query
        if project_id:
            query = query.filter_by(project_id=project_id)
        tasks = query.all()
    else:
        if project_id:
            tasks = Task.query.filter_by(project_id=project_id, assigned_user_id=user.id).all()
        else:
            tasks = Task.query.filter_by(assigned_user_id=user.id).all()

    return jsonify({'tasks': [t.to_dict() for t in tasks]}), 200


@tasks_bp.route('/', methods=['POST'])
@jwt_required()
def create_task():
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json()
    task_name = data.get('task_name', '').strip()
    project_id = data.get('project_id')

    if not task_name or not project_id:
        return jsonify({'error': 'task_name and project_id are required'}), 400

    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    deadline = None
    if data.get('deadline'):
        try:
            deadline = date.fromisoformat(data['deadline'])
        except ValueError:
            pass

    task = Task(
        task_name=task_name,
        description=data.get('description', ''),
        project_id=project_id,
        assigned_user_id=data.get('assigned_user_id'),
        status=data.get('status', 'todo'),
        priority=data.get('priority', 'medium'),
        deadline=deadline
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({'message': 'Task created', 'task': task.to_dict()}), 201


@tasks_bp.route('/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    return jsonify({'task': task.to_dict()}), 200


@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    user = get_current_user()
    task = Task.query.get_or_404(task_id)

    # Allow admin full edit; regular users can only update status
    data = request.get_json()

    if user.role == 'admin':
        if data.get('task_name'):
            task.task_name = data['task_name'].strip()
        if 'description' in data:
            task.description = data['description']
        if 'assigned_user_id' in data:
            task.assigned_user_id = data['assigned_user_id']
        if 'priority' in data:
            task.priority = data['priority']
        if data.get('deadline'):
            try:
                task.deadline = date.fromisoformat(data['deadline'])
            except ValueError:
                pass
        elif 'deadline' in data and not data['deadline']:
            task.deadline = None

    # Both roles can update status
    if 'status' in data and data['status'] in ['todo', 'in_progress', 'completed']:
        task.status = data['status']

    db.session.commit()
    return jsonify({'message': 'Task updated', 'task': task.to_dict()}), 200


@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'}), 200

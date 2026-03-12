from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from datetime import date
from models import db
from models.user_model import UserModel
from models.task_model import TaskModel
from models.project_model import ProjectModel

def _current_user():
    return UserModel.query.get(int(get_jwt_identity()))

class TaskController:

    @staticmethod
    def get_all():
        user = _current_user()
        project_id = request.args.get('project_id', type=int)

        if user.role == 'admin':
            q = TaskModel.query
            if project_id:
                q = q.filter_by(project_id=project_id)
            tasks = q.all()
        else:
            q = TaskModel.query.filter_by(assigned_user_id=user.id)
            if project_id:
                q = q.filter_by(project_id=project_id)
            tasks = q.all()

        return jsonify({'tasks': [t.to_dict() for t in tasks]}), 200

    @staticmethod
    def create():
        user = _current_user()
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        data = request.get_json() or {}
        task_name  = data.get('task_name', '').strip()
        project_id = data.get('project_id')

        if not task_name or not project_id:
            return jsonify({'error': 'task_name and project_id are required'}), 400

        if not ProjectModel.query.get(project_id):
            return jsonify({'error': 'Project not found'}), 404

        deadline = None
        if data.get('deadline'):
            try:
                deadline = date.fromisoformat(data['deadline'])
            except ValueError:
                pass

        task = TaskModel(
            task_name=task_name,
            description=data.get('description', ''),
            project_id=project_id,
            assigned_user_id=data.get('assigned_user_id') or None,
            status=data.get('status', 'todo'),
            priority=data.get('priority', 'medium'),
            deadline=deadline,
        )
        db.session.add(task)
        db.session.commit()
        return jsonify({'message': 'Task created', 'task': task.to_dict()}), 201

    @staticmethod
    def get_one(task_id):
        task = TaskModel.query.get_or_404(task_id)
        return jsonify({'task': task.to_dict()}), 200

    @staticmethod
    def update(task_id):
        user = _current_user()
        task = TaskModel.query.get_or_404(task_id)
        data = request.get_json() or {}

        if user.role == 'admin':
            if data.get('task_name'):
                task.task_name = data['task_name'].strip()
            if 'description' in data:
                task.description = data['description']
            if 'assigned_user_id' in data:
                task.assigned_user_id = data['assigned_user_id'] or None
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
        if 'status' in data and data['status'] in ('todo', 'in_progress', 'completed'):
            task.status = data['status']

        db.session.commit()
        return jsonify({'message': 'Task updated', 'task': task.to_dict()}), 200

    @staticmethod
    def delete(task_id):
        user = _current_user()
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        task = TaskModel.query.get_or_404(task_id)
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted'}), 200

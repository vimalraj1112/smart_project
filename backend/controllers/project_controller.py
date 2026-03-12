from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from datetime import date
from models import db
from models.user_model import UserModel
from models.project_model import ProjectModel

def _current_user():
    return UserModel.query.get(int(get_jwt_identity()))

class ProjectController:

    @staticmethod
    def get_all():
        user = _current_user()
        projects = ProjectModel.query.all() if user.role == 'admin' else user.projects
        return jsonify({'projects': [p.to_dict() for p in projects]}), 200

    @staticmethod
    def create():
        user = _current_user()
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        data = request.get_json() or {}
        name = data.get('project_name', '').strip()
        if not name:
            return jsonify({'error': 'project_name is required'}), 400

        deadline = None
        if data.get('deadline'):
            try:
                deadline = date.fromisoformat(data['deadline'])
            except ValueError:
                pass

        project = ProjectModel(
            project_name=name,
            description=data.get('description', ''),
            created_by=user.id,
            deadline=deadline,
        )
        project.members.append(user)
        db.session.add(project)
        db.session.commit()
        return jsonify({'message': 'Project created', 'project': project.to_dict(include_members=True)}), 201

    @staticmethod
    def get_one(project_id):
        project = ProjectModel.query.get_or_404(project_id)
        return jsonify({'project': project.to_dict(include_members=True)}), 200

    @staticmethod
    def update(project_id):
        user = _current_user()
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        project = ProjectModel.query.get_or_404(project_id)
        data = request.get_json() or {}

        if data.get('project_name'):
            project.project_name = data['project_name'].strip()
        if 'description' in data:
            project.description = data['description']
        if data.get('deadline'):
            try:
                project.deadline = date.fromisoformat(data['deadline'])
            except ValueError:
                pass
        elif 'deadline' in data and not data['deadline']:
            project.deadline = None

        db.session.commit()
        return jsonify({'message': 'Project updated', 'project': project.to_dict(include_members=True)}), 200

    @staticmethod
    def delete(project_id):
        user = _current_user()
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        project = ProjectModel.query.get_or_404(project_id)
        db.session.delete(project)
        db.session.commit()
        return jsonify({'message': 'Project deleted'}), 200

    @staticmethod
    def add_member(project_id):
        user = _current_user()
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        project = ProjectModel.query.get_or_404(project_id)
        data = request.get_json() or {}
        member_id = data.get('user_id')
        if not member_id:
            return jsonify({'error': 'user_id is required'}), 400

        member = UserModel.query.get(member_id)
        if not member:
            return jsonify({'error': 'User not found'}), 404

        if member not in project.members:
            project.members.append(member)
            db.session.commit()
        return jsonify({'project': project.to_dict(include_members=True)}), 200

    @staticmethod
    def remove_member(project_id, user_id):
        user = _current_user()
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        project = ProjectModel.query.get_or_404(project_id)
        member = UserModel.query.get(user_id)
        if member and member in project.members:
            project.members.remove(member)
            db.session.commit()
        return jsonify({'project': project.to_dict(include_members=True)}), 200

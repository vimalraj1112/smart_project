from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.project import Project, project_members
from models.user import User

projects_bp = Blueprint('projects', __name__)

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)


@projects_bp.route('/', methods=['GET'])
@jwt_required()
def get_projects():
    user = get_current_user()
    if user.role == 'admin':
        projects = Project.query.all()
    else:
        projects = user.projects
    return jsonify({'projects': [p.to_dict() for p in projects]}), 200


@projects_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json()
    project_name = data.get('project_name', '').strip()
    if not project_name:
        return jsonify({'error': 'Project name is required'}), 400

    from datetime import date
    deadline = None
    if data.get('deadline'):
        try:
            deadline = date.fromisoformat(data['deadline'])
        except ValueError:
            pass

    project = Project(
        project_name=project_name,
        description=data.get('description', ''),
        created_by=user.id,
        deadline=deadline
    )
    project.members.append(user)  # Creator is a member
    db.session.add(project)
    db.session.commit()
    return jsonify({'message': 'Project created', 'project': project.to_dict(include_members=True)}), 201


@projects_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    project = Project.query.get_or_404(project_id)
    return jsonify({'project': project.to_dict(include_members=True)}), 200


@projects_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    project = Project.query.get_or_404(project_id)
    data = request.get_json()

    if data.get('project_name'):
        project.project_name = data['project_name'].strip()
    if 'description' in data:
        project.description = data['description']
    if data.get('deadline'):
        from datetime import date
        try:
            project.deadline = date.fromisoformat(data['deadline'])
        except ValueError:
            pass
    elif 'deadline' in data and not data['deadline']:
        project.deadline = None

    db.session.commit()
    return jsonify({'message': 'Project updated', 'project': project.to_dict(include_members=True)}), 200


@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': 'Project deleted'}), 200


@projects_bp.route('/<int:project_id>/members', methods=['POST'])
@jwt_required()
def add_member(project_id):
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    project = Project.query.get_or_404(project_id)
    data = request.get_json()
    member_id = data.get('user_id')
    if not member_id:
        return jsonify({'error': 'user_id is required'}), 400

    member = User.query.get(member_id)
    if not member:
        return jsonify({'error': 'User not found'}), 404

    if member not in project.members:
        project.members.append(member)
        db.session.commit()

    return jsonify({'message': f'{member.name} added to project', 'project': project.to_dict(include_members=True)}), 200


@projects_bp.route('/<int:project_id>/members/<int:user_id>', methods=['DELETE'])
@jwt_required()
def remove_member(project_id, user_id):
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    project = Project.query.get_or_404(project_id)
    member = User.query.get(user_id)
    if member and member in project.members:
        project.members.remove(member)
        db.session.commit()

    return jsonify({'message': 'Member removed', 'project': project.to_dict(include_members=True)}), 200

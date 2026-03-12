from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.project import Project
from models.task import Task
from models.comment_attachment import Comment
from models import db
from sqlalchemy import func

analytics_bp = Blueprint('analytics', __name__)

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)


@analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    user = get_current_user()

    if user.role == 'admin':
        total_projects = Project.query.count()
        total_tasks = Task.query.count()
        completed_tasks = Task.query.filter_by(status='completed').count()
        in_progress_tasks = Task.query.filter_by(status='in_progress').count()
        todo_tasks = Task.query.filter_by(status='todo').count()
        total_users = User.query.count()

        # Tasks per project
        projects = Project.query.all()
        tasks_per_project = []
        for p in projects:
            tasks_per_project.append({
                'project_name': p.project_name,
                'total': len(p.tasks),
                'completed': sum(1 for t in p.tasks if t.status == 'completed'),
                'in_progress': sum(1 for t in p.tasks if t.status == 'in_progress'),
                'todo': sum(1 for t in p.tasks if t.status == 'todo'),
            })

        # Tasks per user
        users = User.query.all()
        tasks_per_user = []
        for u in users:
            assigned = Task.query.filter_by(assigned_user_id=u.id).count()
            done = Task.query.filter_by(assigned_user_id=u.id, status='completed').count()
            tasks_per_user.append({
                'user_name': u.name,
                'user_id': u.id,
                'total_assigned': assigned,
                'completed': done,
            })

        # Sort by most active (most tasks completed)
        tasks_per_user_sorted = sorted(tasks_per_user, key=lambda x: x['completed'], reverse=True)

        return jsonify({
            'role': 'admin',
            'total_projects': total_projects,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'todo_tasks': todo_tasks,
            'total_users': total_users,
            'tasks_per_project': tasks_per_project,
            'tasks_per_user': tasks_per_user_sorted
        }), 200

    else:
        # Regular user dashboard
        my_tasks = Task.query.filter_by(assigned_user_id=user.id).all()
        my_projects = user.projects

        return jsonify({
            'role': 'user',
            'my_projects': len(my_projects),
            'my_tasks': len(my_tasks),
            'completed': sum(1 for t in my_tasks if t.status == 'completed'),
            'in_progress': sum(1 for t in my_tasks if t.status == 'in_progress'),
            'todo': sum(1 for t in my_tasks if t.status == 'todo'),
            'recent_tasks': [t.to_dict() for t in sorted(my_tasks, key=lambda x: x.created_at, reverse=True)[:5]]
        }), 200

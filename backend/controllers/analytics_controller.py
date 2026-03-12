from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from models.user_model import UserModel
from models.project_model import ProjectModel
from models.task_model import TaskModel

def _current_user():
    return UserModel.query.get(int(get_jwt_identity()))

class AnalyticsController:

    @staticmethod
    def dashboard():
        user = _current_user()

        if user.role == 'admin':
            total_projects    = ProjectModel.query.count()
            total_tasks       = TaskModel.query.count()
            completed_tasks   = TaskModel.query.filter_by(status='completed').count()
            in_progress_tasks = TaskModel.query.filter_by(status='in_progress').count()
            todo_tasks        = TaskModel.query.filter_by(status='todo').count()
            total_users       = UserModel.query.count()

            projects = ProjectModel.query.all()
            tasks_per_project = [
                {
                    'project_name': p.project_name,
                    'total':        len(p.tasks),
                    'completed':    sum(1 for t in p.tasks if t.status == 'completed'),
                    'in_progress':  sum(1 for t in p.tasks if t.status == 'in_progress'),
                    'todo':         sum(1 for t in p.tasks if t.status == 'todo'),
                }
                for p in projects
            ]

            users = UserModel.query.all()
            tasks_per_user = sorted(
                [
                    {
                        'user_id':       u.id,
                        'user_name':     u.name,
                        'total_assigned': TaskModel.query.filter_by(assigned_user_id=u.id).count(),
                        'completed':      TaskModel.query.filter_by(assigned_user_id=u.id, status='completed').count(),
                    }
                    for u in users
                ],
                key=lambda x: x['completed'],
                reverse=True,
            )

            return jsonify({
                'role':               'admin',
                'total_projects':     total_projects,
                'total_tasks':        total_tasks,
                'completed_tasks':    completed_tasks,
                'in_progress_tasks':  in_progress_tasks,
                'todo_tasks':         todo_tasks,
                'total_users':        total_users,
                'tasks_per_project':  tasks_per_project,
                'tasks_per_user':     tasks_per_user,
            }), 200

        # ── Regular user ────────────────────────────────────────────────────────
        my_tasks    = TaskModel.query.filter_by(assigned_user_id=user.id).all()
        my_projects = user.projects

        return jsonify({
            'role':         'user',
            'my_projects':  len(my_projects),
            'my_tasks':     len(my_tasks),
            'completed':    sum(1 for t in my_tasks if t.status == 'completed'),
            'in_progress':  sum(1 for t in my_tasks if t.status == 'in_progress'),
            'todo':         sum(1 for t in my_tasks if t.status == 'todo'),
            'recent_tasks': [
                t.to_dict()
                for t in sorted(my_tasks, key=lambda x: x.created_at, reverse=True)[:5]
            ],
        }), 200

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.comment_attachment import Comment
from models.task import Task
from models.user import User

comments_bp = Blueprint('comments', __name__)

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)


@comments_bp.route('/tasks/<int:task_id>/comments', methods=['GET'])
@jwt_required()
def get_comments(task_id):
    Task.query.get_or_404(task_id)
    comments = Comment.query.filter_by(task_id=task_id).order_by(Comment.timestamp.asc()).all()
    return jsonify({'comments': [c.to_dict() for c in comments]}), 200


@comments_bp.route('/tasks/<int:task_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(task_id):
    Task.query.get_or_404(task_id)
    user = get_current_user()
    data = request.get_json()
    text = data.get('comment_text', '').strip()
    if not text:
        return jsonify({'error': 'Comment text is required'}), 400

    comment = Comment(task_id=task_id, user_id=user.id, comment_text=text)
    db.session.add(comment)
    db.session.commit()
    return jsonify({'message': 'Comment added', 'comment': comment.to_dict()}), 201


@comments_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user = get_current_user()
    comment = Comment.query.get_or_404(comment_id)
    if comment.user_id != user.id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Comment deleted'}), 200

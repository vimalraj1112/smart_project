from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.comment_controller import CommentController, AttachmentController

comments_bp = Blueprint('comments', __name__)

# ─── Comments ─────────────────────────────────────────────────────────────────
@comments_bp.route('/tasks/<int:task_id>/comments', methods=['GET'])
@jwt_required()
def get_comments(task_id):
    return CommentController.get_comments(task_id)

@comments_bp.route('/tasks/<int:task_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(task_id):
    return CommentController.add_comment(task_id)

@comments_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    return CommentController.delete_comment(comment_id)

# ─── Attachments ──────────────────────────────────────────────────────────────
@comments_bp.route('/tasks/<int:task_id>/attachments', methods=['GET'])
@jwt_required()
def get_attachments(task_id):
    return AttachmentController.get_attachments(task_id)

@comments_bp.route('/tasks/<int:task_id>/attachments', methods=['POST'])
@jwt_required()
def upload(task_id):
    return AttachmentController.upload(task_id)

@comments_bp.route('/attachments/<int:attachment_id>/download', methods=['GET'])
@jwt_required()
def download(attachment_id):
    return AttachmentController.download(attachment_id)

@comments_bp.route('/attachments/<int:attachment_id>', methods=['DELETE'])
@jwt_required()
def delete_attachment(attachment_id):
    return AttachmentController.delete_attachment(attachment_id)

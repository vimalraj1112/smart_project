import os
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db
from models.comment_attachment import Attachment
from models.task import Task
from models.user import User
from config import Config

attachments_bp = Blueprint('attachments', __name__)

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS


@attachments_bp.route('/tasks/<int:task_id>/attachments', methods=['GET'])
@jwt_required()
def get_attachments(task_id):
    Task.query.get_or_404(task_id)
    attachments = Attachment.query.filter_by(task_id=task_id).order_by(Attachment.timestamp.desc()).all()
    return jsonify({'attachments': [a.to_dict() for a in attachments]}), 200


@attachments_bp.route('/tasks/<int:task_id>/attachments', methods=['POST'])
@jwt_required()
def upload_attachment(task_id):
    Task.query.get_or_404(task_id)
    user = get_current_user()

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    filename = secure_filename(file.filename)
    # Make filename unique with task_id prefix
    unique_filename = f"task{task_id}_{filename}"
    upload_dir = Config.UPLOAD_FOLDER
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, unique_filename)
    file.save(filepath)

    attachment = Attachment(
        task_id=task_id,
        filename=filename,
        filepath=filepath,
        uploaded_by=user.id
    )
    db.session.add(attachment)
    db.session.commit()
    return jsonify({'message': 'File uploaded', 'attachment': attachment.to_dict()}), 201


@attachments_bp.route('/attachments/<int:attachment_id>/download', methods=['GET'])
@jwt_required()
def download_attachment(attachment_id):
    attachment = Attachment.query.get_or_404(attachment_id)
    if not os.path.exists(attachment.filepath):
        return jsonify({'error': 'File not found on server'}), 404
    return send_file(attachment.filepath, as_attachment=True, download_name=attachment.filename)


@attachments_bp.route('/attachments/<int:attachment_id>', methods=['DELETE'])
@jwt_required()
def delete_attachment(attachment_id):
    user = get_current_user()
    attachment = Attachment.query.get_or_404(attachment_id)

    if attachment.uploaded_by != user.id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    if os.path.exists(attachment.filepath):
        os.remove(attachment.filepath)

    db.session.delete(attachment)
    db.session.commit()
    return jsonify({'message': 'Attachment deleted'}), 200

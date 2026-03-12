import os
from flask import jsonify, request, send_file
from flask_jwt_extended import get_jwt_identity
from models import db
from models.user_model import UserModel
from models.task_model import TaskModel
from models.comment_model import CommentModel, AttachmentModel
from utils.file_upload import allowed_file, save_file, delete_file

def _current_user():
    return UserModel.query.get(int(get_jwt_identity()))

class CommentController:

    @staticmethod
    def get_comments(task_id):
        TaskModel.query.get_or_404(task_id)
        comments = (CommentModel.query
                    .filter_by(task_id=task_id)
                    .order_by(CommentModel.timestamp.asc())
                    .all())
        return jsonify({'comments': [c.to_dict() for c in comments]}), 200

    @staticmethod
    def add_comment(task_id):
        TaskModel.query.get_or_404(task_id)
        user = _current_user()
        data = request.get_json() or {}
        text = data.get('comment_text', '').strip()
        if not text:
            return jsonify({'error': 'comment_text is required'}), 400

        comment = CommentModel(task_id=task_id, user_id=user.id, comment_text=text)
        db.session.add(comment)
        db.session.commit()
        return jsonify({'message': 'Comment added', 'comment': comment.to_dict()}), 201

    @staticmethod
    def delete_comment(comment_id):
        user = _current_user()
        comment = CommentModel.query.get_or_404(comment_id)
        if comment.user_id != user.id and user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        db.session.delete(comment)
        db.session.commit()
        return jsonify({'message': 'Comment deleted'}), 200


class AttachmentController:

    @staticmethod
    def get_attachments(task_id):
        TaskModel.query.get_or_404(task_id)
        atts = (AttachmentModel.query
                .filter_by(task_id=task_id)
                .order_by(AttachmentModel.timestamp.desc())
                .all())
        return jsonify({'attachments': [a.to_dict() for a in atts]}), 200

    @staticmethod
    def upload(task_id):
        TaskModel.query.get_or_404(task_id)
        user = _current_user()

        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        file = request.files['file']
        if not file or file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400

        filename, filepath = save_file(file, task_id)

        att = AttachmentModel(task_id=task_id, filename=filename,
                              filepath=filepath, uploaded_by=user.id)
        db.session.add(att)
        db.session.commit()
        return jsonify({'message': 'File uploaded', 'attachment': att.to_dict()}), 201

    @staticmethod
    def download(attachment_id):
        att = AttachmentModel.query.get_or_404(attachment_id)
        if not os.path.exists(att.filepath):
            return jsonify({'error': 'File not found on server'}), 404
        return send_file(att.filepath, as_attachment=True, download_name=att.filename)

    @staticmethod
    def delete_attachment(attachment_id):
        user = _current_user()
        att = AttachmentModel.query.get_or_404(attachment_id)
        if att.uploaded_by != user.id and user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        delete_file(att.filepath)
        db.session.delete(att)
        db.session.commit()
        return jsonify({'message': 'Attachment deleted'}), 200

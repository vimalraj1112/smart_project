from models import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class UserModel(db.Model):
    __tablename__ = 'users'

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100), nullable=False)
    email      = db.Column(db.String(150), unique=True, nullable=False)
    password   = db.Column(db.String(256), nullable=False)
    role       = db.Column(db.String(20), default='user')   # 'admin' | 'user'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    projects_created = db.relationship('ProjectModel', backref='creator',
                                       lazy=True, foreign_keys='ProjectModel.created_by')
    tasks_assigned   = db.relationship('TaskModel', backref='assignee',
                                       lazy=True, foreign_keys='TaskModel.assigned_user_id')
    comments         = db.relationship('CommentModel', backref='author', lazy=True)
    attachments      = db.relationship('AttachmentModel', backref='uploader', lazy=True)

    def set_password(self, plain_password: str):
        self.password = generate_password_hash(plain_password)

    def check_password(self, plain_password: str) -> bool:
        return check_password_hash(self.password, plain_password)

    def to_dict(self):
        return {
            'id':         self.id,
            'name':       self.name,
            'email':      self.email,
            'role':       self.role,
            'created_at': self.created_at.isoformat(),
        }

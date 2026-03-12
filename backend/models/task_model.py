from models import db
from datetime import datetime

class TaskModel(db.Model):
    __tablename__ = 'tasks'

    id               = db.Column(db.Integer, primary_key=True)
    task_name        = db.Column(db.String(200), nullable=False)
    description      = db.Column(db.Text)
    project_id       = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    assigned_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    status           = db.Column(db.String(20), default='todo')    # todo | in_progress | completed
    priority         = db.Column(db.String(20), default='medium')  # low | medium | high
    deadline         = db.Column(db.Date)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)

    comments    = db.relationship('CommentModel',    backref='task',
                                  lazy=True, cascade='all, delete-orphan')
    attachments = db.relationship('AttachmentModel', backref='task',
                                  lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id':                 self.id,
            'task_name':          self.task_name,
            'description':        self.description,
            'project_id':         self.project_id,
            'project_name':       self.project.project_name if self.project else None,
            'assigned_user_id':   self.assigned_user_id,
            'assigned_user_name': self.assignee.name if self.assignee else None,
            'status':             self.status,
            'priority':           self.priority,
            'deadline':           self.deadline.isoformat() if self.deadline else None,
            'created_at':         self.created_at.isoformat(),
            'comment_count':      len(self.comments),
            'attachment_count':   len(self.attachments),
        }

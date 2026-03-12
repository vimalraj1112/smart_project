from models import db
from datetime import datetime

# Association table for project members
project_members = db.Table('project_members',
    db.Column('project_id', db.Integer, db.ForeignKey('projects.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
)

class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    project_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    deadline = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    members = db.relationship('User', secondary=project_members, lazy='subquery',
                               backref=db.backref('projects', lazy=True))
    tasks = db.relationship('Task', backref='project', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_members=False):
        data = {
            'id': self.id,
            'project_name': self.project_name,
            'description': self.description,
            'created_by': self.created_by,
            'creator_name': self.creator.name if self.creator else None,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'created_at': self.created_at.isoformat(),
            'task_count': len(self.tasks),
            'member_count': len(self.members)
        }
        if include_members:
            data['members'] = [m.to_dict() for m in self.members]
        return data

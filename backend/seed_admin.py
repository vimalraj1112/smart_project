"""
seed_admin.py — Creates the admin user in the database.
Run once after the backend starts for the first time.

Credentials:
    Email:    admin@gmail.com
    Password: admin123
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db
from models.user_model import UserModel

ADMIN_NAME     = 'Admin'
ADMIN_EMAIL    = 'admin@gmail.com'
ADMIN_PASSWORD = 'admin123'

app = create_app()

with app.app_context():
    existing = UserModel.query.filter_by(email=ADMIN_EMAIL).first()
    if existing:
        # Update role to admin in case it was registered as user
        existing.role = 'admin'
        db.session.commit()
        print(f'✅ Admin already exists — role confirmed: {existing.email}')
    else:
        admin = UserModel(name=ADMIN_NAME, email=ADMIN_EMAIL, role='admin')
        admin.set_password(ADMIN_PASSWORD)
        db.session.add(admin)
        db.session.commit()
        print('✅ Admin user created!')
        print(f'   Email:    {ADMIN_EMAIL}')
        print(f'   Password: {ADMIN_PASSWORD}')

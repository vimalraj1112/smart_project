import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Extensions
    db.init_app(app)
    JWTManager(app)
    CORS(app,
         origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
         supports_credentials=True)

    # Ensure uploads folder
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register models (must import before create_all)
    from models.user_model       import UserModel
    from models.project_model    import ProjectModel, project_members
    from models.task_model       import TaskModel
    from models.comment_model    import CommentModel, AttachmentModel

    # Register blueprints (MVC Route layer)
    from routes.auth_routes      import auth_bp
    from routes.project_routes   import projects_bp
    from routes.task_routes      import tasks_bp
    from routes.comment_routes   import comments_bp
    from routes.analytics_routes import analytics_bp

    app.register_blueprint(auth_bp,      url_prefix='/api/auth')
    app.register_blueprint(projects_bp,  url_prefix='/api/projects')
    app.register_blueprint(tasks_bp,     url_prefix='/api/tasks')
    app.register_blueprint(comments_bp,  url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

    with app.app_context():
        db.create_all()
        print('✅ Database tables ready (MySQL)')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)

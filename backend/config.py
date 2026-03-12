# import os

# BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# class Config:
#     SECRET_KEY = os.environ.get('SECRET_KEY', 'smart-task-mvc-secret-2024')
#     JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-smart-task-mvc-2024')

#     # ─── MySQL Database ────────────────────────────────────────────────────────
#     DB_USER     = os.environ.get('DB_USER', 'root')
#     DB_PASSWORD = os.environ.get('DB_PASSWORD', '1112')        # ← Change this
#     DB_HOST     = os.environ.get('DB_HOST', 'localhost')
#     DB_PORT     = os.environ.get('DB_PORT', '3306')
#     DB_NAME     = os.environ.get('DB_NAME', 'smart_task_db')

#     SQLALCHEMY_DATABASE_URI = (
#         f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
#     )
#     SQLALCHEMY_TRACK_MODIFICATIONS = False

#     # ─── File Upload ───────────────────────────────────────────────────────────
#     UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
#     MAX_CONTENT_LENGTH = 16 * 1024 * 1024   # 16 MB
#     ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf',
#                           'doc', 'docx', 'txt', 'xlsx', 'csv', 'zip'}

#     JWT_ACCESS_TOKEN_EXPIRES = False

import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:

    SECRET_KEY = os.getenv("SECRET_KEY", "smart-task-mvc-secret-2024")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-smart-task-mvc-2024")

    # Railway MySQL variables
    DB_USER = os.getenv("MYSQLUSER")
    DB_PASSWORD = os.getenv("MYSQL_ROOT_PASSWORD")
    DB_HOST = os.getenv("MYSQLHOST")
    DB_PORT = os.getenv("MYSQLPORT")
    DB_NAME = os.getenv("MYSQLDATABASE")

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Upload settings
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024

    ALLOWED_EXTENSIONS = {
        "png","jpg","jpeg","gif","pdf",
        "doc","docx","txt","xlsx","csv","zip"
    }

    JWT_ACCESS_TOKEN_EXPIRES = False
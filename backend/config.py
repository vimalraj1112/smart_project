import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:

    SECRET_KEY = os.getenv("SECRET_KEY", "smart-task-mvc-secret-2024")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-smart-task-mvc-2024")

    # ✅ FIXED MySQL config (works locally + Railway)
    DB_USER = os.getenv("MYSQLUSER") or "root"
    DB_PASSWORD = os.getenv("MYSQL_ROOT_PASSWORD") or "1112"
    DB_HOST = os.getenv("MYSQLHOST") or "localhost"
    DB_PORT = os.getenv("MYSQLPORT") or "3306"
    DB_NAME = os.getenv("MYSQLDATABASE") or "smart_task_db"

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
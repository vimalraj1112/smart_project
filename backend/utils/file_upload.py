import os
from werkzeug.utils import secure_filename
from config import Config

def allowed_file(filename: str) -> bool:
    return (
        '.' in filename and
        filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS
    )

def save_file(file_obj, task_id: int) -> tuple[str, str]:
    """Save an uploaded file and return (filename, absolute_filepath)."""
    filename = secure_filename(file_obj.filename)
    unique_name = f"task{task_id}_{filename}"
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(Config.UPLOAD_FOLDER, unique_name)
    file_obj.save(filepath)
    return filename, filepath

def delete_file(filepath: str):
    """Delete a file from disk if it exists."""
    if os.path.exists(filepath):
        os.remove(filepath)

# AttachmentModel lives in comment_model.py
# This file re-exports it for explicit MVC import paths

from models.comment_model import AttachmentModel

__all__ = ['AttachmentModel']

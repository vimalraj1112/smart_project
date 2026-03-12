from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.analytics_controller import AnalyticsController

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    return AnalyticsController.dashboard()

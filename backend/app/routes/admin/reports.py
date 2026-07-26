from datetime import datetime

from flask import jsonify, request

from app.middleware import admin_required
from app.services import report_service
from . import admin_bp


@admin_bp.route("/reports/summary", methods=["GET"])
@admin_required
def dashboard_summary():
    return jsonify(report_service.get_admin_dashboard_summary()), 200


@admin_bp.route("/reports/monthly", methods=["GET"])
@admin_required
def monthly_bar_chart():
    months = request.args.get("months", default=6, type=int)
    return jsonify(report_service.get_monthly_bar_chart(months=months)), 200


@admin_bp.route("/reports/category-breakdown", methods=["GET"])
@admin_required
def category_pie_chart():
    start = request.args.get("start_date")
    end = request.args.get("end_date")
    start_date = datetime.fromisoformat(start) if start else None
    end_date = datetime.fromisoformat(end) if end else None
    return jsonify(report_service.get_category_pie_chart(start_date, end_date)), 200

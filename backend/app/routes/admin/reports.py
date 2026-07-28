from datetime import datetime

from flask import jsonify, request

from app.middleware import admin_required
from app.services import report_service
from . import admin_bp


def _parse_dates():
    start = request.args.get("start_date")
    end = request.args.get("end_date")
    start_date = datetime.fromisoformat(start.replace("Z", "+00:00")) if start else None
    end_date = datetime.fromisoformat(end.replace("Z", "+00:00")) if end else None
    return start_date, end_date


@admin_bp.route("/reports/summary", methods=["GET"])
@admin_required
def dashboard_summary():
    return jsonify(report_service.get_admin_dashboard_summary()), 200


@admin_bp.route("/reports/dashboard", methods=["GET"])
@admin_required
def dashboard():
    return jsonify(report_service.get_admin_dashboard_summary()), 200


@admin_bp.route("/reports/monthly", methods=["GET"])
@admin_required
def monthly_bar_chart():
    months = request.args.get("months", default=6, type=int)
    start_date, end_date = _parse_dates()
    if start_date or end_date:
        data = report_service.get_monthly_bar_chart(start_date=start_date, end_date=end_date)
    else:
        data = report_service.get_monthly_bar_chart(months=months)
    return jsonify(data), 200


@admin_bp.route("/reports/category-breakdown", methods=["GET"])
@admin_required
def category_pie_chart_legacy():
    start_date, end_date = _parse_dates()
    return jsonify(report_service.get_category_pie_chart(start_date, end_date)), 200


@admin_bp.route("/reports/category", methods=["GET"])
@admin_required
def category_pie_chart():
    start_date, end_date = _parse_dates()
    return jsonify(report_service.get_category_pie_chart(start_date, end_date)), 200

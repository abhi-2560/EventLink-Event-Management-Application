from datetime import datetime

from flask import g, jsonify, request

from app.middleware import organizer_required
from app.services import organizer_report_service
from . import organizer_bp


def _parse_dates():
    start = request.args.get("start_date")
    end = request.args.get("end_date")
    start_date = datetime.fromisoformat(start.replace("Z", "+00:00")) if start else None
    end_date = datetime.fromisoformat(end.replace("Z", "+00:00")) if end else None
    return start_date, end_date


@organizer_bp.route("/dashboard", methods=["GET"])
@organizer_required
def dashboard():
    data = organizer_report_service.get_organizer_dashboard(g.current_organizer_id)
    return jsonify(data), 200


@organizer_bp.route("/reports/period", methods=["GET"])
@organizer_required
def period_report():
    start_date, end_date = _parse_dates()
    data = organizer_report_service.get_organizer_period_summary(
        g.current_organizer_id, start_date, end_date
    )
    return jsonify(data), 200


@organizer_bp.route("/reports/monthly", methods=["GET"])
@organizer_required
def monthly_report():
    start_date, end_date = _parse_dates()
    data = organizer_report_service.get_organizer_monthly_report(
        g.current_organizer_id, start_date, end_date
    )
    return jsonify(data), 200


@organizer_bp.route("/reports/category", methods=["GET"])
@organizer_required
def category_report():
    start_date, end_date = _parse_dates()
    data = organizer_report_service.get_organizer_category_report(
        g.current_organizer_id, start_date, end_date
    )
    return jsonify(data), 200

from flask import Blueprint

admin_bp = Blueprint("admin", __name__)

# Each import below adds routes onto admin_bp as a side effect - this is
# the standard "shared blueprint object across multiple files" pattern,
# not unused imports despite what a linter might say.
from . import organizers, events, categories, coupons, reports, audit  # noqa: E402,F401

# """Application logging helpers.

# The formatter emits one JSON object per line so logs can be consumed by
# container platforms without relying on a vendor-specific logging package.
# """

# from __future__ import annotations

# import json
# import logging
# import sys
# from datetime import datetime, timezone


# class JsonFormatter(logging.Formatter):
#     """Format operational logs without serializing request bodies or secrets."""

#     def format(self, record: logging.LogRecord) -> str:
#         payload = {
#             "timestamp": datetime.now(timezone.utc).isoformat(),
#             "level": record.levelname,
#             "logger": record.name,
#             "message": record.getMessage(),
#         }
#         for key in ("request_id", "method", "path", "status_code", "duration_ms", "remote_addr"):
#             value = getattr(record, key, None)
#             if value is not None:
#                 payload[key] = value
#         if record.exc_info:
#             payload["exception"] = self.formatException(record.exc_info)
#         return json.dumps(payload, default=str)


# def configure_logging(app) -> None:
#     """Install a single stdout handler once per Flask application."""

#     logger = app.logger
#     logger.handlers.clear()
#     handler = logging.StreamHandler(sys.stdout)
#     handler.setFormatter(JsonFormatter())
#     logger.addHandler(handler)
#     logger.setLevel(getattr(logging, app.config.get("LOG_LEVEL", "INFO").upper(), logging.INFO))
#     logger.propagate = False

"""Application logging helpers.

The formatter emits one JSON object per line so logs can be consumed by
container platforms without relying on a vendor-specific logging package.
"""

from __future__ import annotations

import json
import logging
import os
import sys
from datetime import datetime, timezone
from logging.handlers import RotatingFileHandler


class JsonFormatter(logging.Formatter):
    """Format operational logs without serializing request bodies or secrets."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for key in (
            "request_id",
            "method",
            "path",
            "status_code",
            "duration_ms",
            "remote_addr",
        ):
            value = getattr(record, key, None)
            if value is not None:
                payload[key] = value
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


def configure_logging(app) -> None:
    """Install stdout and file logging handlers once per Flask application."""

    logger = app.logger
    logger.handlers.clear()

    log_level = getattr(
        logging,
        app.config.get("LOG_LEVEL", "INFO").upper(),
        logging.INFO,
    )

    # Ensure logs directory exists
    os.makedirs("logs", exist_ok=True)

    # Console (stdout) handler
    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setFormatter(JsonFormatter())
    stdout_handler.setLevel(log_level)

    # File handler (appends automatically)
    file_handler = RotatingFileHandler(
        "logs/backend.log",
        maxBytes=10 * 1024 * 1024,  # 10 MB
        backupCount=10,             # keep 10 old log files
        encoding="utf-8",
    )
    file_handler.setFormatter(JsonFormatter())
    file_handler.setLevel(log_level)

    logger.addHandler(stdout_handler)
    logger.addHandler(file_handler)

    logger.setLevel(log_level)
    logger.propagate = False
"""
Service-layer exceptions.

Routes catch these and translate them into HTTP responses. Keeping them
here (rather than raising raw ValueError/KeyError) means every route can
handle errors the same way, e.g.:

    try:
        event = event_service.create_event(...)
    except ServiceError as exc:
        return jsonify({"error": str(exc)}), exc.status_code
"""


class ServiceError(Exception):
    """Base class for all service-layer errors."""
    status_code = 400


class NotFoundError(ServiceError):
    """Requested entity does not exist."""
    status_code = 404


class ForbiddenError(ServiceError):
    """Actor is authenticated but not allowed to perform this action."""
    status_code = 403


class ConflictError(ServiceError):
    """Action conflicts with current state (sold out, duplicate, etc.)."""
    status_code = 409


class ValidationError(ServiceError):
    """Input failed a business rule, not just type/shape validation."""
    status_code = 422


class ServiceUnavailableError(ServiceError):
    """A configured external dependency is unavailable."""
    status_code = 503


class SeatsUnavailableError(ConflictError):
    """Not enough available_seats to satisfy the requested hold."""
    pass


class CouponInvalidError(ValidationError):
    """Coupon code is missing, inactive, expired, or exhausted."""
    pass


class PaymentAlreadyProcessedError(ConflictError):
    """Webhook retry for a payment that has already reached a final state."""
    pass

# """Admin-managed global platform fees stored on the admin table."""

# from __future__ import annotations

# from decimal import Decimal
# from ipaddress import ip_address
# from urllib import request

# from app.extensions import db
# from app.models import Admin
# from backend.app.services import audit_service
# from backend.app.services.audit_service import log_action
# from .exceptions import ValidationError


# def _fee_admin() -> Admin:
#     admin = Admin.query.order_by(Admin.created_at.asc()).first()
#     if admin is None:
#         raise ValidationError("No admin account exists to store platform fees")
#     return admin


# def get_settings() -> Admin:
#     return _fee_admin()


# def get_fees() -> dict[str, Decimal]:
#     admin = _fee_admin()
#     return {
#         "convenience_fee": Decimal(admin.convenience_fee or 0),
#         "gateway_fee": Decimal(admin.gateway_fee or 0),
#     }


# def update_settings(convenience_fee, gateway_fee) -> Admin:
#     try:
#         convenience = Decimal(str(convenience_fee))
#         gateway = Decimal(str(gateway_fee))
#     except Exception as exc:
#         raise ValidationError("convenience_fee and gateway_fee must be valid numbers") from exc

#     if convenience < 0 or gateway < 0:
#         raise ValidationError("Fees must be zero or greater")


#     admin = _fee_admin()

#     old_value = {
#         "convenience_fee": str(admin.convenience_fee),
#         "gateway_fee": str(admin.gateway_fee),
# }
#     if (
#         admin.convenience_fee == convenience
#         and admin.gateway_fee == gateway
#     ):
#         return admin

#     new_value = {
#         "convenience_fee": str(convenience),
#         "gateway_fee": str(gateway),
#     }
    
        
#     audit_service.log_action(
#         actor_type="ADMIN",
#         actor_id=admin.admin_id,
#         actor_name=admin.name,
#         actor_email=admin.email,
#         action="Platform Fee Settings Updated",
#         entity_type="platform_settings",
#         entity_name="Platform Fee Settings",
#         old_value=old_value,
#         new_value=new_value,
#         ip_address=ip_address,
#     )

#     db.session.commit()
#     return _fee_admin()

"""Admin-managed global platform fees stored on the admin table."""

from __future__ import annotations

from decimal import Decimal

from flask import request

from app.extensions import db
from app.models import Admin
from app.services.audit_service import log_action
from .exceptions import ValidationError


def _fee_admin() -> Admin:
    admin = Admin.query.order_by(Admin.created_at.asc()).first()
    if admin is None:
        raise ValidationError("No admin account exists to store platform fees")
    return admin


def get_settings() -> Admin:
    return _fee_admin()


def get_fees() -> dict[str, Decimal]:
    admin = _fee_admin()
    return {
        "convenience_fee": Decimal(admin.convenience_fee or 0),
        "gateway_fee": Decimal(admin.gateway_fee or 0),
    }


def update_settings(convenience_fee, gateway_fee) -> Admin:
    try:
        convenience = Decimal(str(convenience_fee))
        gateway = Decimal(str(gateway_fee))
    except Exception as exc:
        raise ValidationError(
            "convenience_fee and gateway_fee must be valid numbers"
        ) from exc

    if convenience < 0 or gateway < 0:
        raise ValidationError("Fees must be zero or greater")

    admins = Admin.query.all()
    if not admins:
        raise ValidationError("No admin account exists to store platform fees")

    primary_admin = admins[0]

    old_value = {
        "convenience_fee": str(primary_admin.convenience_fee),
        "gateway_fee": str(primary_admin.gateway_fee),
    }

    # Nothing changed
    if (
        primary_admin.convenience_fee == convenience
        and primary_admin.gateway_fee == gateway
    ):
        return primary_admin

    # Update all admin rows
    for admin in admins:
        admin.convenience_fee = convenience
        admin.gateway_fee = gateway

    db.session.commit()

    log_action(
        actor_type="ADMIN",
        actor_id=primary_admin.admin_id,
        actor_name=primary_admin.name,
        actor_email=primary_admin.email,
        action="Platform Fee Settings Updated",
        entity_type="platform_settings",
        entity_name="Platform Fee Settings",
        old_value=old_value,
        new_value={
            "convenience_fee": str(convenience),
            "gateway_fee": str(gateway),
        },
        ip_address=request.remote_addr,
    )

    return primary_admin
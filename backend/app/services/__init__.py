"""
Service layer: all business logic, framework-agnostic (no Flask imports
except where noted). Routes call into these modules and stay thin -
parse request, check role/ownership via decorator, call one service
function, serialize the response.

    admin_service       - organizer administration, event read/update, categories
    organizer_service    - organizer's own events, ownership checks, sales
    event_service         - shared Event logic used by both of the above and by public routes
    booking_service       - registrant seat-hold flow, coupon application
    payment_service        - simulated payment orders, verify/failure, receipts
    coupon_service           - coupon CRUD and atomic redemption
    auth_service               - admin/organizer login, password reset
    audit_service                - shared log_action() helper
    report_service                 - admin dashboard and chart data
"""

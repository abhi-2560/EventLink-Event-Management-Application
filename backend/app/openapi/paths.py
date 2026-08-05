"""OpenAPI path definitions for every Flask route."""

from copy import deepcopy


def ref(name: str) -> dict:
    return {"$ref": f"#/components/schemas/{name}"}


def json_response(schema_ref: str, status: str = "200", description: str = "Success"):
    return {status: {"description": description, "content": {"application/json": {"schema": ref(schema_ref)}}}}


def json_array(schema_ref: str, status: str = "200"):
    return {
        status: {
            "description": "Success",
            "content": {
                "application/json": {
                    "schema": {"type": "array", "items": ref(schema_ref)},
                }
            },
        }
    }


def errors(*codes: str):
    mapping = {}
    for code in codes:
        schema = "JwtErrorResponse" if code == "401" else "ErrorResponse"
        mapping[code] = {"description": f"HTTP {code}", "content": {"application/json": {"schema": ref(schema)}}}
    return mapping


def bearer(roles: str | None = None):
    sec = [{"BearerAuth": []}]
    return sec


def op(
    operation_id: str,
    summary: str,
    tags: list[str],
    *,
    security=None,
    parameters=None,
    request_body=None,
    responses=None,
    description: str | None = None,
):
    item = {
        "operationId": operation_id,
        "summary": summary,
        "tags": tags,
        "responses": responses or {"200": {"description": "Success"}},
    }
    if description:
        item["description"] = description
    if security is not None:
        item["security"] = security
    if parameters:
        item["parameters"] = parameters
    if request_body:
        item["requestBody"] = request_body
    return item


def uuid_param(name: str, description: str):
    return {
        "name": name,
        "in": "path",
        "required": True,
        "schema": {"type": "string", "format": "uuid"},
        "description": description,
    }


def query_param(name: str, description: str, schema: dict, required: bool = False):
    return {
        "name": name,
        "in": "query",
        "required": required,
        "description": description,
        "schema": schema,
    }


def json_request(schema_ref: str, required: bool = True):
    return {
        "required": required,
        "content": {"application/json": {"schema": ref(schema_ref)}},
    }


def multipart_request(properties: dict, required: list[str] | None = None):
    schema = {"type": "object", "properties": properties}
    if required:
        schema["required"] = required
    return {"required": True, "content": {"multipart/form-data": {"schema": schema}}}


DATE_RANGE_PARAMS = [
    query_param("start_date", "ISO-8601 start (Z supported)", {"type": "string", "format": "date-time"}),
    query_param("end_date", "ISO-8601 end (Z supported)", {"type": "string", "format": "date-time"}),
]

SEARCH_PARAMS = [
    query_param("title", "Title filter", {"type": "string"}),
    query_param("city", "City filter", {"type": "string"}),
    query_param("location", "Alias for city", {"type": "string"}),
    query_param("category_id", "Category UUID", {"type": "string", "format": "uuid"}),
    query_param("category", "Category name", {"type": "string"}),
    query_param("type", "Event type", {"type": "string", "enum": ["ONLINE", "OFFLINE", "HYBRID"]}),
    query_param("organizer", "Organizer name", {"type": "string"}),
    query_param("keyword", "Keyword match", {"type": "string"}),
    query_param("date", "Single-day filter", {"type": "string", "format": "date-time"}),
    query_param("date_from", "Range start", {"type": "string", "format": "date-time"}),
    query_param("date_to", "Range end", {"type": "string", "format": "date-time"}),
]

AUDIT_QUERY = [
    query_param("entity_type", "Entity type filter", {"type": "string"}),
    query_param("entity_id", "Entity UUID", {"type": "string", "format": "uuid"}),
    query_param("actor_type", "Actor type", {"type": "string"}),
    query_param("action", "Action partial match", {"type": "string"}),
    query_param("search", "Search entity/actor/action", {"type": "string"}),
    query_param("keyword", "Alias for search", {"type": "string"}),
    query_param("organizer", "Filter entity_name by organizer", {"type": "string"}),
    query_param("event", "Filter entity_name by event", {"type": "string"}),
    query_param("page", "Page number", {"type": "integer", "minimum": 1, "default": 1}),
    query_param("page_size", "Page size (max 100)", {"type": "integer", "minimum": 1, "maximum": 100, "default": 20}),
]


def build_paths() -> dict:
    p = {}

    p["/"] = {
        "get": op(
            "getRoot",
            "API root",
            ["Root"],
            security=[],
            responses={**json_response("MessageResponse"), **errors("500")},
        )
    }

    p["/health"] = {
        "get": op(
            "getHealth",
            "Health check",
            ["Health"],
            security=[],
            responses={
                **json_response("HealthOk"),
                "503": {"description": "Service unavailable", "content": {"application/json": {"schema": ref("HealthUnavailable")}}},
            },
        )
    }

    auth_tag = ["Auth"]
    auth_errors = errors("400", "401", "422", "500")

    def auth_login(op_id: str, path_summary: str, body_schema: str):
        return op(
            op_id,
            path_summary,
            auth_tag,
            security=[],
            request_body=json_request(body_schema),
            responses={**json_response("TokenResponse"), **auth_errors},
            description="Sets HttpOnly refresh token cookie (`refresh_token_admin` or `refresh_token_organizer`).",
        )

    p["/auth/login"] = {"post": auth_login("authLogin", "Unified login", "UnifiedLoginBody")}
    p["/auth/admin/login"] = {"post": auth_login("authAdminLogin", "Admin login", "LoginBody")}
    p["/auth/organizer/login"] = {"post": auth_login("authOrganizerLogin", "Organizer login", "LoginBody")}

    def auth_logout(op_id: str, summary: str):
        return op(
            op_id,
            summary,
            auth_tag,
            security=bearer(),
            responses={**json_response("MessageResponse"), **auth_errors},
            description="Revokes refresh token cookie.",
        )

    p["/auth/logout"] = {"post": auth_logout("authLogout", "Unified logout")}
    p["/auth/admin/logout"] = {"post": auth_logout("authAdminLogout", "Admin logout")}
    p["/auth/organizer/logout"] = {"post": auth_logout("authOrganizerLogout", "Organizer logout")}

    refresh_op = op(
        "authRefresh",
        "Refresh access token",
        auth_tag,
        security=[],
        parameters=[
            {
                "name": "X-Actor-Type",
                "in": "header",
                "required": True,
                "schema": {"type": "string", "enum": ["admin", "organizer"]},
            },
            {
                "name": "X-Refresh-Request",
                "in": "header",
                "required": True,
                "schema": {"type": "string", "enum": ["1"]},
            },
        ],
        responses={**json_response("TokenResponse"), **auth_errors},
        description="Requires HttpOnly `refresh_token_{actor_type}` cookie. Rotates refresh token.",
    )
    p["/auth/refresh"] = {"post": refresh_op}

    forgot = op(
        "authForgotPassword",
        "Request password reset",
        auth_tag,
        security=[],
        request_body={"required": True, "content": {"application/json": {"schema": {"type": "object", "required": ["email"], "properties": {"email": {"type": "string", "format": "email"}}}}}},
        responses={**json_response("MessageResponse"), **errors("422", "500")},
    )
    p["/auth/admin/forgot-password"] = {"post": deepcopy(forgot) | {"operationId": "authAdminForgotPassword", "summary": "Admin forgot password"}}
    p["/auth/organizer/forgot-password"] = {"post": deepcopy(forgot) | {"operationId": "authOrganizerForgotPassword", "summary": "Organizer forgot password"}}

    reset = op(
        "authResetPassword",
        "Confirm password reset",
        auth_tag,
        security=[],
        request_body=json_request("PasswordResetConfirm"),
        responses={**json_response("MessageResponse"), **errors("404", "422", "500")},
    )
    p["/auth/admin/reset-password"] = {"post": deepcopy(reset) | {"operationId": "authAdminResetPassword", "summary": "Admin reset password"}}
    p["/auth/organizer/reset-password"] = {"post": deepcopy(reset) | {"operationId": "authOrganizerResetPassword", "summary": "Organizer reset password"}}
    p["/auth/password-reset/request"] = {
        "post": op(
            "authPasswordResetRequest",
            "Unified password reset request",
            auth_tag,
            security=[],
            request_body=json_request("PasswordResetRequest"),
            responses={**json_response("MessageResponse"), **errors("422", "500")},
        )
    }
    p["/auth/password-reset/confirm"] = {
        "post": op(
            "authPasswordResetConfirm",
            "Unified password reset confirm",
            auth_tag,
            security=[],
            request_body=json_request("PasswordResetConfirm"),
            responses={**json_response("MessageResponse"), **errors("404", "422", "500")},
        )
    }
    p["/auth/register/organizer"] = {
        "post": op(
            "authRegisterOrganizer",
            "Register organizer (auth)",
            auth_tag,
            security=[],
            request_body=json_request("RegisterOrganizerBody"),
            responses={"201": {"description": "Created", "content": {"application/json": {"schema": ref("Organizer")}}}, **errors("409", "422", "500")},
        )
    }

    pub = ["Public"]
    pub_err = errors("404", "409", "422", "500")

    p["/events"] = {
        "get": op("listPublicEvents", "List published events", pub, security=[], responses={**json_array("Event"), **pub_err})
    }
    p["/events/search"] = {
        "get": op(
            "searchPublicEvents",
            "Search published events",
            pub,
            security=[],
            parameters=SEARCH_PARAMS,
            responses={**json_array("Event"), **pub_err},
        )
    }
    p["/events/{event_id}"] = {
        "get": op(
            "getPublicEvent",
            "Get published event",
            pub,
            security=[],
            parameters=[uuid_param("event_id", "Event UUID")],
            responses={**json_response("EventWithMedia"), **pub_err},
        )
    }
    p["/organizers/register"] = {
        "post": op(
            "publicRegisterOrganizer",
            "Register organizer (public)",
            pub,
            security=[],
            request_body=json_request("RegisterOrganizerBody"),
            responses={"201": {"description": "Created", "content": {"application/json": {"schema": ref("Organizer")}}}, **errors("409", "422", "500")},
        )
    }
    p["/coupons/validate"] = {
        "post": op(
            "validateCoupon",
            "Validate coupon",
            pub,
            security=[],
            request_body={
                "required": True,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "required": ["coupon_code", "event_id"],
                            "properties": {
                                "coupon_code": {"type": "string"},
                                "event_id": {"type": "string", "format": "uuid"},
                                "seat_count": {"type": "integer", "minimum": 1, "default": 1},
                            },
                        }
                    }
                },
            },
            responses={**json_response("CouponValidateResponse"), **errors("422", "500")},
        )
    }
    p["/registrations"] = {
        "post": op(
            "createRegistration",
            "Create registration",
            pub,
            security=[],
            request_body=json_request("RegistrationCreate"),
            responses={"201": {"description": "Created", "content": {"application/json": {"schema": ref("RegistrationCreated")}}}, **pub_err},
            description="Reserves seats for 15 minutes and creates a payment order.",
        )
    }
    p["/registrations/{registration_id}"] = {
        "get": op(
            "getRegistration",
            "Get registration",
            pub,
            security=[],
            parameters=[uuid_param("registration_id", "Registration UUID")],
            responses={**json_response("Registration"), **pub_err},
        )
    }
    p["/payments/create-order"] = {
        "post": op(
            "createPaymentOrder",
            "Create payment order",
            pub,
            security=[],
            request_body={
                "required": True,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "required": ["registration_id"],
                            "properties": {"registration_id": {"type": "string", "format": "uuid"}},
                        }
                    }
                },
            },
            responses={**json_response("PaymentOrder"), **errors("409", "422", "500")},
        )
    }
    p["/payments/verify"] = {
        "post": op(
            "verifyPayment",
            "Verify payment (simulated)",
            pub,
            security=[],
            request_body={
                "required": True,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "required": ["registration_id", "order_id"],
                            "properties": {
                                "registration_id": {"type": "string", "format": "uuid"},
                                "order_id": {"type": "string"},
                            },
                        }
                    }
                },
            },
            responses={**json_response("Payment"), **errors("404", "409", "422", "500")},
        )
    }
    p["/payments/failure"] = {
        "post": op(
            "paymentFailure",
            "Report payment failure",
            pub,
            security=[],
            request_body={
                "required": True,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "required": ["registration_id"],
                            "properties": {
                                "registration_id": {"type": "string", "format": "uuid"},
                                "failure_reason": {"type": "string"},
                            },
                        }
                    }
                },
            },
            responses={**json_response("Payment"), **errors("422", "500")},
        )
    }
    p["/payments/{payment_id}/receipt"] = {
        "get": op(
            "getPaymentReceipt",
            "Get payment receipt",
            pub,
            security=[],
            parameters=[uuid_param("payment_id", "Payment UUID")],
            responses={**json_response("Payment"), **errors("404", "500")},
        )
    }

    org = ["Organizer"]
    org_sec = bearer()
    org_err = errors("401", "403", "404", "409", "422", "500", "503")

    p["/organizer/events"] = {
        "get": op("listOrganizerEvents", "List own events", org, security=org_sec, responses={**json_array("EventInternal"), **org_err}),
        "post": op(
            "createOrganizerEvent",
            "Create event",
            org,
            security=org_sec,
            request_body=json_request("EventCreate"),
            responses={"201": {"description": "Created", "content": {"application/json": {"schema": ref("EventInternal")}}}, **org_err},
        ),
    }
    p["/organizer/events/browse"] = {
        "get": op("browseOrganizerEvents", "Browse all events", org, security=org_sec, responses={**json_array("Event"), **org_err})
    }
    p["/organizer/events/{event_id}"] = {
        "get": op(
            "getOrganizerEvent",
            "Get own event",
            org,
            security=org_sec,
            parameters=[uuid_param("event_id", "Event UUID")],
            responses={**json_response("EventWithMedia"), **org_err},
        ),
        "put": op(
            "updateOrganizerEvent",
            "Update own event",
            org,
            security=org_sec,
            parameters=[uuid_param("event_id", "Event UUID")],
            request_body=json_request("EventUpdate"),
            responses={**json_response("EventInternal"), **org_err},
        ),
    }
    p["/organizer/events/{event_id}/capacity"] = {
        "put": op(
            "updateOrganizerEventCapacity",
            "Update event capacity",
            org,
            security=org_sec,
            parameters=[uuid_param("event_id", "Event UUID")],
            request_body={
                "required": True,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "required": ["capacity"],
                            "properties": {"capacity": {"type": "integer", "minimum": 1}},
                        }
                    }
                },
            },
            responses={**json_response("EventInternal"), **org_err},
        )
    }

    publish_op = op(
        "publishOrganizerEvent",
        "Publish event",
        org,
        security=org_sec,
        parameters=[uuid_param("event_id", "Event UUID")],
        responses={**json_response("EventInternal"), **org_err},
    )
    p["/organizer/events/{event_id}/publish"] = {"post": deepcopy(publish_op) | {"operationId": "publishOrganizerEventPost"}, "patch": deepcopy(publish_op) | {"operationId": "publishOrganizerEventPatch"}}

    p["/organizer/events/{event_id}/close-registration"] = {
        "post": op(
            "closeOrganizerEventRegistration",
            "Close event registration",
            org,
            security=org_sec,
            parameters=[uuid_param("event_id", "Event UUID")],
            responses={**json_response("EventInternal"), **org_err},
        )
    }
    p["/organizer/events/{event_id}/archive"] = {
        "post": op(
            "archiveOrganizerEvent",
            "Archive own event",
            org,
            security=org_sec,
            parameters=[uuid_param("event_id", "Event UUID")],
            responses={**json_response("EventInternal"), **org_err},
        )
    }
    p["/organizer/events/{event_id}/banner"] = {
        "post": op(
            "uploadOrganizerEventBanner",
            "Upload event banner",
            org,
            security=org_sec,
            parameters=[uuid_param("event_id", "Event UUID")],
            request_body=multipart_request({"file": {"type": "string", "format": "binary"}}, ["file"]),
            responses={**json_response("EventWithMedia"), **org_err},
            description="Accepts image/jpeg, image/png, image/webp (max 5 MB).",
        ),
        "delete": op(
            "deleteOrganizerEventBanner",
            "Delete event banner",
            org,
            security=org_sec,
            parameters=[uuid_param("event_id", "Event UUID")],
            responses={**json_response("EventWithMedia"), **org_err},
        ),
    }
    p["/organizer/events/{event_id}/media"] = {
        "post": op(
            "uploadOrganizerEventMedia",
            "Upload event media",
            org,
            security=org_sec,
            parameters=[uuid_param("event_id", "Event UUID")],
            request_body=multipart_request(
                {
                    "file": {"type": "string", "format": "binary"},
                    "media_type": {"type": "string", "enum": ["IMAGE", "VIDEO"]},
                },
                ["file", "media_type"],
            ),
            responses={"201": {"description": "Created", "content": {"application/json": {"schema": ref("MediaUpload")}}}, **org_err},
        )
    }
    p["/organizer/events/{event_id}/media/{media_id}"] = {
        "delete": op(
            "deleteOrganizerEventMedia",
            "Delete event media",
            org,
            security=org_sec,
            parameters=[uuid_param("event_id", "Event UUID"), uuid_param("media_id", "Media UUID")],
            responses={**json_response("MessageResponse"), **org_err},
        )
    }
    p["/organizer/events/{event_id}/registrations"] = {
        "get": op(
            "listOrganizerEventRegistrations",
            "List event registrations",
            org,
            security=org_sec,
            parameters=[uuid_param("event_id", "Event UUID")],
            responses={**json_array("Registration"), **org_err},
        )
    }
    p["/organizer/events/{event_id}/registrations/{registration_id}"] = {
        "get": op(
            "getOrganizerEventRegistration",
            "Get registration detail",
            org,
            security=org_sec,
            parameters=[uuid_param("event_id", "Event UUID"), uuid_param("registration_id", "Registration UUID")],
            responses={**json_response("Registration"), **org_err},
        )
    }
    p["/organizer/events/{event_id}/sales"] = {
        "get": op(
            "getOrganizerEventSales",
            "Get event sales",
            org,
            security=org_sec,
            parameters=[uuid_param("event_id", "Event UUID")],
            responses={**json_response("EventSales"), **org_err},
        )
    }
    p["/organizer/sales"] = {
        "get": op(
            "getOrganizerTotalSales",
            "Get total sales",
            org,
            security=org_sec,
            responses={
                "200": {
                    "description": "Success",
                    "content": {"application/json": {"schema": {"type": "object", "properties": {"total_sales": {"type": "string"}}}}},
                },
                **org_err,
            },
        )
    }
    p["/organizer/sales/summary"] = {
        "get": op("getOrganizerSalesSummary", "Get sales summary", org, security=org_sec, responses={**json_response("SalesSummary"), **org_err})
    }
    p["/organizer/dashboard"] = {
        "get": op("getOrganizerDashboard", "Organizer dashboard", org, security=org_sec, responses={**json_response("OrganizerDashboard"), **org_err})
    }
    p["/organizer/reports/period"] = {
        "get": op(
            "getOrganizerPeriodReport",
            "Organizer period report",
            org,
            security=org_sec,
            parameters=DATE_RANGE_PARAMS,
            responses={**json_response("OrganizerPeriodSummary"), **org_err},
        )
    }
    p["/organizer/reports/monthly"] = {
        "get": op(
            "getOrganizerMonthlyReport",
            "Organizer monthly report",
            org,
            security=org_sec,
            parameters=DATE_RANGE_PARAMS,
            responses={**json_array("OrganizerMonthlyItem"), **org_err},
        )
    }
    p["/organizer/reports/category"] = {
        "get": op(
            "getOrganizerCategoryReport",
            "Organizer category report",
            org,
            security=org_sec,
            parameters=DATE_RANGE_PARAMS,
            responses={**json_array("CategoryBreakdownItem"), **org_err},
        )
    }
    p["/organizer/profile"] = {
        "get": op("getOrganizerProfile", "Get organizer profile", org, security=org_sec, responses={**json_response("Organizer"), **org_err}),
        "put": op(
            "updateOrganizerProfile",
            "Update organizer profile",
            org,
            security=org_sec,
            request_body={
                "required": True,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "organizer_name": {"type": "string"},
                                "contact_person": {"type": "string"},
                                "phone": {"type": "string"},
                            },
                        }
                    }
                },
            },
            responses={**json_response("Organizer"), **org_err},
        ),
    }
    p["/organizer/profile/change-password"] = {
        "post": op(
            "changeOrganizerPassword",
            "Change organizer password",
            org,
            security=org_sec,
            request_body=json_request("ChangePasswordBody"),
            responses={**json_response("MessageResponse"), **org_err},
        )
    }
    p["/organizer/categories"] = {
        "get": op("listOrganizerCategories", "List categories", org, security=org_sec, responses={**json_array("Category"), **org_err})
    }

    adm = ["Admin"]
    adm_sec = bearer()
    adm_err = errors("401", "403", "404", "409", "422", "500")

    p["/admin/organizers"] = {
        "get": op("listAdminOrganizers", "List organizers", adm, security=adm_sec, responses={**json_array("Organizer"), **adm_err})
    }
    p["/admin/organizers/{organizer_id}"] = {
        "get": op(
            "getAdminOrganizer",
            "Get organizer",
            adm,
            security=adm_sec,
            parameters=[uuid_param("organizer_id", "Organizer UUID")],
            responses={**json_response("Organizer"), **adm_err},
        ),
        "put": op(
            "updateAdminOrganizer",
            "Update organizer",
            adm,
            security=adm_sec,
            parameters=[uuid_param("organizer_id", "Organizer UUID")],
            request_body={
                "required": True,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "organizer_name": {"type": "string"},
                                "contact_person": {"type": "string"},
                                "email": {"type": "string", "format": "email"},
                                "phone": {"type": "string"},
                            },
                        }
                    }
                },
            },
            responses={**json_response("Organizer"), **adm_err},
        ),
        "delete": op(
            "deleteAdminOrganizer",
            "Delete organizer",
            adm,
            security=adm_sec,
            parameters=[uuid_param("organizer_id", "Organizer UUID")],
            responses={**json_response("MessageResponse"), **adm_err},
        ),
    }
    archive_org = op(
        "archiveAdminOrganizer",
        "Archive organizer",
        adm,
        security=adm_sec,
        parameters=[uuid_param("organizer_id", "Organizer UUID")],
        responses={**json_response("Organizer"), **adm_err},
    )
    p["/admin/organizers/{organizer_id}/archive"] = {"post": deepcopy(archive_org) | {"operationId": "archiveAdminOrganizerPost"}, "patch": deepcopy(archive_org) | {"operationId": "archiveAdminOrganizerPatch"}}

    p["/admin/categories"] = {
        "get": op("listAdminCategories", "List categories", adm, security=adm_sec, responses={**json_array("Category"), **adm_err}),
        "post": op(
            "createAdminCategory",
            "Create category",
            adm,
            security=adm_sec,
            request_body={
                "required": True,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "required": ["name"],
                            "properties": {
                                "name": {"type": "string"},
                                "description": {"type": "string"},
                                "is_default": {"type": "boolean", "default": False},
                            },
                        }
                    }
                },
            },
            responses={"201": {"description": "Created", "content": {"application/json": {"schema": ref("Category")}}}, **adm_err},
        ),
    }
    p["/admin/categories/{category_id}"] = {
        "put": op(
            "updateAdminCategory",
            "Update category",
            adm,
            security=adm_sec,
            parameters=[uuid_param("category_id", "Category UUID")],
            request_body={
                "required": True,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "description": {"type": "string"},
                                "is_default": {"type": "boolean"},
                            },
                        }
                    }
                },
            },
            responses={**json_response("Category"), **adm_err},
        ),
        "delete": op(
            "deleteAdminCategory",
            "Delete category",
            adm,
            security=adm_sec,
            parameters=[uuid_param("category_id", "Category UUID")],
            responses={**json_response("MessageResponse"), **adm_err},
        ),
    }
    p["/admin/categories/{category_id}/archive"] = {
        "patch": op(
            "archiveAdminCategory",
            "Archive category",
            adm,
            security=adm_sec,
            parameters=[uuid_param("category_id", "Category UUID")],
            responses={
                "200": {
                    "description": "Category archived or category object returned",
                    "content": {
                        "application/json": {
                            "schema": {
                                "oneOf": [ref("Category"), ref("MessageResponse")],
                            }
                        }
                    },
                },
                **adm_err,
            },
        )
    }

    p["/admin/coupons"] = {
        "get": op("listAdminCoupons", "List coupons", adm, security=adm_sec, responses={**json_array("Coupon"), **adm_err}),
        "post": op(
            "createAdminCoupon",
            "Create coupon",
            adm,
            security=adm_sec,
            request_body={
                "required": True,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "required": ["code", "flat_discount"],
                            "properties": {
                                "code": {"type": "string", "maxLength": 100},
                                "flat_discount": {"type": "number", "exclusiveMinimum": 0},
                                "description": {"type": "string"},
                                "expiry_date": {"type": "string", "format": "date-time"},
                                "is_active": {"type": "boolean", "default": True},
                            },
                        }
                    }
                },
            },
            responses={"201": {"description": "Created", "content": {"application/json": {"schema": ref("Coupon")}}}, **adm_err},
        ),
    }
    p["/admin/coupons/{coupon_id}"] = {
        "get": op(
            "getAdminCoupon",
            "Get coupon",
            adm,
            security=adm_sec,
            parameters=[uuid_param("coupon_id", "Coupon UUID")],
            responses={**json_response("Coupon"), **adm_err},
        ),
        "put": op(
            "updateAdminCoupon",
            "Update coupon",
            adm,
            security=adm_sec,
            parameters=[uuid_param("coupon_id", "Coupon UUID")],
            request_body={
                "required": True,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "code": {"type": "string"},
                                "flat_discount": {"type": "number"},
                                "description": {"type": "string"},
                                "expiry_date": {"type": "string", "format": "date-time"},
                                "is_active": {"type": "boolean"},
                            },
                        }
                    }
                },
            },
            responses={**json_response("Coupon"), **adm_err},
        ),
        "delete": op(
            "deactivateAdminCoupon",
            "Deactivate coupon",
            adm,
            security=adm_sec,
            parameters=[uuid_param("coupon_id", "Coupon UUID")],
            responses={**json_response("MessageResponse"), **adm_err},
            description="Soft delete — sets is_active to false.",
        ),
    }

    p["/admin/events"] = {
        "get": op("listAdminEvents", "List events", adm, security=adm_sec, responses={**json_array("EventInternal"), **adm_err})
    }
    p["/admin/events/{event_id}"] = {
        "get": op(
            "getAdminEvent",
            "Get event",
            adm,
            security=adm_sec,
            parameters=[uuid_param("event_id", "Event UUID")],
            responses={**json_response("EventInternal"), **adm_err},
        ),
        "put": op(
            "updateAdminEvent",
            "Update event",
            adm,
            security=adm_sec,
            parameters=[uuid_param("event_id", "Event UUID")],
            request_body=json_request("EventUpdate"),
            responses={**json_response("EventInternal"), **adm_err},
        ),
        "delete": op(
            "deleteAdminEvent",
            "Delete event",
            adm,
            security=adm_sec,
            parameters=[uuid_param("event_id", "Event UUID")],
            responses={**json_response("MessageResponse"), **adm_err},
        ),
    }
    archive_evt = op(
        "archiveAdminEvent",
        "Archive event",
        adm,
        security=adm_sec,
        parameters=[uuid_param("event_id", "Event UUID")],
        responses={**json_response("EventInternal"), **adm_err},
    )
    p["/admin/events/{event_id}/archive"] = {"post": deepcopy(archive_evt) | {"operationId": "archiveAdminEventPost"}, "patch": deepcopy(archive_evt) | {"operationId": "archiveAdminEventPatch"}}

    p["/admin/profile"] = {
        "get": op("getAdminProfile", "Get admin profile", adm, security=adm_sec, responses={**json_response("Admin"), **adm_err}),
        "put": op(
            "updateAdminProfile",
            "Update admin profile",
            adm,
            security=adm_sec,
            request_body={
                "required": True,
                "content": {
                    "application/json": {
                        "schema": {"type": "object", "properties": {"name": {"type": "string"}}},
                    }
                },
            },
            responses={**json_response("Admin"), **adm_err},
        ),
    }
    p["/admin/profile/change-password"] = {
        "post": op(
            "changeAdminPassword",
            "Change admin password",
            adm,
            security=adm_sec,
            request_body=json_request("ChangePasswordBody"),
            responses={**json_response("MessageResponse"), **adm_err},
        )
    }
    p["/admin/settings/platform-fees"] = {
        "get": op("getPlatformFees", "Get platform fees", adm, security=adm_sec, responses={**json_response("PlatformFees"), **adm_err}),
        "put": op(
            "updatePlatformFees",
            "Update platform fees",
            adm,
            security=adm_sec,
            request_body={
                "required": True,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "required": ["convenience_fee", "gateway_fee"],
                            "properties": {
                                "convenience_fee": {"type": "number", "minimum": 0},
                                "gateway_fee": {"type": "number", "minimum": 0},
                            },
                        }
                    }
                },
            },
            responses={**json_response("PlatformFees"), **adm_err},
        ),
    }
    p["/admin/reports/summary"] = {
        "get": op("getAdminReportsSummary", "Admin dashboard summary", adm, security=adm_sec, responses={**json_response("AdminDashboard"), **adm_err})
    }
    p["/admin/reports/dashboard"] = {
        "get": op("getAdminReportsDashboard", "Admin dashboard (alias)", adm, security=adm_sec, responses={**json_response("AdminDashboard"), **adm_err})
    }
    p["/admin/reports/period"] = {
        "get": op(
            "getAdminReportsPeriod",
            "Admin period summary",
            adm,
            security=adm_sec,
            parameters=DATE_RANGE_PARAMS,
            responses={**json_response("PeriodSummary"), **adm_err},
        )
    }
    p["/admin/reports/monthly"] = {
        "get": op(
            "getAdminReportsMonthly",
            "Admin monthly bar chart",
            adm,
            security=adm_sec,
            parameters=DATE_RANGE_PARAMS + [query_param("months", "Months window when no date range", {"type": "integer", "default": 6})],
            responses={**json_array("MonthlyBarItem"), **adm_err},
        )
    }
    p["/admin/reports/category"] = {
        "get": op(
            "getAdminReportsCategory",
            "Admin category breakdown",
            adm,
            security=adm_sec,
            parameters=DATE_RANGE_PARAMS,
            responses={**json_array("CategoryBreakdownItem"), **adm_err},
        )
    }
    p["/admin/reports/category-breakdown"] = {
        "get": op(
            "getAdminReportsCategoryBreakdown",
            "Admin category breakdown (legacy alias)",
            adm,
            security=adm_sec,
            parameters=DATE_RANGE_PARAMS,
            responses={**json_array("CategoryBreakdownItem"), **adm_err},
        )
    }
    p["/admin/audit-logs"] = {
        "get": op(
            "listAdminAuditLogs",
            "List audit logs",
            adm,
            security=adm_sec,
            parameters=AUDIT_QUERY,
            responses={**json_response("AuditLogPage"), **adm_err},
        )
    }
    p["/admin/audit-logs/{log_id}"] = {
        "get": op(
            "getAdminAuditLog",
            "Get audit log",
            adm,
            security=adm_sec,
            parameters=[uuid_param("log_id", "Audit log UUID")],
            responses={**json_response("AuditLog"), **adm_err},
        )
    }

    return p

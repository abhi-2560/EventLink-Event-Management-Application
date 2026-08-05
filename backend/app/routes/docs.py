from flask import Blueprint, Response, jsonify, render_template_string

from app.openapi import get_openapi_spec

docs_bp = Blueprint("docs", __name__)

SWAGGER_UI_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Event Management API — Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css" />
  <style>body { margin: 0; background: #fafafa; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function () {
      SwaggerUIBundle({
        url: '/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        persistAuthorization: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'StandaloneLayout',
        tryItOutEnabled: true,
        requestInterceptor: function (req) {
          req.credentials = 'include';
          return req;
        },
      });
    };
  </script>
</body>
</html>
"""


@docs_bp.route("/docs")
def swagger_ui():
    return render_template_string(SWAGGER_UI_HTML)


@docs_bp.route("/swagger.json")
def swagger_json():
    return jsonify(get_openapi_spec())


@docs_bp.route("/openapi.yaml")
def openapi_yaml():
    import yaml

    payload = yaml.dump(
        get_openapi_spec(),
        sort_keys=False,
        allow_unicode=True,
        default_flow_style=False,
    )
    return Response(payload, mimetype="application/yaml")

#!/usr/bin/env python3
"""Export and validate the OpenAPI specification."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import yaml
from openapi_spec_validator import validate
from openapi_spec_validator.readers import read_from_filename

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.openapi import get_openapi_spec  # noqa: E402


def main() -> int:
    spec = get_openapi_spec()

    yaml_path = ROOT / "openapi.yaml"
    json_path = ROOT / "swagger.json"

    yaml_path.write_text(
        yaml.dump(spec, sort_keys=False, allow_unicode=True, default_flow_style=False),
        encoding="utf-8",
    )
    json_path.write_text(json.dumps(spec, indent=2), encoding="utf-8")

    validate(spec)
    validate(read_from_filename(str(yaml_path))[0])

    paths = spec.get("paths", {})
    operation_count = sum(len(methods) for methods in paths.values())

    print(f"Wrote {yaml_path}")
    print(f"Wrote {json_path}")
    print(f"OpenAPI validation: OK")
    print(f"Paths: {len(paths)}")
    print(f"Operations: {operation_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

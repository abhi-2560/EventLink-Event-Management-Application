#!/usr/bin/env python3
"""Fix imports using original (pre-refactor) path resolution."""

from __future__ import annotations

import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"

IMPORT_RE = re.compile(
    r"""(?P<prefix>import\s+(?:type\s+)?(?:[\w*{}\s,]+\s+from\s+)?|export\s+.*?\s+from\s+|jest\.mock\()"""
    r"""['"](?P<spec>[^'"]+)['"]""",
    re.MULTILINE,
)

SIDE_EFFECT_IMPORT_RE = re.compile(
    r"""import\s+['"](?P<spec>\.[^'"]+)['"]""",
    re.MULTILINE,
)

# Mirrors refactor_structure.py move rules for old-path resolution.
MOVES: dict[str, str] = {}


def strip_ext(path: str) -> str:
    for ext in (".tsx", ".ts", ".jsx", ".js"):
        if path.endswith(ext):
            return path[: -len(ext)]
    return path


def to_alias(path_no_ext: str) -> str:
    p = path_no_ext.replace("\\", "/")
    if p == "App":
        return "./App"
    if p.startswith("registrant/"):
        return "@registrant/" + p[len("registrant/") :]
    if p.startswith("organizer/"):
        return "@organizer/" + p[len("organizer/") :]
    if p.startswith("shared/"):
        rest = p[len("shared/") :]
        if rest == "constants/index":
            return "@shared/constants"
        return "@shared/" + rest
    if p in ("main", "setupTests", "vite-env"):
        return "./" + p
    return "@" + p


def build_new_to_old() -> dict[str, str]:
    mapping: dict[str, str] = {}
    for old, new in MOVES.items():
        mapping[strip_ext(new.replace("\\", "/"))] = strip_ext(old.replace("\\", "/"))
    for path in SRC.rglob("*"):
        if path.is_file():
            rel = strip_ext(path.relative_to(SRC).as_posix())
            mapping.setdefault(rel, rel)
    return mapping


def build_old_to_new() -> dict[str, str]:
    old_to_new: dict[str, str] = {}
    for old, new in MOVES.items():
        old_to_new[strip_ext(old.replace("\\", "/"))] = strip_ext(new.replace("\\", "/"))
    for path in SRC.rglob("*"):
        if path.is_file():
            rel = strip_ext(path.relative_to(SRC).as_posix())
            old_to_new.setdefault(rel, rel)
    return old_to_new


def build_alias_index() -> dict[str, str]:
    index: dict[str, str] = {}
    for path in SRC.rglob("*"):
        if path.suffix not in {".ts", ".tsx"}:
            continue
        rel = strip_ext(path.relative_to(SRC).as_posix())
        index[rel] = to_alias(rel)
    return index


def resolve_relative(importer: str, spec: str) -> str:
    importer_dir = str(Path(importer).parent)
    resolved = Path(importer_dir, spec).as_posix()
    resolved = os.path.normpath(resolved).replace("\\", "/")
    return strip_ext(resolved)


def populate_moves_from_disk() -> None:
    """Infer moves by comparing expected old layout markers."""
    # Hard-coded from executed refactor (old -> new)
    raw = """
api/axios.ts registrant/api/axios.ts
api/eventApi.ts registrant/api/eventApi.ts
api/paymentApi.ts registrant/api/paymentApi.ts
api/registrationApi.ts registrant/api/registrationApi.ts
api/authApi.ts organizer/api/authApi.ts
api/authSession.ts organizer/api/authSession.ts
api/organizerApi.ts organizer/api/organizerApi.ts
api/organizerAxios.ts organizer/api/organizerAxios.ts
api/organizerAxios.test.ts organizer/api/tests/organizerAxios.test.ts
context/RegistrationContext.tsx registrant/context/RegistrationContext.tsx
context/RegistrationContext.test.tsx registrant/context/tests/RegistrationContext.test.tsx
context/AuthContext.tsx organizer/context/AuthContext.tsx
context/AuthContext.test.tsx organizer/context/tests/AuthContext.test.tsx
hooks/useDebounce.ts registrant/hooks/useDebounce.ts
hooks/useListSearchParams.ts shared/hooks/useListSearchParams.ts
hooks/useListSearchParams.test.tsx shared/hooks/tests/useListSearchParams.test.tsx
layouts/PublicLayout.tsx registrant/layouts/PublicLayout.tsx
layouts/OrganizerLayout.tsx organizer/layouts/OrganizerLayout.tsx
pages/error/NotFound.tsx shared/pages/error/NotFound.tsx
routes/AppRoutes.tsx shared/routes/AppRoutes.tsx
routes/OrganizerRoutes.tsx organizer/routes/OrganizerRoutes.tsx
routes/ProtectedRoute.tsx organizer/routes/ProtectedRoute.tsx
routes/ProtectedRoute.test.tsx organizer/routes/tests/ProtectedRoute.test.tsx
schemas/registrationSchema.ts registrant/schemas/registrationSchema.ts
schemas/organizerSchemas.ts organizer/schemas/organizerSchemas.ts
types/api.ts shared/types/api.ts
types/axios.d.ts shared/types/axios.d.ts
utils/apiError.ts shared/utils/apiError.ts
utils/apiError.test.ts shared/utils/tests/apiError.test.ts
utils/toast.ts shared/utils/toast.ts
utils/constants.ts shared/constants/index.ts
utils/cn.ts shared/lib/cn.ts
utils/eventSearch.ts registrant/utils/eventSearch.ts
utils/eventSearch.test.ts registrant/utils/tests/eventSearch.test.ts
test/test-utils.tsx shared/test/test-utils.tsx
test/fixtures.ts shared/test/fixtures.ts
"""
    for line in raw.strip().splitlines():
        old, new = line.split()
        MOVES[old] = new

    component_dirs = {
        "components/common": "shared/components/common",
        "components/event": "registrant/components/event",
        "components/layout": "registrant/components/layout",
        "components/payment": "registrant/components/payment",
        "components/registration": "registrant/components/registration",
        "components/organizer": "organizer/components",
    }
    for old_prefix, new_prefix in component_dirs.items():
        new_dir = SRC / new_prefix.replace("/", os.sep)
        if new_dir.exists():
            for f in new_dir.rglob("*"):
                if not f.is_file():
                    continue
                rel_new = f.relative_to(SRC).as_posix()
                if "/tests/" in rel_new:
                    rel_old = f"{old_prefix}/{Path(rel_new).name}"
                else:
                    name = f.relative_to(new_dir).as_posix()
                    rel_old = f"{old_prefix}/{name}"
                MOVES[rel_old.replace("\\", "/")] = rel_new.replace("\\", "/")

    page_moves = {
        "pages/public": "registrant/pages/public",
        "pages/registration": "registrant/pages/registration",
        "pages/organizer": "organizer/pages",
    }
    for old_prefix, new_prefix in page_moves.items():
        new_dir = SRC / new_prefix.replace("/", os.sep)
        if new_dir.exists():
            for f in new_dir.rglob("*"):
                if not f.is_file():
                    continue
                rel_new = f.relative_to(SRC).as_posix()
                if "/tests/" in rel_new:
                    name = Path(rel_new).name
                    rel_old = f"{old_prefix}/{name}"
                else:
                    name = f.relative_to(new_dir).as_posix()
                    rel_old = f"{old_prefix}/{name}"
                MOVES[rel_old.replace("\\", "/")] = rel_new.replace("\\", "/")


def target_alias(old_importer: str, spec: str, old_to_new: dict[str, str], alias_index: dict[str, str]) -> str | None:
    if spec.startswith("@") or spec.endswith(".css"):
        return None

    if spec.startswith("."):
        old_target = resolve_relative(old_importer, spec)
    else:
        old_target = strip_ext(spec)

    new_target = old_to_new.get(old_target, old_target)
    new_target = new_target.replace("\\", "/")
    new_target_no_ext = strip_ext(new_target)

    alias = alias_index.get(new_target_no_ext)
    if alias:
        return alias

    # side-effect imports may omit extension
    for ext in (".ts", ".tsx"):
        candidate = alias_index.get(new_target_no_ext)
        if candidate:
            return candidate
    return None


def fix_all() -> int:
    populate_moves_from_disk()
    new_to_old = build_new_to_old()
    old_to_new = build_old_to_new()
    alias_index = build_alias_index()
    changed = 0

    for path in sorted(SRC.rglob("*")):
        if path.suffix not in {".ts", ".tsx"}:
            continue
        rel = strip_ext(path.relative_to(SRC).as_posix())
        old_importer = new_to_old.get(rel, rel)
        content = path.read_text(encoding="utf-8")
        file_changed = False

        def repl(match: re.Match[str]) -> str:
            nonlocal file_changed
            prefix = match.group("prefix")
            spec = match.group("spec")
            alias = target_alias(old_importer, spec, old_to_new, alias_index)
            if not alias or alias == spec:
                return match.group(0)
            file_changed = True
            return f"{prefix}'{alias}'"

        new_content = IMPORT_RE.sub(repl, content)

        def side_effect_repl(match: re.Match[str]) -> str:
            nonlocal file_changed
            spec = match.group("spec")
            alias = target_alias(old_importer, spec, old_to_new, alias_index)
            if not alias or alias == spec:
                return match.group(0)
            file_changed = True
            return f"import '{alias}'"

        new_content = SIDE_EFFECT_IMPORT_RE.sub(side_effect_repl, new_content)
        if file_changed:
            path.write_text(new_content, encoding="utf-8")
            changed += 1
            print(f"FIXED {rel}")
    return changed


if __name__ == "__main__":
    count = fix_all()
    print(f"Updated {count} files.")

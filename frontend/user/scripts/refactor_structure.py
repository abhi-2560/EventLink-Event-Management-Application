#!/usr/bin/env python3
"""Structural refactor: move frontend/user/src into registrant/organizer/shared modules."""

from __future__ import annotations

import os
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"

IMPORT_RE = re.compile(
    r"""(?P<prefix>import\s+(?:type\s+)?(?:[\w*{}\s,]+\s+from\s+)?|export\s+.*?\s+from\s+)"""
    r"""['"](?P<spec>[^'"]+)['"]""",
    re.MULTILINE,
)

TEST_SUFFIXES = (".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx")


def is_test_file(path: Path) -> bool:
    return any(path.name.endswith(s) for s in TEST_SUFFIXES)


def dest_for_test(src_rel: str) -> str:
    """Place test files under tests/ within their module."""
    p = Path(src_rel)
    if p.parts[0] == "pages" and len(p.parts) >= 2:
        if p.parts[1] == "organizer":
            return str(Path("organizer") / "pages" / "tests" / p.name)
        if p.parts[1] in ("public", "registration"):
            return str(Path("registrant") / "pages" / p.parts[1] / "tests" / p.name)
    if p.parts[0] == "api":
        return str(Path("organizer") / "api" / "tests" / p.name)
    if p.parts[0] == "routes":
        return str(Path("organizer") / "routes" / "tests" / p.name)
    if p.parts[0] == "context":
        role = "registrant" if "Registration" in p.name else "organizer"
        return str(Path(role) / "context" / "tests" / p.name)
    if p.parts[0] == "hooks":
        return str(Path("shared") / "hooks" / "tests" / p.name)
    if p.parts[0] == "utils":
        role = "registrant" if p.stem == "eventSearch" else "shared"
        return str(Path(role) / "utils" / "tests" / p.name)
    if p.parts[0] == "components":
        if p.parts[1] == "common":
            return str(Path("shared") / "components" / "common" / "tests" / p.name)
        if p.parts[1] == "organizer":
            return str(Path("organizer") / "components" / "tests" / p.name)
    return str(Path("shared") / "tests" / p.name)


def dest_for_source(src_rel: str) -> str | None:
    p = Path(src_rel)
    name = p.name

    if is_test_file(p):
        return dest_for_test(src_rel)

    # root files stay put
    if src_rel in ("main.tsx", "index.css", "setupTests.ts", "vite-env.d.ts"):
        return None
    if src_rel.startswith("assets/"):
        return None

    if src_rel.startswith("test/"):
        return str(Path("shared") / src_rel)

    if p.parts[0] == "api":
        registrant = {"axios.ts", "eventApi.ts", "paymentApi.ts", "registrationApi.ts"}
        if name in registrant:
            return str(Path("registrant") / "api" / name)
        return str(Path("organizer") / "api" / name)

    if p.parts[0] == "components":
        sub = p.parts[1]
        rest = Path(*p.parts[2:]) if len(p.parts) > 2 else Path()
        if sub == "common":
            return str(Path("shared") / "components" / "common" / rest)
        if sub == "organizer":
            return str(Path("organizer") / "components" / rest)
        if sub in ("event", "layout", "payment", "registration"):
            return str(Path("registrant") / "components" / sub / rest)
        return None

    if p.parts[0] == "context":
        if "Registration" in name:
            return str(Path("registrant") / "context" / name)
        return str(Path("organizer") / "context" / name)

    if p.parts[0] == "hooks":
        if name == "useDebounce.ts":
            return str(Path("registrant") / "hooks" / name)
        return str(Path("shared") / "hooks" / name)

    if p.parts[0] == "layouts":
        if name == "PublicLayout.tsx":
            return str(Path("registrant") / "layouts" / name)
        return str(Path("organizer") / "layouts" / name)

    if p.parts[0] == "pages":
        if len(p.parts) >= 2 and p.parts[1] == "organizer":
            return str(Path("organizer") / "pages" / name)
        if len(p.parts) >= 2 and p.parts[1] == "public":
            return str(Path("registrant") / "pages" / "public" / name)
        if len(p.parts) >= 2 and p.parts[1] == "registration":
            return str(Path("registrant") / "pages" / "registration" / name)
        if len(p.parts) >= 2 and p.parts[1] == "error":
            return str(Path("shared") / "pages" / "error" / name)
        return None

    if p.parts[0] == "routes":
        if name == "AppRoutes.tsx":
            return str(Path("shared") / "routes" / name)
        return str(Path("organizer") / "routes" / name)

    if p.parts[0] == "schemas":
        if name == "registrationSchema.ts":
            return str(Path("registrant") / "schemas" / name)
        return str(Path("organizer") / "schemas" / name)

    if p.parts[0] == "types":
        return str(Path("shared") / "types" / name)

    if p.parts[0] == "utils":
        if name == "eventSearch.ts":
            return str(Path("registrant") / "utils" / name)
        if name == "cn.ts":
            return str(Path("shared") / "lib" / name)
        if name == "constants.ts":
            return str(Path("shared") / "constants" / "index.ts")
        return str(Path("shared") / "utils" / name)

    return None


def collect_moves() -> dict[str, str]:
    moves: dict[str, str] = {}
    for path in sorted(SRC.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(SRC).as_posix()
        dest = dest_for_source(rel)
        if dest and dest != rel:
            moves[rel] = dest
    return moves


def module_key(path_no_ext: str) -> str:
    return path_no_ext.replace("\\", "/")


def to_alias(path_no_ext: str) -> str:
    p = module_key(path_no_ext)
    if p.startswith("registrant/"):
        return "@registrant/" + p[len("registrant/") :]
    if p.startswith("organizer/"):
        return "@organizer/" + p[len("organizer/") :]
    if p.startswith("shared/"):
        rest = p[len("shared/") :]
        if rest == "constants/index":
            return "@shared/constants"
        return "@shared/" + rest
    return "@" + p


def strip_ext(path: str) -> str:
    for ext in (".tsx", ".ts", ".jsx", ".js"):
        if path.endswith(ext):
            return path[: -len(ext)]
    return path


def build_alias_map(moves: dict[str, str]) -> dict[str, str]:
    alias_map: dict[str, str] = {}

    def register(old_rel: str, new_rel: str) -> None:
        old_key = module_key(strip_ext(old_rel))
        new_key = module_key(strip_ext(new_rel))
        alias_map[old_key] = to_alias(new_key)

    for old, new in moves.items():
        register(old, new)

    # unmoved modules under old paths that still exist at new canonical locations
    for old_rel, new_rel in list(moves.items()):
        old_key = module_key(strip_ext(old_rel))
        if old_key not in alias_map:
            alias_map[old_key] = to_alias(strip_ext(new_rel))

    # root-level shortcuts from old import paths
    extra = {
        "components/common": "shared/components/common",
        "components/organizer": "organizer/components",
        "components/event": "registrant/components/event",
        "components/layout": "registrant/components/layout",
        "components/payment": "registrant/components/payment",
        "components/registration": "registrant/components/registration",
        "context/RegistrationContext": "registrant/context/RegistrationContext",
        "context/AuthContext": "organizer/context/AuthContext",
        "layouts/PublicLayout": "registrant/layouts/PublicLayout",
        "layouts/OrganizerLayout": "organizer/layouts/OrganizerLayout",
        "pages/public": "registrant/pages/public",
        "pages/registration": "registrant/pages/registration",
        "pages/organizer": "organizer/pages",
        "pages/error/NotFound": "shared/pages/error/NotFound",
        "routes/AppRoutes": "shared/routes/AppRoutes",
        "routes/OrganizerRoutes": "organizer/routes/OrganizerRoutes",
        "routes/ProtectedRoute": "organizer/routes/ProtectedRoute",
        "schemas/registrationSchema": "registrant/schemas/registrationSchema",
        "schemas/organizerSchemas": "organizer/schemas/organizerSchemas",
        "test/test-utils": "shared/test/test-utils",
        "test/fixtures": "shared/test/fixtures",
        "utils/constants": "shared/constants/index",
        "utils/cn": "shared/lib/cn",
    }
    for old_prefix, new_prefix in extra.items():
        alias_map.setdefault(old_prefix, to_alias(new_prefix))

    api_files = {
        "api/axios": "registrant/api/axios",
        "api/eventApi": "registrant/api/eventApi",
        "api/paymentApi": "registrant/api/paymentApi",
        "api/registrationApi": "registrant/api/registrationApi",
        "api/authApi": "organizer/api/authApi",
        "api/authSession": "organizer/api/authSession",
        "api/organizerApi": "organizer/api/organizerApi",
        "api/organizerAxios": "organizer/api/organizerAxios",
    }
    for old_prefix, new_prefix in api_files.items():
        alias_map.setdefault(old_prefix, to_alias(new_prefix))

    hook_files = {
        "hooks/useDebounce": "registrant/hooks/useDebounce",
        "hooks/useListSearchParams": "shared/hooks/useListSearchParams",
    }
    for old_prefix, new_prefix in hook_files.items():
        alias_map.setdefault(old_prefix, to_alias(new_prefix))

    util_files = {
        "utils/apiError": "shared/utils/apiError",
        "utils/toast": "shared/utils/toast",
        "utils/eventSearch": "registrant/utils/eventSearch",
    }
    for old_prefix, new_prefix in util_files.items():
        alias_map.setdefault(old_prefix, to_alias(new_prefix))

    type_files = {
        "types/api": "shared/types/api",
    }
    for old_prefix, new_prefix in type_files.items():
        alias_map.setdefault(old_prefix, to_alias(new_prefix))

    return alias_map


def resolve_old_import(importer_old: str, spec: str) -> str | None:
    importer_dir = str(Path(importer_old).parent)
    if spec.startswith("."):
        resolved = Path(importer_dir, spec).as_posix()
        resolved = os.path.normpath(resolved).replace("\\", "/")
    else:
        resolved = spec
    return strip_ext(resolved)


def lookup_alias(resolved: str, alias_map: dict[str, str]) -> str | None:
    key = module_key(resolved)
    if key in alias_map:
        return alias_map[key]
    # index fallback for constants
    if key.endswith("/index"):
        parent = key[: -len("/index")]
        if parent in alias_map:
            return alias_map[parent]
    return None


def reverse_moves(moves: dict[str, str]) -> dict[str, str]:
    return {new: old for old, new in moves.items()}


def rewrite_imports(moves: dict[str, str]) -> None:
    alias_map = build_alias_map(moves)
    reverse = reverse_moves(moves)

    files = [p for p in SRC.rglob("*") if p.is_file() and p.suffix in {".ts", ".tsx"}]

    for file_path in files:
        rel = file_path.relative_to(SRC).as_posix()
        old_importer = reverse.get(rel, rel)

        content = file_path.read_text(encoding="utf-8")
        changed = False

        def repl(match: re.Match[str]) -> str:
            nonlocal changed
            prefix = match.group("prefix")
            spec = match.group("spec")
            if spec.startswith("@") or spec.endswith(".css"):
                return match.group(0)

            resolved = resolve_old_import(old_importer, spec)
            if not resolved:
                return match.group(0)

            alias = lookup_alias(resolved, alias_map)
            if not alias:
                return match.group(0)

            changed = True
            return f"{prefix}'{alias}'"

        new_content = IMPORT_RE.sub(repl, content)
        if changed:
            file_path.write_text(new_content, encoding="utf-8")


def execute_moves(moves: dict[str, str]) -> None:
    # deepest paths first to avoid conflicts
    for old, new in sorted(moves.items(), key=lambda item: len(item[0]), reverse=True):
        src = SRC / old
        dst = SRC / new
        if not src.exists():
            print(f"SKIP missing: {old}")
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src), str(dst))
        print(f"MOVED {old} -> {new}")

    # remove empty directories
    for path in sorted(SRC.rglob("*"), reverse=True):
        if path.is_dir() and not any(path.iterdir()):
            path.rmdir()
            print(f"RMDIR {path.relative_to(SRC)}")


def create_app_tsx() -> None:
    app = """import { Toaster } from 'react-hot-toast';
import AppRoutes from '@shared/routes/AppRoutes';
import AppErrorBoundary from '@shared/components/common/AppErrorBoundary';
import ServerAvailabilityBanner from '@shared/components/common/ServerAvailabilityBanner';

export default function App() {
  return (
    <AppErrorBoundary>
      <ServerAvailabilityBanner />
      <AppRoutes />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </AppErrorBoundary>
  );
}
"""
    (SRC / "App.tsx").write_text(app, encoding="utf-8")


def update_main_tsx() -> None:
    main = """import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegistrationProvider } from '@registrant/context/RegistrationContext';
import { AuthProvider } from '@organizer/context/AuthContext';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <RegistrationProvider>
            <App />
          </RegistrationProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
"""
    (SRC / "main.tsx").write_text(main, encoding="utf-8")


def main() -> None:
    moves = collect_moves()
    print(f"Planning {len(moves)} moves...")
    execute_moves(moves)
    create_app_tsx()
    update_main_tsx()
    rewrite_imports(moves)
    print("Done.")


if __name__ == "__main__":
    main()

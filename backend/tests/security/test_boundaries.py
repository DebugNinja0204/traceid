"""Boundary test — I9 invariant.
LLM/agent modules must NOT import the status writer.
"""

import ast
import os


def test_llm_modules_do_not_set_status():
    """I9: Modules under agents/ and llm/ cannot import the status writer."""
    base = os.path.join(os.path.dirname(__file__), "..", "..", "app")
    forbidden_dirs = ["agents", "llm"]
    forbidden_import = "app.core.status"
    forbidden_from = "core.status"

    violations: list[str] = []

    for dir_name in forbidden_dirs:
        dir_path = os.path.join(base, dir_name)
        if not os.path.isdir(dir_path):
            continue
        for fname in os.listdir(dir_path):
            if not fname.endswith(".py"):
                continue
            fpath = os.path.join(dir_path, fname)
            with open(fpath) as f:
                try:
                    tree = ast.parse(f.read())
                except SyntaxError:
                    continue
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        if forbidden_import in alias.name or forbidden_from in alias.name:
                            violations.append(f"{dir_name}/{fname}: imports {alias.name}")
                elif isinstance(node, ast.ImportFrom):
                    module = node.module or ""
                    if forbidden_import in module or forbidden_from in module:
                        violations.append(f"{dir_name}/{fname}: imports from {module}")

    assert not violations, f"Status writer imported in forbidden modules: {violations}"

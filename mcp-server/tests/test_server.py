"""Basic offline tests for the LUDOMUNDO MCP adapter.

Run with: python -m unittest discover -s tests -v
These tests do not contact the NAS or use credentials.
"""
import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

os.environ.setdefault("MOTORLAB_API_URL", "http://127.0.0.1:8688/motorlab")
os.environ.setdefault("MOTORLAB_TOKEN", "test-token")

try:
    import mcp  # noqa: F401
except ImportError:
    MCP_AVAILABLE = False
else:
    MCP_AVAILABLE = True


@unittest.skipUnless(MCP_AVAILABLE, "Install mcp[cli] and httpx to run adapter tests")
class AdapterTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location("ludomundo_mcp_server", Path(__file__).parents[1] / "server.py")
        cls.mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.mod)

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.catalog_path = Path(self.tmp.name) / "games.json"
        self.catalog_path.write_text('[{"id":"g1","name":"Juego uno"},{"id":"g2","title":"Juego dos"}]', encoding="utf-8")
        self.old_path = self.mod.CATALOG_PATH
        self.mod.CATALOG_PATH = self.catalog_path

    def tearDown(self):
        self.mod.CATALOG_PATH = self.old_path
        self.tmp.cleanup()

    def test_search_games_matches_name_and_title(self):
        result = self.mod.search_games("juego", 10)
        self.assertEqual([x["id"] for x in result], ["g1", "g2"])

    def test_search_games_caps_limit(self):
        self.assertLessEqual(len(self.mod.search_games("", limit=500)), 30)

    def test_search_games_filters_by_material(self):
        self.catalog_path.write_text('[{"id":"g1","name":"Juego uno","material":"aros"},{"id":"g2","name":"Juego dos","material":"conos"}]', encoding="utf-8")
        result = self.mod.search_games(material="aros")
        self.assertEqual([x["id"] for x in result], ["g1"])

    def test_get_game_returns_exact_id(self):
        self.assertEqual(self.mod.get_game("g1")["name"], "Juego uno")

    def test_get_game_rejects_unknown_id(self):
        with self.assertRaisesRegex(ValueError, "No se encontró"):
            self.mod.get_game("missing")

    def test_write_requires_explicit_confirmation(self):
        with self.assertRaisesRegex(ValueError, "confirm_write=true"):
            self.mod.save_session({"id": "s1", "name": "Prueba", "games": []})

    def test_session_rejects_unknown_game_id(self):
        with self.assertRaisesRegex(ValueError, "ID de juego ausente"):
            self.mod.save_session({"id": "s1", "name": "Prueba", "games": [{"id": "missing"}]}, True)

    def test_save_unit_requires_name_and_id(self):
        with self.assertRaisesRegex(ValueError, "nombre e ID"):
            self.mod.save_unit({"id": "u1"}, True)

    def test_existing_record_requires_explicit_update_confirmation(self):
        existing = [{"id": "u1", "type": "unit", "data": {"id": "u1", "name": "Unidad anterior"}, "deleted": False}]
        with patch.object(self.mod, "_read_records", return_value=existing):
            with self.assertRaisesRegex(ValueError, "confirm_update=true"):
                self.mod.save_unit({"id": "u1", "name": "Unidad nueva"}, confirm_write=True)


if __name__ == "__main__":
    unittest.main()

"""Isolated MCP adapter for LUDOMUNDO. Not deployed by this commit."""
import json
import os
from pathlib import Path
from typing import Any

import httpx
from mcp.server.fastmcp import FastMCP

API_URL = os.environ["MOTORLAB_API_URL"].rstrip("/")
API_TOKEN = os.environ["MOTORLAB_TOKEN"]
CATALOG_PATH = Path(os.environ.get("LUDOMUNDO_CATALOG_PATH", "/app/games.json"))
mcp = FastMCP("LUDOMUNDO", json_response=True)


def _headers() -> dict[str, str]:
    return {"X-MotorLab-Token": API_TOKEN, "Content-Type": "application/json"}


def _read_records() -> list[dict[str, Any]]:
    with httpx.Client(timeout=15) as client:
        response = client.get(f"{API_URL}/sync", headers=_headers())
        response.raise_for_status()
        payload = response.json()
    items = payload.get("items", [])
    if not isinstance(items, list):
        raise ValueError("La API devolvió un formato de sincronización no válido.")
    return items


def _catalog() -> list[dict[str, Any]]:
    payload = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    if isinstance(payload, dict):
        payload = payload.get("games", [])
    if not isinstance(payload, list):
        raise ValueError("El catálogo debe ser una lista de juegos.")
    return payload


@mcp.tool()
def health_check() -> dict[str, str]:
    """Comprueba acceso a la API sin devolver URL, token ni datos sensibles."""
    _read_records()
    return {"status": "ok", "service": "LUDOMUNDO MCP", "api": "reachable"}


@mcp.tool()
def search_games(query: str = "", limit: int = 10) -> list[dict[str, Any]]:
    """Busca juegos del catálogo local por nombre o descripción. Máximo 30 resultados."""
    limit = max(1, min(int(limit), 30))
    q = query.casefold().strip()
    games = _catalog()
    matches = []
    for game in games:
        text = " ".join(str(game.get(k, "")) for k in ("name", "title", "description", "objectives", "material")).casefold()
        if not q or q in text:
            matches.append({k: game.get(k) for k in ("id", "name", "title", "description", "objectives", "material", "age", "space", "intensity") if k in game})
        if len(matches) >= limit:
            break
    return matches


@mcp.tool()
def list_sessions() -> list[dict[str, Any]]:
    """Lista sesiones guardadas, con campos resumidos."""
    return [
        {"id": r.get("id"), "updatedAt": r.get("updatedAt"), "deleted": bool(r.get("deleted")), "data": r.get("data")}
        for r in _read_records() if r.get("type") == "session"
    ]


@mcp.tool()
def list_units() -> list[dict[str, Any]]:
    """Lista unidades didácticas guardadas."""
    return [
        {"id": r.get("id"), "updatedAt": r.get("updatedAt"), "deleted": bool(r.get("deleted")), "data": r.get("data")}
        for r in _read_records() if r.get("type") == "unit"
    ]


def _save_record(record_type: str, record_id: str, data: dict[str, Any], confirm_update: bool = False) -> dict[str, Any]:
    if not record_id or len(record_id) > 200:
        raise ValueError("Identificador no válido.")
    existing = [r for r in _read_records() if r.get("id") == record_id and r.get("type") == record_type]
    if existing and existing[0].get("deleted"):
        raise ValueError("El registro está marcado como eliminado; no se sobrescribe automáticamente.")
    if existing and not confirm_update:
        raise ValueError("El registro ya existe. Para actualizarlo, vuelve a llamar con confirm_update=true tras revisar los cambios.")
    record = {"id": record_id, "type": record_type, "data": data, "updatedAt": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(), "deleted": False}
    with httpx.Client(timeout=15) as client:
        response = client.post(f"{API_URL}/sync", headers=_headers(), json={"items": [record]})
        response.raise_for_status()
    return {"saved": True, "id": record_id, "type": record_type}


@mcp.tool()
def save_session(session: dict[str, Any], confirm_write: bool = False, confirm_update: bool = False) -> dict[str, Any]:
    """Crea/actualiza una sesión. Requiere confirm_write=true. Los IDs de juego deben existir en el catálogo."""
    if not confirm_write:
        raise ValueError("Para escribir, vuelve a llamar con confirm_write=true tras revisar la sesión.")
    name = session.get("name")
    entries = session.get("games")
    if not isinstance(name, str) or not name.strip() or not isinstance(entries, list):
        raise ValueError("La sesión necesita name y una lista games.")
    valid_ids = {str(g.get("id")) for g in _catalog() if g.get("id") is not None}
    for entry in entries:
        if not isinstance(entry, dict) or str(entry.get("id")) not in valid_ids:
            raise ValueError("La sesión contiene un ID de juego ausente del catálogo.")
    record_id = str(session.get("id") or "")
    if not record_id:
        raise ValueError("La sesión necesita un ID único explícito; no se genera automáticamente.")
    return _save_record("session", record_id, session, confirm_update=confirm_update)


@mcp.tool()
def save_unit(unit: dict[str, Any], confirm_write: bool = False, confirm_update: bool = False) -> dict[str, Any]:
    """Crea/actualiza una unidad didáctica. Requiere confirm_write=true."""
    if not confirm_write:
        raise ValueError("Para escribir, vuelve a llamar con confirm_write=true tras revisar la unidad.")
    name = unit.get("name")
    record_id = str(unit.get("id") or "")
    if not isinstance(name, str) or not name.strip() or not record_id:
        raise ValueError("La unidad necesita un nombre e ID único explícito.")
    return _save_record("unit", record_id, unit, confirm_update=confirm_update)


if __name__ == "__main__":
    mcp.run(transport="streamable-http")

from typing import Dict, Set
from fastapi import WebSocket


class ConnectionManager:
    """
    Simple in-process WebSocket connection manager.
    Tracks connections by dream_id so we can push targeted updates.
    """
    def __init__(self) -> None:
        self._connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, dream_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.setdefault(dream_id, set()).add(websocket)

    def disconnect(self, dream_id: int, websocket: WebSocket) -> None:
        conns = self._connections.get(dream_id)
        if not conns:
            return
        if websocket in conns:
            conns.remove(websocket)
        if not conns:
            self._connections.pop(dream_id, None)

    async def send_to(self, dream_id: int, message: dict) -> None:
        conns = list(self._connections.get(dream_id, []))
        for ws in conns:
            try:
                await ws.send_json(message)
            except Exception:
                # Drop broken connection
                self.disconnect(dream_id, ws)


# Global manager instance (process-local)
manager = ConnectionManager()



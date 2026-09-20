"""Real-Time Event Broker for TRACEID.

Provides in-process pub/sub for Server-Sent Events (SSE) live updates across
pipeline stage transitions, human reviews, and evidence discoveries.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

logger = logging.getLogger("traceid.db.events")


class EventBroker:
    """Publish/subscribe broker for real-time investigation events."""

    def __init__(self) -> None:
        self._subscribers: dict[str, list[asyncio.Queue]] = {}

    def subscribe(self, inv_id: str) -> asyncio.Queue:
        """Subscribe to events for a specific investigation."""
        q: asyncio.Queue = asyncio.Queue()
        if inv_id not in self._subscribers:
            self._subscribers[inv_id] = []
        self._subscribers[inv_id].append(q)
        logger.debug("Client subscribed to investigation %s (total: %d)", inv_id, len(self._subscribers[inv_id]))
        return q

    def unsubscribe(self, inv_id: str, q: asyncio.Queue) -> None:
        """Unsubscribe from events for a specific investigation."""
        if inv_id in self._subscribers:
            self._subscribers[inv_id] = [x for x in self._subscribers[inv_id] if x != q]
            if not self._subscribers[inv_id]:
                del self._subscribers[inv_id]
        logger.debug("Client unsubscribed from investigation %s", inv_id)

    def publish(self, inv_id: str, event_data: dict[str, Any]) -> None:
        """Publish an event to all active subscribers for an investigation."""
        if inv_id in self._subscribers:
            for q in self._subscribers[inv_id]:
                try:
                    q.put_nowait(event_data)
                except Exception as e:
                    logger.warning("Failed to queue event for subscriber: %s", e)


# Global singleton instance
event_broker = EventBroker()


def broadcast_event(inv_id: str, event_data: dict[str, Any]) -> None:
    """Convenience helper to broadcast an event safely."""
    try:
        event_broker.publish(inv_id, event_data)
    except Exception as e:
        logger.warning("Error broadcasting event for %s: %s", inv_id, e)

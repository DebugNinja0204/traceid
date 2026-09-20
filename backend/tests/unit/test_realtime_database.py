"""Unit tests for Real-Time Persistent SQLite Database with WAL mode."""

import os
import tempfile
import pytest

from app.db.database import get_connection, init_db
from app.db.events import event_broker
from app.orchestrator.engine import InvestigationStore, CandidateItem


@pytest.fixture
def temp_db():
    """Create a temporary SQLite database for testing."""
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    yield path
    if os.path.exists(path):
        try:
            os.remove(path)
        except OSError:
            pass


def test_database_initialization_and_wal_mode(temp_db):
    """Verify tables are created and WAL journal mode is active."""
    init_db(temp_db)
    with get_connection(temp_db) as conn:
        journal_mode = conn.execute("PRAGMA journal_mode;").fetchone()[0]
        assert journal_mode.lower() == "wal"

        # Check required tables exist
        tables = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table';"
        ).fetchall()
        table_names = {r[0] for r in tables}
        assert "investigations" in table_names
        assert "investigation_images" in table_names
        assert "investigation_entities" in table_names
        assert "review_actions" in table_names
        assert "audit_log" in table_names


def test_investigation_persistence_across_store_restarts(temp_db):
    """Verify that cases, candidates, and audit logs persist when the store is recreated."""
    # 1. Create first store instance and save an investigation
    store1 = InvestigationStore(db_path=temp_db)
    image_sample = b"\x89PNG\r\n\x1a\nfake-image-bytes"
    inv1 = store1.create(
        title="Dr. Alice Chen",
        context={"institution": "Caltech", "role": "Researcher"},
        consent_consenter="Alice Chen",
        consent_scope="BACKGROUND_SCREENING",
        image_bytes=image_sample,
    )
    inv1_id = inv1.id

    # Add candidate and save
    inv1.candidates = [
        CandidateItem(
            id="cand-alice-1",
            name="Alice Chen",
            pair_state="SAME",
            is_primary=True,
            matrix={"supporting": [], "contradicting": [], "unresolved": []},
            primary_organization="Caltech",
            primary_role="Researcher",
            bio_summary="Alice Chen is a Researcher affiliated with Caltech.",
        )
    ]
    store1.save(inv1)

    # 2. Simulate complete server reboot by dropping store1 and instantiating store2 from same DB file
    del store1

    store2 = InvestigationStore(db_path=temp_db)
    loaded = store2.get(inv1_id)

    assert loaded is not None
    assert loaded.id == inv1_id
    assert loaded.title == "Dr. Alice Chen"
    assert loaded.context["institution"] == "Caltech"
    assert loaded.image_bytes == image_sample
    assert len(loaded.candidates) == 1
    assert loaded.candidates[0].primary_organization == "Caltech"
    assert "Caltech" in loaded.candidates[0].bio_summary
    assert len(loaded.audit_trail) >= 1
    assert loaded.audit_trail[0]["action"] == "CONSENT_RECORDED"


def test_review_action_persistence_and_audit(temp_db):
    """Verify human review actions and tamper-evident audit logs persist to database (I11)."""
    store = InvestigationStore(db_path=temp_db)
    inv = store.create(
        title="Bob Smith",
        context={"role": "Engineer"},
        consent_consenter="Bob Smith",
        consent_scope="VERIFY",
    )

    action, status_str = store.add_review_action(
        inv_id=inv.id,
        action_type="CONFIRM",
        target_type="CLAIM",
        target_id="claim-101",
        reason="Verified against government registry",
    )

    assert action.action_type == "CONFIRM"

    # Reload from DB directly
    store_reloaded = InvestigationStore(db_path=temp_db)
    inv_reloaded = store_reloaded.get(inv.id)

    assert len(inv_reloaded.review_actions) == 1
    assert inv_reloaded.review_actions[0].target_id == "claim-101"
    assert inv_reloaded.review_actions[0].reason == "Verified against government registry"

    # Check audit log in DB
    with get_connection(temp_db) as conn:
        audit_rows = conn.execute(
            "SELECT action, actor FROM audit_log WHERE investigation_id = ?;", (inv.id,)
        ).fetchall()
        actions = [r["action"] for r in audit_rows]
        assert "CONSENT_RECORDED" in actions
        assert "REVIEW_ACTION_SUBMITTED" in actions


def test_realtime_event_broker():
    """Verify that event broker pushes events to active subscribers."""
    inv_id = "test-inv-realtime-123"
    q = event_broker.subscribe(inv_id)

    event_payload = {"type": "STAGE_COMPLETED", "stage": "DISCOVERY", "found": 5}
    event_broker.publish(inv_id, event_payload)

    # Read immediately from queue
    received = q.get_nowait()
    assert received["type"] == "STAGE_COMPLETED"
    assert received["stage"] == "DISCOVERY"

    event_broker.unsubscribe(inv_id, q)

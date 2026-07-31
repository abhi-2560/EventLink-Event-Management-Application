"""Add rotating refresh sessions and optional event multimedia."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "d4e5f6a7b8c9"
down_revision = "c3d4e5f6a7b8"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("event", sa.Column("banner_url", sa.Text(), nullable=True))
    op.add_column("event", sa.Column("banner_public_id", sa.String(length=255), nullable=True))

    op.create_table(
        "event_media",
        sa.Column("media_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("event_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("media_type", sa.String(length=10), nullable=False),
        sa.Column("media_url", sa.Text(), nullable=False),
        sa.Column("public_id", sa.String(length=255), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.CheckConstraint("media_type IN ('IMAGE','VIDEO')", name="ck_event_media_type"),
        sa.CheckConstraint("display_order >= 0", name="ck_event_media_display_order"),
        sa.ForeignKeyConstraint(["event_id"], ["event.event_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("media_id"),
    )
    op.create_index("idx_event_media_event_order", "event_media", ["event_id", "display_order"])

    op.create_table(
        "refresh_token",
        sa.Column("token_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("actor_type", sa.String(length=20), nullable=False),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("family_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("replaced_by_token_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.String(length=64), nullable=True),
        sa.CheckConstraint("actor_type IN ('admin','organizer')", name="ck_refresh_token_actor_type"),
        sa.PrimaryKeyConstraint("token_id"),
        sa.UniqueConstraint("token_hash"),
    )
    op.create_index("idx_refresh_token_actor_active", "refresh_token", ["actor_type", "actor_id", "revoked_at"])
    op.create_index("idx_refresh_token_expiry", "refresh_token", ["expires_at"])


def downgrade():
    op.drop_index("idx_refresh_token_expiry", table_name="refresh_token")
    op.drop_index("idx_refresh_token_actor_active", table_name="refresh_token")
    op.drop_table("refresh_token")
    op.drop_index("idx_event_media_event_order", table_name="event_media")
    op.drop_table("event_media")
    op.drop_column("event", "banner_public_id")
    op.drop_column("event", "banner_url")

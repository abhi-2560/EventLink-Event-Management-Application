"""Add frozen event delivery details to payment receipts."""

from alembic import op
import sqlalchemy as sa

revision = "e5f6a7b8c9d0"
down_revision = "d4e5f6a7b8c9"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("payment", sa.Column("event_type", sa.String(length=20), nullable=True))
    op.add_column("payment", sa.Column("venue", sa.String(length=255), nullable=True))
    op.add_column("payment", sa.Column("city", sa.String(length=255), nullable=True))
    op.add_column("payment", sa.Column("state", sa.String(length=255), nullable=True))
    op.add_column("payment", sa.Column("meeting_link", sa.Text(), nullable=True))

    op.execute(
        """
        UPDATE payment AS p
        SET event_type = e.event_type,
            venue = e.venue,
            city = e.city,
            state = e.state,
            meeting_link = e.meeting_link
        FROM event AS e
        WHERE p.event_id = e.event_id
        """
    )


def downgrade():
    op.drop_column("payment", "meeting_link")
    op.drop_column("payment", "state")
    op.drop_column("payment", "city")
    op.drop_column("payment", "venue")
    op.drop_column("payment", "event_type")

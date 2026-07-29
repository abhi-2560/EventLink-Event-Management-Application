"""Drop per-event fee columns; fees are managed via platform_settings only."""

from alembic import op
import sqlalchemy as sa

revision = "a1b2c3d4e5f6"
down_revision = "43c5c0194d37"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("event", schema=None) as batch_op:
        batch_op.drop_constraint("ck_event_convenience_fee_nonnegative", type_="check")
        batch_op.drop_constraint("ck_event_gateway_fee_nonnegative", type_="check")
        batch_op.drop_column("convenience_fee")
        batch_op.drop_column("gateway_fee")


def downgrade():
    with op.batch_alter_table("event", schema=None) as batch_op:
        batch_op.add_column(sa.Column("convenience_fee", sa.Numeric(precision=10, scale=2), server_default=sa.text("0"), nullable=True))
        batch_op.add_column(sa.Column("gateway_fee", sa.Numeric(precision=10, scale=2), server_default=sa.text("0"), nullable=True))
        batch_op.create_check_constraint("ck_event_convenience_fee_nonnegative", "event", "convenience_fee >= 0")
        batch_op.create_check_constraint("ck_event_gateway_fee_nonnegative", "event", "gateway_fee >= 0")

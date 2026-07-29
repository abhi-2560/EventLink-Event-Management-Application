"""Schema cleanup: move platform fees to admin, drop legacy columns."""

from alembic import op
import sqlalchemy as sa

revision = "b2c3d4e5f6a7"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("admin", schema=None) as batch_op:
        batch_op.add_column(sa.Column("convenience_fee", sa.Numeric(precision=10, scale=2), server_default=sa.text("0"), nullable=False))
        batch_op.add_column(sa.Column("gateway_fee", sa.Numeric(precision=10, scale=2), server_default=sa.text("0"), nullable=False))
        batch_op.create_check_constraint("ck_admin_convenience_fee", "convenience_fee >= 0")
        batch_op.create_check_constraint("ck_admin_gateway_fee", "gateway_fee >= 0")

    op.execute(
        """
        UPDATE admin
        SET convenience_fee = COALESCE(
            (SELECT convenience_fee FROM platform_settings WHERE id = 1),
            0
        ),
        gateway_fee = COALESCE(
            (SELECT gateway_fee FROM platform_settings WHERE id = 1),
            0
        )
        """
    )

    op.drop_table("platform_settings")

    with op.batch_alter_table("registration", schema=None) as batch_op:
        batch_op.drop_column("platform_fee")
        batch_op.drop_column("event_type")

    with op.batch_alter_table("payment", schema=None) as batch_op:
        batch_op.drop_column("platform_fee")

    with op.batch_alter_table("organizer", schema=None) as batch_op:
        batch_op.drop_column("platform_fee_generated")


def downgrade():
    op.create_table(
        "platform_settings",
        sa.Column("id", sa.Integer(), server_default=sa.text("1"), nullable=False),
        sa.Column("convenience_fee", sa.Numeric(precision=10, scale=2), server_default=sa.text("0"), nullable=False),
        sa.Column("gateway_fee", sa.Numeric(precision=10, scale=2), server_default=sa.text("0"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.CheckConstraint("convenience_fee >= 0", name="ck_platform_settings_convenience_fee"),
        sa.CheckConstraint("gateway_fee >= 0", name="ck_platform_settings_gateway_fee"),
        sa.CheckConstraint("id = 1", name="ck_platform_settings_singleton"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.execute(
        """
        INSERT INTO platform_settings (id, convenience_fee, gateway_fee)
        SELECT 1,
               COALESCE((SELECT convenience_fee FROM admin ORDER BY created_at ASC LIMIT 1), 0),
               COALESCE((SELECT gateway_fee FROM admin ORDER BY created_at ASC LIMIT 1), 0)
        """
    )

    with op.batch_alter_table("organizer", schema=None) as batch_op:
        batch_op.add_column(sa.Column("platform_fee_generated", sa.Numeric(precision=12, scale=2), server_default=sa.text("0"), nullable=True))

    with op.batch_alter_table("payment", schema=None) as batch_op:
        batch_op.add_column(sa.Column("platform_fee", sa.Numeric(precision=10, scale=2), server_default=sa.text("0"), nullable=True))

    with op.batch_alter_table("registration", schema=None) as batch_op:
        batch_op.add_column(sa.Column("event_type", sa.String(length=20), nullable=True))
        batch_op.add_column(sa.Column("platform_fee", sa.Numeric(precision=10, scale=2), server_default=sa.text("0"), nullable=True))

    with op.batch_alter_table("admin", schema=None) as batch_op:
        batch_op.drop_constraint("ck_admin_gateway_fee", type_="check")
        batch_op.drop_constraint("ck_admin_convenience_fee", type_="check")
        batch_op.drop_column("gateway_fee")
        batch_op.drop_column("convenience_fee")

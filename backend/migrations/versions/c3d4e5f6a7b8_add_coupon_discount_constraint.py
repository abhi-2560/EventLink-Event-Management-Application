"""Add the coupon discount database invariant.

The ORM model already declares this check, but existing databases created by
earlier migrations do not receive constraints from SQLAlchemy metadata.
"""

from alembic import op

revision = "c3d4e5f6a7b8"
down_revision = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def upgrade():
    op.create_check_constraint(
        "ck_coupon_flat_discount",
        "coupon",
        "flat_discount >= 0",
    )


def downgrade():
    op.drop_constraint("ck_coupon_flat_discount", "coupon", type_="check")

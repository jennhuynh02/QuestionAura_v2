"""seed demo user

Revision ID: afa86ec82a54
Revises: 87ac3aeb4da0
Create Date: 2026-01-03 14:22:29.490037

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'afa86ec82a54'
down_revision: Union[str, None] = '87ac3aeb4da0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Insert demo user
    op.execute(
        """
        INSERT INTO users (auth0_id, email, username, created_at, updated_at)
        VALUES (
            'demo-user-12345',
            'demo@questionaura.com',
            'demo_user',
            NOW(),
            NOW()
        )
        ON CONFLICT (auth0_id) DO NOTHING;
        """
    )


def downgrade() -> None:
    op.execute("DELETE FROM users WHERE auth0_id = 'demo-user-12345';")



"""add_username_to_users

Revision ID: 87ac3aeb4da0
Revises: c3a4bdd510d0
Create Date: 2026-01-03 07:08:38.788365

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '87ac3aeb4da0'
down_revision: Union[str, None] = 'c3a4bdd510d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Update the username column to have shorter length (20 instead of 50)
    op.alter_column('users', 'username', 
                    type_=sa.String(length=20), 
                    existing_type=sa.String(length=50),
                    nullable=False)


def downgrade() -> None:
    # Reverse the change - restore to varchar(50)
    op.alter_column('users', 'username', 
                    type_=sa.String(length=50), 
                    existing_type=sa.String(length=20),
                    nullable=False)


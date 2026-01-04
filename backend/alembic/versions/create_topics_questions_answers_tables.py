"""create topics questions answers tables

Revision ID: a1b2c3d4e5f6
Revises: afa86ec82a54
Create Date: 2026-01-03 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'afa86ec82a54'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create topics table
    op.create_table('topics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_topics_name'), 'topics', ['name'], unique=True)
    
    # Create questions table
    op.create_table('questions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('topic_id', sa.Integer(), nullable=False),
        sa.Column('ask', sa.Text(), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('asker_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], ),
        sa.ForeignKeyConstraint(['asker_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_questions_topic_id'), 'questions', ['topic_id'], unique=False)
    op.create_index(op.f('ix_questions_asker_id'), 'questions', ['asker_id'], unique=False)
    
    # Create answers table
    op.create_table('answers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.Column('response', sa.Text(), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('responder_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ),
        sa.ForeignKeyConstraint(['responder_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_answers_question_id'), 'answers', ['question_id'], unique=False)
    op.create_index(op.f('ix_answers_responder_id'), 'answers', ['responder_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_answers_responder_id'), table_name='answers')
    op.drop_index(op.f('ix_answers_question_id'), table_name='answers')
    op.drop_table('answers')
    op.drop_index(op.f('ix_questions_asker_id'), table_name='questions')
    op.drop_index(op.f('ix_questions_topic_id'), table_name='questions')
    op.drop_table('questions')
    op.drop_index(op.f('ix_topics_name'), table_name='topics')
    op.drop_table('topics')


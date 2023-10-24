"""adds items table

Revision ID: 796950eba885
Revises: 53e0181d887e
Create Date: 2023-10-24 10:33:23.298180

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '796950eba885'
down_revision = '53e0181d887e'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('subroom',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=128), nullable=True),
    sa.Column('room_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['room_id'], ['room.id'], name=op.f('fk_subroom_room_id_room')),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('item',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=128), nullable=True),
    sa.Column('subroom_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['subroom_id'], ['subroom.id'], name=op.f('fk_item_subroom_id_subroom')),
    sa.PrimaryKeyConstraint('id')
    )
    op.drop_table('sub_room')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('sub_room',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('name', sa.VARCHAR(length=128), autoincrement=False, nullable=True),
    sa.Column('room_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['room_id'], ['room.id'], name='fk_sub_room_room_id_room'),
    sa.PrimaryKeyConstraint('id', name='sub_room_pkey')
    )
    op.drop_table('item')
    op.drop_table('subroom')
    # ### end Alembic commands ###

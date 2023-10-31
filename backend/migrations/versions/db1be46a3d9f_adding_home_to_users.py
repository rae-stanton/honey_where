"""adding home to users

Revision ID: db1be46a3d9f
Revises: e073fa1cf928
Create Date: 2023-10-30 09:12:40.513310

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'db1be46a3d9f'
down_revision = 'e073fa1cf928'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('homes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.drop_table('home')
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('home_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(batch_op.f('fk_user_home_id_homes'), 'homes', ['home_id'], ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('fk_user_home_id_homes'), type_='foreignkey')
        batch_op.drop_column('home_id')

    op.create_table('home',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.PrimaryKeyConstraint('id', name='home_pkey')
    )
    op.drop_table('homes')
    # ### end Alembic commands ###
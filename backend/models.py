from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData

metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

db = SQLAlchemy(metadata=metadata)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String, primary_key=True, nullable=False)

    def __repr__(self):
        return f'(id={self.id}, name={self.name})'

class Home(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    users = db.relationship("User", backpopulates="home")


    def __repr__(self):
        return f'(id={self.id})'

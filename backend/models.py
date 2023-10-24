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
    users = db.relationship("User", back_populates="home")


    def __repr__(self):
        return f'(id={self.id})'

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String(128))
    home_id = db.Column(db.Integer, db.ForeignKey('home.id'))

    home = db.relationship('Home', back_populates='rooms')

class Subroom(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String(128))
    room_id = db.Column(db.Integer, db.ForeignKey("room.id"))

    room = db.relationship("Room", back_populates="subrooms")

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String(128))
    subroom_id = db.Column(db.Integer, db.ForeignKey("subroom.id"))

    subroom = db.relationship("Subroom", back_populates="items")

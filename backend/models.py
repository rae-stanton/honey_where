from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.orm import validates
from flask_bcrypt import Bcrypt

# Instantiating bcrypt here
bcrypt = Bcrypt()

metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

db = SQLAlchemy(metadata=metadata)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    hashed_password = db.Column(db.String(128), nullable=False)
    home_id = db.Column(db.Integer, db.ForeignKey("homes.id", ondelete="SET NULL"))
    home = db.relationship("Home", back_populates="users")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "home_id": self.home_id
        }

    def set_password(self, password):
        self.hashed_password = bcrypt.generate_password_hash(
            password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.hashed_password, password)

    @validates('name')
    def validate_name(self, key, name):
        if not isinstance(name, str):
            raise AssertionError('Name must be a string')
        if len(name) < 2:
            raise AssertionError('Name must be at least two characters long')
        return name

    @validates("email")
    def validate_email(self, key, email):
        if not isinstance(email, str):
            raise AssertionError("Email must be a string")
        if len(email) < 2:
            raise AssertionError("Email must be a minimum of 2 characters long")
        return email
    def __repr__(self):
        return f'(id={self.id}, name={self.name} email={self.email})'


class Home(db.Model):
    __tablename__ = "homes"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    users = db.relationship("User", back_populates="home")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "user_ids": [user.id for user in self.users]
        }

    def __repr__(self):
        return f'(id={self.id}, name={self.name})'


class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128))
    # home_id = db.Column(db.Integer, db.ForeignKey('home.id'))

    # home = db.relationship('Home', back_populates='rooms')


class Subroom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128))
    # room_id = db.Column(db.Integer, db.ForeignKey("room.id"))

    # room = db.relationship("Room", back_populates="subrooms")


class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128))
    # subroom_id = db.Column(db.Integer, db.ForeignKey("subroom.id"))

    # subroom = db.relationship("Subroom", back_populates="items")

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.orm import validates
from flask_bcrypt import Bcrypt
from enum import Enum
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
    home_id = db.Column(db.Integer, db.ForeignKey(
        "homes.id", ondelete="SET NULL"))
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
            raise AssertionError(
                "Email must be a minimum of 2 characters long")
        return email

    def __repr__(self):
        return f'(id={self.id}, name={self.name} email={self.email})'


class Home(db.Model):
    __tablename__ = "homes"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    users = db.relationship("User", back_populates="home")
    rooms = db.relationship("Room", back_populates="home")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "user_ids": [user.id for user in self.users],
            "room_ids": [room.to_dict() for room in self.rooms]
        }

    def __repr__(self):
        return f'(id={self.id}, name={self.name})'


room_subroom_association = db.Table(
    'room_subroom',
    db.Column('room_id', db.Integer, db.ForeignKey('room.id')),
    db.Column('subroom_id', db.Integer, db.ForeignKey('subroom.id'))
)


class RoomType(Enum):
    BEDROOM = "BEDROOM"
    BATHROOM = "BATHROOM"
    GARAGE = "GARAGE"
    KITCHEN = "KITCHEN"
    LIVING_ROOM = "LIVING_ROOM"
    ATTIC = "ATTIC"


# Create a PostgreSQL enum type using SQLAlchemy
room_type_enum = db.Enum(RoomType, name="roomtype")


class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=True)
    room_type = db.Column(room_type_enum, nullable=False)
    home_id = db.Column(db.Integer, db.ForeignKey('homes.id'), nullable=False)
    home = db.relationship('Home', back_populates='rooms')
    subrooms = db.relationship(
        'Subroom', secondary=room_subroom_association, back_populates='rooms')
    items = db.relationship('RoomItems', back_populates='room')

    def to_dict(self, include_items=False, include_subrooms=False):
        room_dict = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'room_type': self.room_type.value if self.room_type else None,
            'home_id': self.home_id,
        }

        if include_items:
            room_dict['items'] = [room_item.item.to_dict()
                                  for room_item in self.items]
        if include_subrooms:
            room_dict['subrooms'] = [subroom.to_dict(
                include_items=False) for subroom in self.subrooms]

        return room_dict

    def __repr__(self):
        return f"<Room(id={self.id}, name={self.name}, room_type={self.room_type})>"


class Subroom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128))
    description = db.Column(db.String(128), nullable=True)
    rooms = db.relationship(
        'Room', secondary=room_subroom_association, back_populates='subrooms')
    items = db.relationship('RoomItems', back_populates='subroom')

    def to_dict(self, include_items=False, include_rooms=False):
        subroom_dict = {
            'id': self.id,
            'name': self.name,
            'rooms': [room.to_dict(include_items=True) for room in self.rooms],
            'items': [room_item.item.to_dict() for room_item in self.items]
        }
        if include_items:
            subroom_dict['items'] = [room_item.item.to_dict()
                                     for room_item in self.items]
        if include_rooms:
            subroom_dict['rooms'] = [room.to_dict(
                include_items=False) for room in self.rooms]
        return subroom_dict


class ItemType(Enum):
    HOUSEHOLD = "HOUSEHOLD"
    DECORATION = "DECORATION"
    TOOL = "TOOL"
    UTENSIL = "UTENSIL"
    APPLIANCE = "APPLIANCE"
    PHOTO = "PHOTO"
    PERSONAL = "PERSONAL"
    ELECTRONIC = "ELECTRONIC"
    CLOTHING = "CLOTHING"
    PET = "PET"
    MISCELLANEOUS = "MISCELLANEOUS"


# Create a PostgreSQL enum type using SQLAlchemy
item_type_enum = db.Enum(ItemType, name="itemtype")


class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128))
    description = db.Column(db.String(128))
    item_type = db.Column(item_type_enum, nullable=False)
    room_items = db.relationship('RoomItems', back_populates='item')

    def to_dict(self):
        location = RoomItems.query.filter_by(item_id=self.id).first()
        room_id = location.room_id if location else None
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'item_type': self.item_type.value if self.item_type else None,
            'room_id': room_id
        }


class RoomItems(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=True)
    subroom_id = db.Column(
        db.Integer, db.ForeignKey('subroom.id'), nullable=True)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)

    # Relationship to Room
    room = db.relationship('Room', back_populates='items')
    # Relationship to Subroom
    subroom = db.relationship('Subroom', back_populates='items')
    # Relationship to Item
    item = db.relationship('Item', back_populates='room_items')

    def to_dict(self):
        return {
            'id': self.id,
            'room_id': self.room_id,
            'subroom_id': self.subroom_id,
            'item_id': self.item_id,
            'item_name': self.item.name if self.item else None,
            'item_description': self.item.description if self.item else None,
            'item_type': self.item.item_type.value if self.item and self.item.item_type else None
        }

    __table_args__ = (
        db.CheckConstraint(
            '(room_id IS NOT NULL AND subroom_id IS NULL) OR (room_id IS NULL AND subroom_id IS NOT NULL)',
            name='check_single_location_for_item'),
    )

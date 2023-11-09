from flask import Flask, make_response, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restful import Resource, Api
from flask_cors import CORS
from models import db, User, Home, Room, RoomType, Item, ItemType, RoomItems, Subroom, room_subroom_association, bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, get_jti, create_refresh_token
from datetime import timedelta

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://raestanton@localhost/honey_where'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
CORS(app)

bcrypt.init_app(app)

app.config['JWT_SECRET_KEY'] = 'your-secret-key'
app.config['JWT_TOKEN_LOCATION'] = ['headers', 'json']
app.config['JWT_BLACKLIST_ENABLED'] = True
app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access']
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']
app.config['PROPAGATE_EXCEPTIONS'] = True

jwt = JWTManager(app)

blacklist = set()


@jwt.token_in_blocklist_loader
def check_if_token_in_blacklist(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return jti in blacklist


@app.route("/")
def hello():
    return "hello, world!"


class Users(Resource):
    def get(self):
        users = User.query.all()
        return jsonify({"users": [user.to_dict() for user in users]})

    def post(self):
        data = request.get_json()
        name = data['name']
        email = data['email']
        password = data['password']

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return {'message': 'Email already registered.'}, 400

        user = User(name=name, email=email)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        return {'message': 'User created successfully!'}, 201


api.add_resource(Users, "/users")


class UserById(Resource):
    def get(self, user_id):
        print(f"Fetching data for user with ID: {user_id}")
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found."}, 404

        user_data = user.to_dict()

        if user.home:
            user_data['home'] = user.home.to_dict()
            user_data['home']['rooms'] = [room.to_dict()
                                          for room in user.home.rooms]

        return jsonify(user_data)

    def patch(self, user_id):
        data = request.get_json()

        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found."}, 404

        if 'name' in data:
            user.name = data['name']

        db.session.commit()

        return {"message": "User updated successfully!", "user": user.to_dict()}, 200

    def delete(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found."}, 404

        db.session.delete(user)
        db.session.commit()
        return {"message": "User deleted successfully!"}, 200


api.add_resource(UserById, "/users/<int:user_id>")

# Homes routes


class HomeResource(Resource):
    def get(self):
        homes = Home.query.all()
        return jsonify({"homes": [home.to_dict() for home in homes]})

    def post(self):
        data = request.get_json()

        user = User.query.filter_by(id=data.get("user_id")).first()
        if not user:
            return {"message": "user not found"}, 404
        home = Home(name=data.get("name"))

        user.home = home   # Associate the user with the created home

        db.session.add(home)
        db.session.commit()

        return {"message": "Home added successfully!"}


api.add_resource(HomeResource, "/homes")


class HomeById(Resource):
    def get(self, home_id):
        home = Home.query.get(home_id)
        if not home:
            return {"message": "Home not found."}, 404
        return jsonify(home.to_dict())

    def patch(self, home_id):
        data = request.get_json()

        # Fetch the home by ID
        home = Home.query.get(home_id)
        if not home:
            return {"message": "Home not found."}, 404

        # Update fields if provided
        if 'name' in data:
            home.name = data['name']

        db.session.commit()

        return {"message": "Home updated successfully!", "home": home.to_dict()}, 200

    def delete(self, home_id):
        home = Home.query.get(home_id)
        if not home:
            return {"message": "Home not found."}, 404

        db.session.delete(home)
        db.session.commit()
        return {"message": "Home deleted successfully!"}, 200


api.add_resource(HomeById, "/homes/<int:home_id>")

# Rooms:


class RoomResource(Resource):
    @jwt_required()
    def get(self):
        current_user_email = get_jwt_identity()
        user = User.query.filter_by(email=current_user_email).first()
        if not user or not user.home:
            return {"message": "User not found or user does not have a home."}, 404

        rooms = Room.query.filter_by(home_id=user.home.id).all()
        return jsonify({"rooms": [room.to_dict(include_items=True) for room in rooms]})

    def post(self):
        data = request.get_json()
        room_name = data.get('name')
        description = data.get('description')
        room_type = data.get('room_type')
        home_id = data.get('home_id')

        room = Room(name=room_name, description=description,
                    room_type=room_type, home_id=home_id)

        db.session.add(room)
        db.session.commit()
        return {"message": "Room created successfully!", "room": room.to_dict()}, 201


api.add_resource(RoomResource, "/rooms")


class RoomByIdResource(Resource):
    def get(self, room_id):
        room = Room.query.get(room_id)
        if not room:
            return {"message": "Room not found."}, 404
        return jsonify(room.to_dict(include_items=True, include_subrooms=True))

    def patch(self, room_id):
        room = Room.query.get(room_id)
        if not room:
            return {"message": "Room not found."}, 404

        data = request.get_json()
        if 'name' in data:
            room.name = data['name']
        if 'description' in data:
            room.description = data['description']
        if 'room_type' in data:
            # Validate if the provided room_type is a valid enum value
            if data['room_type'] not in RoomType.__members__:
                return {"message": f"Invalid room_type. Allowed values are: {', '.join(RoomType.__members__)}."}, 400
            room.room_type = data['room_type']
        if 'home_id' in data:
            # Check if the provided home_id exists before assigning
            home_exists = Home.query.get(data['home_id'])
            if not home_exists:
                return {"message": "Home with provided home_id not found."}, 404
            room.home_id = data['home_id']

        db.session.commit()
        return {"message": "Room updated successfully!", "room": room.to_dict()}, 200

    def delete(self, room_id):
        room = Room.query.get(room_id)
        if not room:
            return {"message": "Room not found."}, 404

        db.session.delete(room)
        db.session.commit()
        return {"message": "Room deleted successfully!"}, 200


api.add_resource(RoomByIdResource, "/rooms/<int:room_id>")


class SubroomResource(Resource):
    @jwt_required()
    def get(self):
        subrooms = Subroom.query.all()
        return jsonify({"subrooms": [subroom.to_dict(include_items=True) for subroom in subrooms]})

    @jwt_required()
    def post(self):
        data = request.get_json()
        subroom_name = data.get('name')
        room_id = data.get('room_id')  # Get room_id from the data

        # Check if the room exists
        room = Room.query.get(room_id)
        if not room:
            return {"message": "Room not found."}, 404

        subroom = Subroom(name=subroom_name)
        room.subrooms.append(subroom)  # Associate the subroom with the room

        db.session.add(subroom)
        db.session.commit()
        return {"message": "Subroom created successfully!", "subroom": subroom.to_dict()}, 201


api.add_resource(SubroomResource, "/subrooms")
# comment to make sure this works


class SubroomByIdResource(Resource):
    @jwt_required
    def get(self, subroom_id):
        subroom = Subroom.query.get(subroom_id)
        if not subroom:
            return {"message": "Subroom not found."}, 404
        return jsonify(subroom.to_dict(include_items=True, include_rooms=True))

    @jwt_required
    def patch(self, subroom_id):
        subroom = Subroom.query.get(subroom_id)
        if not subroom:
            return {"message": "Subroom not found."}, 404

        data = request.get_json()
        if 'name' in data:
            subroom.name = data['name']

        if 'description' in data:
            subroom.description = data['description']
        if 'room_id' in data:
            room_exists = Room.query.get(data['room_id'])
            if not room_exists:
                return {"message": "Room with provided room_id not found."}, 404
            subroom.room_id = data['room_id']

        db.session.commit()
        return {"message": "Subroom updated successfully!", "subroom": subroom.to_dict()}, 200

    @jwt_required
    def delete(self, subroom_id):
        subroom = Subroom.query.get(subroom_id)
        if not subroom:
            return {"message": "Subroom not found."}, 404

        db.session.delete(subroom)
        db.session.commit()
        return {"message": "Subroom deleted successfully!"}, 200


api.add_resource(SubroomByIdResource, "/subrooms/<int:subroom_id>")


class ItemResource(Resource):
    def get(self):
        items = Item.query.all()
        return jsonify({"items": [item.to_dict() for item in items]})

    def post(self):
        data = request.get_json()

        item_name = data.get('name')
        description = data.get('description')
        item_type = data.get('item_type')

        room_id = data.get('room_id')
        subroom_id = data.get('subroom_id')

        if room_id is None and subroom_id is None:
            return {"message": "Either room_id or subroom_id must be provided"}, 400
        if room_id and subroom_id:
            return {"message": "You cannot assign an item to both a room and subroom at the same time."}, 400

        item = Item(name=item_name, description=description,
                    item_type=item_type)
        db.session.add(item)
        db.session.flush()

        room_item = RoomItems(
            room_id=room_id, subroom_id=subroom_id, item_id=item.id)
        db.session.add(room_item)

        db.session.commit()
        return {"message": "Item created successfully!", "item": item.to_dict()}, 201


api.add_resource(ItemResource, "/items")


class RoomItemsResource(Resource):
    def get(self, room_id=None):
        if room_id:
            room_items = RoomItems.query.filter_by(room_id=room_id).all()
            return jsonify({"items": [room_item.to_dict() for room_item in room_items]})
        else:
            room_items = RoomItems.query.all()
            return jsonify({"room_items": [room_item.to_dict() for room_item in room_items]})

    def post(self):
        data = request.get_json()
        room_id = data.get('room_id')
        item_id = data.get('item_id')

        existing = RoomItems.query.filter_by(
            room_id=room_id, item_id=item_id).first()
        if existing:
            return {"message": "The item is already associated with the room."}, 400

        room_item = RoomItems(room_id=room_id, item_id=item_id)
        db.session.add(room_item)
        db.session.commit()
        return {"message": "Item added to room successfully!", "room_item": room_item.to_dict()}, 201


class RoomItemsByIdResource(Resource):
    def get(self, room_id=None, item_id=None):
        if room_id and item_id:
            room_item = RoomItems.query.filter_by(
                room_id=room_id, item_id=item_id).first()
            if not room_item:
                return {"message": "Room-Item association not found."}, 404
            return room_item.to_dict(), 200
        # If only room_id is provided, get all items for that room
        elif room_id:
            room_items = RoomItems.query.filter_by(room_id=room_id).all()
            return {"items": [room_item.to_dict() for room_item in room_items]}, 200

        else:
            room_items = RoomItems.query.all()
            print(room_items)
            return {"room_items": [room_item.to_dict() for room_item in room_items]}, 200

    def delete(self, room_id, item_id):
        room_item = RoomItems.query.filter_by(
            room_id=room_id, item_id=item_id).first()
        if not room_item:
            return {"message": "Room-Item association not found."}, 404

        db.session.delete(room_item)
        db.session.commit()
        return {"message": "Item removed from room successfully!"}, 200

    @jwt_required()
    def patch(self, room_id, item_id):
        data = request.get_json()
        new_room_id = data.get('new_room_id', None)
        new_subroom_id = data.get('new_subroom_id', None)
        new_order = data.get('new_order', None)

        room_item = RoomItems.query.filter_by(
            room_id=room_id, item_id=item_id).first()
        if not room_item:
            return {"message": "Room-Item association not found."}, 404

        if new_room_id is not None:
            room_item.room_id = new_room_id
            room_item.subroom_id = None
        elif new_subroom_id is not None:
            room_item.subroom_id = new_subroom_id

        if new_order is not None:
            room_item.order = new_order

        db.session.commit()
        return {"message": "Item updated successfully!"}, 200


api.add_resource(RoomItemsResource, "/room-items", endpoint='room_items')
api.add_resource(RoomItemsByIdResource,
                 "/room-items/<int:room_id>", endpoint='room_items_by_id')
api.add_resource(RoomItemsByIdResource,
                 "/room-items/<int:room_id>/<int:item_id>", endpoint='room_item_detail')


class TokenRefreshResource(Resource):
    @jwt_required(refresh=True)
    def post(self):
        current_user = get_jwt_identity()
        access_token = create_access_token(identity=current_user)
        return {"access_token": access_token}, 200


api.add_resource(TokenRefreshResource, "/token/refresh")


class LoginResource(Resource):
    def post(self):
        email = request.json.get('email', None)
        password = request.json.get('password', None)
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            access_token = create_access_token(identity=email)
            refresh_token = create_refresh_token(identity=email)
            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user_name": user.name,
                "user_id": user.id
            }, 200
        return {"message": "Invalid email or password."}, 401


api.add_resource(LoginResource, "/login")


class LogoutResource(Resource):
    @jwt_required()
    def post(self):
        # Extracting the access token from the Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or "Bearer " not in auth_header:
            return {"message": "Missing or invalid token"}, 400

        access_token = auth_header.split(" ")[1]

        # Blacklist the access token
        jti_access = get_jti(access_token)
        blacklist.add(jti_access)

        # If the refresh token is provided in the request's JSON, blacklist it as well
        refresh_token = request.json.get('refresh_token', None)
        if refresh_token:
            jti_refresh = get_jti(refresh_token)
            blacklist.add(jti_refresh)

        return {"message": "Successfully logged out."}, 200


api.add_resource(LogoutResource, '/logout')

# Adds ability for "current user to add their home's name if they don't have one"
# This endpoint is only for authenticated users - to edit the home, still use resource from above
# To perform crud actions on a home


class AssignHomeResource(Resource):
    @jwt_required()
    def post(self):
        current_user_email = get_jwt_identity()
        user = User.query.filter_by(email=current_user_email).first()
        if not user:
            return {"message": "User not found."}, 404

        data = request.get_json()
        home_name = data.get("name")

        # Check if user already has a home
        if user.home:
            return {"message": "User already has a home."}, 400

        home = Home(name=home_name)
        user.home = home  # Associate the user with the home
        db.session.add(home)
        db.session.commit()

        return {"message": f"Home {home_name} added successfully!"}, 201


api.add_resource(AssignHomeResource, "/assign_home")


class AssignRoomResource(Resource):
    @jwt_required()
    def post(self):
        current_user_email = get_jwt_identity()
        user = User.query.filter_by(email=current_user_email).first()
        if not user:
            return {"message": "User not found."}, 404

        data = request.get_json()
        room_name = data.get("name")
        room_type = data.get("type")

        # Validates room_type enum(even though it wants to complain)
        if not room_type:
            return {"message": "room_type is required"}, 400
        if room_type not in RoomType._member_names_:
            return {"message": f"Invalid room_type. Allowed values are {list(RoomType._member_names_)}"}, 400

        # Ensure user has a home to assign the room to
        if not user.home:
            return {"message": "User does not have a home."}, 400

        room = Room(name=room_name, room_type=RoomType[room_type])

        # Associate the room with the user's home
        room.home_id = user.home.id
        db.session.add(room)
        db.session.commit()

        return {"message": f"Room '{room_name}' added successfully to {user.home.name}!"}, 201


api.add_resource(AssignRoomResource, "/assign_room")


class AddItemResource(Resource):
    @jwt_required()
    def post(self):
        current_user_email = get_jwt_identity()
        user = User.query.filter_by(email=current_user_email).first()
        if not user:
            return {"message": "User not found."}, 404

        data = request.get_json()
        item_name = data.get("name")
        item_type = data.get("type")
        room_id = data.get("roomId")
        subroom_id = data.get("subroomId")

        # Validate item type enum
        if not item_type:
            return {"message": "item_type is required"}, 400
        if item_type not in ItemType._member_names_:
            return {"message": f"Invalid item_type. Allowed values are {list(ItemType._member_names_)}"}, 400

        # Check if room or subroom exists
        room = Room.query.get(room_id) if room_id else None
        subroom = Subroom.query.get(subroom_id) if subroom_id else None
        if not room and not subroom:
            return {"message": "Room or Subroom not found."}, 404

        # Create a new item
        item = Item(name=item_name, item_type=ItemType[item_type])
        db.session.add(item)
        db.session.flush()  # To get the item's ID after adding it

        if room:
            room_item = RoomItems(room_id=room_id, item_id=item.id)
            return {
                "message": f"Item '{item_name}' added successfully to room '{room.name}'!",
                "item": item.to_dict()
            }, 201
        elif subroom:
            room_item = RoomItems(subroom_id=subroom_id, item_id=item.id)
            return {
                "message": f"Item '{item_name}' added successfully to subroom '{subroom.name}'!",
                "item": item.to_dict()
            }, 201
        db.session.add(room_item)

        db.session.commit()

        return {
            "message": f"Item '{item_name}' added successfully to {'room' if room else 'subroom'}!",
            "item": item.to_dict()
        }, 201


api.add_resource(AddItemResource, "/add_item")


class UserHomeDetailsResource(Resource):
    @jwt_required()
    def get(self):
        current_user_email = get_jwt_identity()
        user = User.query.filter_by(email=current_user_email).first()
        if not user:
            return {"message": "User not found."}, 404

        if not user.home:
            return {"message": "User does not have a home."}, 400

        # Extract the home and room details
        home_details = {
            "name": user.home.name,
            "rooms": []
        }

        for room in user.home.rooms:
            room_details = {
                "id": room.id,
                "name": room.name,
                "room_type": room.room_type.value,
                "items": [{
                    "id": item.id,
                    "name": item.item.name,
                    "item_type": item.item.item_type.value,
                    "room_id": item.room.id if item.room else None,
                    "subroom_id": item.subroom.id if item.subroom else None
                } for item in room.items],
                "subrooms": []
            }

            for subroom in room.subrooms:
                subroom_details = {
                    "id": subroom.id,
                    "name": subroom.name,
                    "items": [{
                        "id": item.id,
                        "name": item.item.name,
                        "item_type": item.item.item_type.value,
                        "room_id": item.room.id if item.room else None,
                        "subroom_id": item.subroom.id if item.subroom else None
                    } for item in subroom.items]
                }
                room_details["subrooms"].append(subroom_details)

            home_details["rooms"].append(room_details)

        return {"home": home_details}, 200


api.add_resource(UserHomeDetailsResource, "/user_home_details")


class UpdateItemOrder(Resource):
    @jwt_required()
    def patch(self):
        data = request.get_json()
        # A list of item_ids in their new order
        item_order = data.get('item_order')

        # Optional: Verify that the items belong to the current user's room or subroom

        for index, item_id in enumerate(item_order):
            room_item = RoomItems.query.filter_by(item_id=item_id).first()
            if room_item:
                room_item.order = index
            else:
                return {"message": f"Item with id {item_id} not found."}, 404

        db.session.commit()
        return {"message": "Items reordered successfully!"}, 200


api.add_resource(UpdateItemOrder, "/update-item-order")


@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        'message': 'Signature verification failed.'
    }), 401


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'message': 'The token has expired.'}), 401


@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return jsonify({'message': 'The token has been revoked.'}), 401


if __name__ == "__main__":
    app.run()

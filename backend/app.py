from flask import Flask, make_response, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restful import Resource, Api
from flask_cors import CORS
from models import db, User, Home, Room, RoomType, Item, RoomItems, Subroom, bcrypt
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

# A simple database for blacklisted tokens
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

            # Note: We've removed the unnecessary loop for rooms.
            # If you have other processing to do with each room, you can reintroduce it.

        return jsonify(user_data)

    def patch(self, user_id):
        data = request.get_json()

        # Fetch the user by ID
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found."}, 404

        # Update fields if provided, will need to add email and password later.
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
    def get(self):
        rooms = Room.query.all()
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
        return jsonify(room.to_dict(include_items=True))


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
    def get(self):
        subrooms = Subroom.query.all()
        return jsonify({"subrooms": [subroom.to_dict(include_items=True) for subroom in subrooms]})

    def post(self):
        data = request.get_json()
        subroom_name = data.get('name')

        subroom = Subroom(name=subroom_name)
        db.session.add(subroom)
        db.session.commit()
        return {"message": "Subroom created successfully!", "subroom": subroom.to_dict()}, 201

api.add_resource(SubroomResource, "/subrooms")

class SubroomByIdResource(Resource):
    def get(self, subroom_id):
        subroom = Subroom.query.get(subroom_id)
        if not subroom:
            return {"message": "Subroom not found."}, 404
        return jsonify(subroom.to_dict(include_items=True))

    def patch(self, subroom_id):
        subroom = Subroom.query.get(subroom_id)
        if not subroom:
            return {"message": "Subroom not found."}, 404

        data = request.get_json()
        if 'name' in data:
            subroom.name = data['name']

        # Add more fields as required for patching
        # (similar to the Room patch method)

        db.session.commit()
        return {"message": "Subroom updated successfully!", "subroom": subroom.to_dict()}, 200

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

        item = Item(name=item_name, description=description, item_type=item_type)
        db.session.add(item)
        db.session.flush()  # Flush to get the item ID

        room_item = RoomItems(room_id=room_id, subroom_id=subroom_id, item_id=item.id)
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

        # Check if the room-item association already exists
        existing = RoomItems.query.filter_by(room_id=room_id, item_id=item_id).first()
        if existing:
            return {"message": "The item is already associated with the room."}, 400

        room_item = RoomItems(room_id=room_id, item_id=item_id)
        db.session.add(room_item)
        db.session.commit()
        return {"message": "Item added to room successfully!", "room_item": room_item.to_dict()}, 201

    def delete(self, room_id, item_id):
        room_item = RoomItems.query.filter_by(room_id=room_id, item_id=item_id).first()
        if not room_item:
            return {"message": "Room-Item association not found."}, 404

        db.session.delete(room_item)
        db.session.commit()
        return {"message": "Item removed from room successfully!"}, 200

api.add_resource(RoomItemsResource, "/room-items", "/room-items/<int:room_id>")


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
                "user_name": user.name
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


class UserHomeDetailsResource(Resource):
    @jwt_required()
    def get(self):
        print(request.headers)

        current_user_email = get_jwt_identity()
        user = User.query.filter_by(email=current_user_email).first()
        if not user:
            return {"message": "User not found."}, 404

        if not user.home:
            return {"message": "User does not have a home."}, 400

        # Extract the home and room details
        home_details = {
            "name": user.home.name,
            "rooms": [{"id": room.id, "name": room.name, "room_type": room.room_type.value} for room in user.home.rooms]
        }

        return {"home": home_details}, 200


api.add_resource(UserHomeDetailsResource, "/user_home_details")


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

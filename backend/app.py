from flask import Flask, make_response, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restful import Resource, Api
from flask_cors import CORS
from models import db, User, bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, get_jti
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
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)

jwt = JWTManager(app)

# A simple database for blacklisted tokens
blacklist = set()

def check_if_token_in_blacklist(decrypted_token):
    return decrypted_token['jti'] in blacklist

jwt.token_in_blacklist_loader(check_if_token_in_blacklist)

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
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found."}, 404
        return jsonify(user.to_dict())

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


class LoginResource(Resource):
    def post(self):
        email = request.json.get('email', None)
        password = request.json.get('password', None)
        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            access_token = create_access_token(identity=email)
            return {"access_token": access_token}, 200
        return {"message": "Invalid email or password."}, 401

api.add_resource(LoginResource, "/login")

class LogoutResource(Resource):
    @jwt_required()
    def post(self):
        jti = get_jti(request.json['access_token'])
        blacklist.add(jti)
        return {"message": "Successfully logged out."}, 200

api.add_resource(LogoutResource, '/logout')

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        'message': 'Signature verification failed.'
    }), 401

if __name__ == "__main__":
    app.run()

from flask import Flask, make_response, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restful import Resource, Api
from flask_cors import CORS
from models import db, User, bcrypt

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://raestanton@localhost/honey_where'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
CORS(app)

bcrypt.init_app(app)

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


if __name__ == "__main__":
    app.run()

from flask import Flask, make_response, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restful import Resource, Api

from models import db, User

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://raestanton@localhost/honey_where'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
# CORS(app)

@app.route("/")
def hello():
    return "hello, world!"

class Users(Resource):
    def get(self):
        users = User.query.all()
        return jsonify({"users": [user.to_dict() for user in users]})

    def post(self):
        data = request.get_json()
        user_id = data['id']  # Extracting the id from the payload
        name = data['name']

        user = User(id=user_id, name=name)  # Initializing the User object with both id and name
        db.session.add(user)
        db.session.commit()

        return {'message': 'User created successfully!'}, 201

api.add_resource(Users, "/users")

if __name__ == "__main__":
    app.run()

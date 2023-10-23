from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from models import db

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://raestanton@localhost/honey_where'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)  # bind db from models.py to Flask app
migrate = Migrate(app, db)

@app.route("/")
def hello():
    return "hello, world!"

if __name__ == "__main__":
    app.run()

from flask import Flask

from flask_cors import CORS

import auth
import testboard 
import user 
import organization
import fs 
import accuracy_testcontroller 
import functional_testcontroller
import testcase

app = Flask(__name__)

CORS(app)

app.register_blueprint(auth.profile)
app.register_blueprint(testboard.profile)
app.register_blueprint(user.profile)
app.register_blueprint(organization.profile)
app.register_blueprint(fs.profile)
app.register_blueprint(testcase.profile)
app.register_blueprint(accuracy_testcontroller.profile)
app.register_blueprint(functional_testcontroller.profile)

















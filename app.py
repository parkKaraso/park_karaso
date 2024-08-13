from flask import Flask

app = Flask(__name__)
app.config.from_pyfile('setting.py')

# createSched
from pages.createSched.createSched import createSched
app.register_blueprint(createSched)

# homePage
from pages.homePage.homePage import homePage
app.register_blueprint(homePage)

# manageStations
from pages.manageStations.manageStations import manageStations
app.register_blueprint(manageStations)

# manageTours
from pages.manageTours.manageTours import manageTours
app.register_blueprint(manageTours)

# view_schedules
from pages.view_schedules.view_schedules import view_schedules
app.register_blueprint(view_schedules)

# reports
from pages.reports.reports import reports
app.register_blueprint(reports)

# navbar
from components.navbar.navbar import navbar
app.register_blueprint(navbar)


if __name__ == '__main__':
    app.run(host=app.config['FLASK_RUN_HOST'], port=int(app.config['FLASK_RUN_PORT']))


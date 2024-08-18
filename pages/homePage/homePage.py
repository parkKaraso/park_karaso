from flask import Blueprint, render_template, request, session

from utilities.db_manager import *

homePage = Blueprint(
    'homePage',
    __name__,
    static_folder='static',
    static_url_path='/homePage',
    template_folder='templates'
)


@homePage.route('/')
def index():
    return render_template('homePage.html')


@homePage.route('/login', methods=['GET'])
def login_func():
    if 'Password' in request.args:
        password = request.args['Password']
        if password == 'karaso2024':
            session['logged_in'] = 'True'
            stations = get_unique_stations_list()
            return render_template('manageStations.html', stations=stations)
        else:
            error_message = "Incorrect password. Please try again."
            return render_template('homePage.html', errorSI=error_message)



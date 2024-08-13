from flask import Blueprint, render_template, request, jsonify

from parkKaraso.utilities.db_manager import *

manageStations = Blueprint(
    'manageStations',
    __name__,
    static_folder='static',
    static_url_path='/manageStations',
    template_folder='templates'
)


@manageStations.route('/manageStations')
def index():
    stations = get_unique_stations_list()
    return render_template('manageStations.html', stations=stations)


@manageStations.route('/addStation', methods=['POST'])
def add_func():
    station = {"name": request.form['name'],
                "maxAge": request.form['maxAge'],
                "minAge": request.form['minAge'],
                "time": request.form['time'],
                "groups": request.form['groups']}
    insert_station(station)
    stations = get_unique_stations_list()
    msg = "התחנה התווספה בהצלחה!"
    return render_template('manageStations.html', stations=stations, message=msg)


@manageStations.route('/editStation', methods=['POST'])
def edit_func():
    station = {"שם תחנה": request.form['stationName'],
                "גיל": [request.form['editMinAge'], request.form['editMaxAge']],
                "זמן סיור": request.form['time']}
    update_station(station)
    stations = get_unique_stations_list()
    msg = "פרטי התחנה התעדכנו בהצלחה!"
    return render_template('manageStations.html', stations=stations, message=msg)


@manageStations.route('/stations/<string:station_name>/', methods=['GET'])
def get_stations(station_name):
    try:
        stations = find_station_by_name(station_name)[0]
        return jsonify(stations), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


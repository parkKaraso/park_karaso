from flask import Blueprint, render_template, request, jsonify

from utilities.db_manager import *

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


@manageStations.route('/addStation', methods=['GET'])
def add_func():
    station = {"name": request.args['name'],
                "maxAge": request.args['maxAge'],
                "minAge": request.args['minAge'],
                "time": request.args['time'],
                "groups": request.args['groups']}
    insert_station(station)
    stations = get_unique_stations_list()
    msg = "התחנה התווספה בהצלחה!"
    return render_template('manageStations.html', stations=stations, message=msg)


@manageStations.route('/editStation', methods=['GET'])
def edit_func():
    station = {"שם תחנה": request.args['stationName'],
                "גיל": [request.args['editMinAge'], request.args['editMaxAge']],
                "זמן סיור": request.args['time']}
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


@manageStations.route('/deleteStation', methods=['GET'])
def deleteStation():
    station_name = request.args.get('name')
    delete_station(station_name)
    stations = get_unique_stations_list()
    msg = "התחנה נמחקה בהצלחה!"
    return render_template('manageStations.html', stations=stations, message=msg)

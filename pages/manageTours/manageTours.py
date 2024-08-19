from flask import Blueprint, render_template, request, jsonify

from utilities.db_manager import *

manageTours = Blueprint(
    'manageTours',
    __name__,
    static_folder='static',
    static_url_path='/manageTours',
    template_folder='templates'
)


@manageTours.route('/manageTours')
def index():
    tours = get_tours_list()
    stations = get_unique_stations_list()
    return render_template('manageTours.html', tours=tours, stations=stations)


@manageTours.route('/addTour', methods=['GET'])
def add_func():
    tour = {"name": request.args['name'],
                "maxAge": request.args['maxAge'],
                "minAge": request.args['minAge'],
                "priority": request.args['priority'],
                "mandatory_list": request.args.getlist('selected_tags'),
                "route": request.args.getlist('add_route')}
    insert_tour(tour)
    tours = get_tours_list()
    stations = get_unique_stations_list()
    msg = "הסיור נוסף בהצלחה!"
    return render_template('manageTours.html', tours=tours, stations=stations, message=msg)


@manageTours.route('/editTour', methods=['GET'])
def edit_func():
    tour = {"name": request.args['name'],
                "maxAge": request.args['maxAge'],
                "minAge": request.args['minAge'],
                "priority": request.args['priority'],
                "mandatory_list": request.args.getlist('selected_tags'),
                "route": request.args.getlist('edit_route')}
    update_tour(tour)
    tours = get_tours_list()
    stations = get_unique_stations_list()
    msg = "פרטי הסיור התעדכנו בהצלחה!"
    return render_template('manageTours.html', tours=tours, stations=stations, message=msg)


@manageTours.route('/tour/<string:tour_name>/', methods=['GET'])
def get_tour(tour_name):
    try:
        tour = find_tour_by_name(tour_name)[0]
        return jsonify(tour), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@manageTours.route('/deleteTour', methods=['GET'])
def deleteTour():
    tour_name = request.args.get('name')
    delete_tour(tour_name)
    tours = get_tours_list()
    stations = get_unique_stations_list()
    msg = "הסיור נמחק בהצלחה!"
    return render_template('manageTours.html', tours=tours, stations=stations, message=msg)

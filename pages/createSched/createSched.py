from flask import Blueprint, render_template, request, flash
import json
from pages.createSched.createScheduleFunc import *
from utilities.db_manager import *

createSched = Blueprint(
    'createSched',
    __name__,
    static_folder='static',
    static_url_path='/createSched',
    template_folder='templates'
)


@createSched.route('/createSched')
def index():
    tours = get_tours_list()
    stations = get_unique_stations_list()
    return render_template('createSched.html', tours=tours, stations=stations, create=True)


@createSched.route('/check_before_submit/<string:date>/', methods=['GET'])
def check_before_submit(date):
    answer = get_schedule_by_date(date)
    if answer is None:
        return 'False'
    else:
        return 'True'


@createSched.route('/create_schedule', methods=['GET'])
def createSchedule():
    date = request.args['schedule_date_input']
    tours_for_today = request.args.getlist('select_tour_name')
    number_of_groups = request.args.getlist('num_of_groups')
    schedule = create_schedule(tours_for_today, number_of_groups)
    schedule_date = date[8:10] + '/' + date[5:7] + '/' + date[0:4]
    unique_stations = get_unique_stations_list()
    answer = get_schedule_by_date(date)
    if answer is None:
        add_schedule(date, schedule)
    else:
        update_schedule_col(date, schedule)
    return render_template('createSched.html',
                               stations=unique_stations,
                               schedule=schedule,
                               schedule_date=schedule_date,
                               create=False)


@createSched.route('/view_schedule/<string:date>/', methods=['GET'])
def view_schedule(date):
    schedule = get_schedule_by_date(date)['schedule']
    unique_stations = get_unique_stations_list()
    schedule_date = date[8:10] + '/' + date[5:7] + '/' + date[0:4]
    return render_template('createSched.html',
                           schedule_date=schedule_date,
                           schedule=schedule,
                           stations=unique_stations,
                           create=False)


@createSched.route('/update_schedule/<string:station_name>/<string:time_slot>/<string:tour_index>/', methods=['GET'])
def update_schedule(station_name, time_slot, tour_index):
    answer = change_assignment(station_name, time_slot, tour_index)
    return answer


@createSched.route('/delete_from_schedule/<string:station_name>/<string:tour_index>/', methods=['GET'])
def delete_from_schedule(station_name, tour_index):
    answer = delete_assignment(station_name, tour_index)
    return answer


@createSched.route('/save_changes/<string:date_str>/<string:schedule_str>/', methods=['GET'])
def save_changes(date_str, schedule_str):
    schedule_data = json.loads(schedule_str)
    update_schedule_col(date_str, schedule_data)
    return 'True'


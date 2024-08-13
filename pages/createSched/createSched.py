from flask import Blueprint, render_template, request
from datetime import datetime
import json
from parkKaraso.pages.createSched.createScheduleFunc import *
from parkKaraso.utilities.db_manager import *

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


@createSched.route('/create_schedule', methods=['POST'])
def createSchedule():
    tours_for_today = request.form.getlist('select_tour_name')
    number_of_groups = request.form.getlist('num_of_groups')
    schedule = create_schedule(tours_for_today, number_of_groups)
    date = request.form['schedule_date_input']
    schedule_date = date[8:10] + '/' + date[5:7] + '/' + date[0:4]
    unique_stations = get_unique_stations_list()
    add_schedule(date, schedule)
    print(get_schedule_by_date(date))
    return render_template('createSched.html',
                           stations=unique_stations,
                           schedule=schedule,
                           schedule_date=schedule_date,
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


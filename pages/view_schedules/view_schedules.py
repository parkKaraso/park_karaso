from flask import Blueprint, render_template, jsonify

from pages.view_schedules.updateScheduleFunc import *
from utilities.db_manager import *

view_schedules = Blueprint(
    'view_schedules',
    __name__,
    static_folder='static',
    static_url_path='/view_schedules',
    template_folder='templates'
)


@view_schedules.route('/view_schedules')
def index():
    station = get_unique_stations_list()
    schedules = get_all_schedules()
    schedules_date = []
    for s in schedules:
        schedules_date.append(s['date'])
    return render_template('view_schedules.html', stations=station, schedules=schedules_date)


@view_schedules.route('/show_schedule/<string:date_data>/')
def show_schedule(date_data):
    schedule = get_schedule_by_date(date_data)
    if schedule is None:
        return jsonify({"success": False})
    else:
        return jsonify({"success": True, "data": schedule})


@view_schedules.route('/update_schedule/<string:station_name>/<string:time_slot>/<string:tour_index>/<string:date_data>/', methods=['GET'])
def update_schedule(station_name, time_slot, tour_index, date_data):
    answer = change_assignment(station_name, time_slot, tour_index, date_data)
    return answer


@view_schedules.route('/delete_from_schedule/<string:station_name>/<string:tour_index>/<string:date_data>/', methods=['GET'])
def delete_from_schedule(station_name, tour_index, date_data):
    answer = delete_assignment(station_name, tour_index, date_data)
    return answer

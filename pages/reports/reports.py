from flask import Blueprint, render_template, request, jsonify

from pages.reports.reportFunc import *

reports = Blueprint(
    'reports',
    __name__,
    static_folder='static',
    static_url_path='/reports',
    template_folder='templates'
)


@reports.route('/reports')
def index():
    return render_template('reports.html')


@reports.route('/get_dashboard_data/<string:from_date>/<string:to_date>/', methods=['GET'])
def get_dashboard_data(from_date, to_date):
    try:
        tours_names = get_tours_names()
        print(tours_names)
        stations_names = get_stations_names()
        print(stations_names)
        schedules = get_schedules_by_dates(from_date, to_date)
        print(schedules)
        tours_appearance = calculate_tours_appearance(schedules)
        print(tours_appearance)
        stations_usage = calculate_stations_usage(schedules)
        print(stations_usage)
        answer = {
            'tours_names': tours_names,
            'stations_names': stations_names,
            'schedules': schedules,
            'tours_appearance': tours_appearance,
            'stations_usage': stations_usage
        }
        return jsonify(answer), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

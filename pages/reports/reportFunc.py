from utilities.db_manager import *
from datetime import datetime


def get_tours_names():
    tours = get_tours_list()
    tours_names = []
    for tour in tours:
        tours_names.append(tour['סיור'])
    return tours_names


def get_stations_names():
    stations = get_unique_stations_original_list()
    stations_names = []
    for station in stations:
        stations_names.append(station['שם תחנה'])
    return stations_names


def get_schedules_by_dates(from_date, to_date):
    from_date_dt = datetime.strptime(from_date, '%Y-%m-%d')
    to_date_dt = datetime.strptime(to_date, '%Y-%m-%d')
    all_schedules = get_all_schedules()
    schedules_by_range = []
    for s in all_schedules:
        date = datetime.strptime(s['date'], '%Y-%m-%d')
        if from_date_dt <= date <= to_date_dt:
            schedules_by_range.append(s)
    return schedules_by_range


def calculate_tours_appearance(schedules):
    tours_names = get_tours_names()
    appearance = {}
    for tour in tours_names:
        appearance[tour] = 0
    for schedule in schedules:
        for t in schedule['schedule']:
            appearance[t['tour_name']] += 1
    return list(appearance.values())


def calculate_stations_usage(schedules):
    stations_names = get_stations_names()
    appearance = {}
    for station in stations_names:
        appearance[station] = 0
    for schedule in schedules:
        for s in schedule['schedule']:
            for time_slot in ['9.0', '9.5', '10.0', '10.5', '11.0', '11.5']:
                if time_slot in s:
                    station = s[time_slot]
                    if station in appearance:
                        appearance[station] += 1
    return list(appearance.values())
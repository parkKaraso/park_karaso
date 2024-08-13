from parkKaraso.utilities.db_manager import *

stations = ()
unique_stations = ()
schedule = []


def init_lists(data_data):
    init_schedule(data_data)
    global unique_stations
    unique_stations = get_unique_stations_list()
    init_stations()


def init_schedule(data_data):
    global schedule
    schedule = get_schedule_by_date(data_data)['schedule']


def init_stations():
    global stations
    stations = get_stations_list()
    stations = sorted(get_stations_list(), key=lambda s: float(s['זמן סיור']), reverse=True)
    global schedule
    for tour in schedule:
        for key in tour:
            if key != 'tour_name':
                init_available_times(float(key), tour[key])


def init_available_times(time_slot, station_name):
    global stations
    name = ''
    if station_name == 'מעבדה של תוכנית חד פעמית' or station_name == 'מעבדת התנסויות':
        name = 'מעבדה'
    else:
        name = station_name
    for s in stations:
        if s['שם תחנה'] == name and time_slot in s['זמנים פנויים']:
            try:
                s['זמנים פנויים'].remove(time_slot)
                return
            except:
                pass


def convert_time_slot(time_slot):
    times = {
        '1': 9.0,
        '2': 9.5,
        '3': 10.0,
        '4': 10.5,
        '5': 11.0,
        '6': 11.5
    }
    return times[time_slot]


def find_station_time(station_name):
    global unique_stations
    for s in unique_stations:
        if s['שם תחנה'] == station_name:
            return s['זמן סיור']


def change_assignment(name, time_slot, tour_index, date_data):
    init_lists(date_data)
    global stations
    global schedule
    print(stations)
    print(schedule)
    time = convert_time_slot(time_slot)
    station_name = ''
    if name == 'מעבדה של תוכנית חד פעמית' or name == 'מעבדת התנסויות':
        station_name = 'מעבדה'
    else:
        station_name = name
    for s in stations:
        if s['שם תחנה'] == station_name and time in s['זמנים פנויים']:
            if float(find_station_time(name)) == 1:
                try:
                    if schedule[int(tour_index)][str(time)] == '' and schedule[int(tour_index)][str(time + 0.5)] == '':
                        schedule[int(tour_index)][str(time)] = name
                        schedule[int(tour_index)][str(time + 0.5)] = name
                        s['זמנים פנויים'].remove(time)
                        try:
                            s['זמנים פנויים'].remove(time + 0.5)
                        except:
                            pass
                        update_schedule_col(date_data, schedule)
                        return 'True'
                except:
                    pass
            else:
                if schedule[int(tour_index)][str(time)] == '':
                    schedule[int(tour_index)][str(time)] = name
                    s['זמנים פנויים'].remove(time)
                    update_schedule_col(date_data, schedule)
                    return 'True'
    return 'False'


def delete_assignment(name, tour_index, date_data):
    global stations
    global schedule
    init_lists(date_data)
    station_name = ''
    if name == 'מעבדה של תוכנית חד פעמית' or name == 'מעבדת התנסויות':
        station_name = 'מעבדה'
    else:
        station_name = name
    tour_schedule = schedule[int(tour_index)]
    times_arr = []
    for key in tour_schedule:
        if tour_schedule[key] == name:
            tour_schedule[key] = ''
            times_arr.append(key)
    for s in stations:
        if s['שם תחנה'] == station_name:
            for time in times_arr:
                s['זמנים פנויים'].append(float(time))
        update_schedule_col(date_data, schedule)
        return 'True'
    return 'False'

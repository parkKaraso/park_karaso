from parkKaraso.utilities.db_manager import *

stations = ()
unique_stations = ()
tours_for_schedule = []
assign_counter = 0
schedule = {}


def init_lists():
    global stations
    stations = ()
    global unique_stations
    unique_stations = ()
    global tours_for_schedule
    tours_for_schedule = []
    global assign_counter
    assign_counter = 0
    global schedule
    schedule = {}


def create_schedule(tours_for_today, number_of_groups):
    init_lists()
    global stations
    stations = sorted(get_stations_list(), key=lambda s: float(s['זמן סיור']), reverse=True)
    global unique_stations
    unique_stations = sorted(get_unique_stations_original_list(), key=lambda s: float(s['זמן סיור']), reverse=True)
    global tours_for_schedule
    tours_for_schedule = create_tours_for_schedule(tours_for_today, number_of_groups)
    global assign_counter
    assign_counter = len(tours_for_schedule) * 6
    global schedule
    for t in range(len(tours_for_schedule)):
        schedule[t] = {'9.0': '', '9.5': '', '10.0': '', '10.5': '', '11.0': '', '11.5': ''}
    assign_mandatory()
    if assign_counter > 0:
        assign_ideal()
    if assign_counter > 0:
        assign_general()
    return create_schedule_arr()


def assign_mandatory():
    for station in unique_stations:
        if is_free_times(station):
            for t in range(len(tours_for_schedule)):
                if is_free_times(station):
                    if station['שם תחנה'] in tours_for_schedule[t]['תחנות חובה']:
                        if assign_station_to_tour(station, t):
                            tours_for_schedule[t]['תחנות חובה'].remove(station['שם תחנה'])
                            if station['שם תחנה'] in tours_for_schedule[t]['מסלול אידיאלי']:
                                tours_for_schedule[t]['מסלול אידיאלי'].remove(station['שם תחנה'])
                else:
                    break


def assign_ideal():
    for station in unique_stations:
        if is_free_times(station):
            for t in range(len(tours_for_schedule)):
                if is_free_times(station):
                    if station['שם תחנה'] in tours_for_schedule[t]['מסלול אידיאלי']:
                        if assign_station_to_tour(station, t):
                            tours_for_schedule[t]['מסלול אידיאלי'].remove(station['שם תחנה'])
                else:
                    break


def assign_general():
    for station in unique_stations:
        if is_free_times(station):
            for t in range(len(tours_for_schedule)):
                if is_free_times(station) and station['שם תחנה'] not in schedule[t].values():
                    if int(station['גיל'][0]) <= int(tours_for_schedule[t]['גיל'][0]) and int(station['גיל'][1]) >= int(tours_for_schedule[t]['גיל'][1]):
                        assign_station_to_tour(station, t)


def assign_station_to_tour(station, tour_index):
    global assign_counter
    station_name = ''
    if station['שם תחנה'] == 'מעבדה של תוכנית חד פעמית' or station['שם תחנה'] == 'מעבדת התנסויות':
        station_name = 'מעבדה'
    else:
        station_name = station['שם תחנה']
    for s in stations:
        if s['שם תחנה'] == station_name:
            for time in s['זמנים פנויים']:
                if float(find_station_time(station)) == 1:
                    try:
                        if schedule[tour_index][str(time)] == '' and schedule[tour_index][str(time+0.5)] == '':
                            schedule[tour_index][str(time)] = station['שם תחנה']
                            schedule[tour_index][str(time+0.5)] = station['שם תחנה']
                            s['זמנים פנויים'].remove(time)
                            try:
                                s['זמנים פנויים'].remove(time + 0.5)
                            except:
                                pass
                            assign_counter -= 2
                            return True
                    except:
                        pass
                else:
                    if schedule[tour_index][str(time)] == '':
                        schedule[tour_index][str(time)] = station['שם תחנה']
                        s['זמנים פנויים'].remove(time)
                        assign_counter -= 1
                        return True
    return False


def find_station_time(station):
    for s in unique_stations:
        if s['שם תחנה'] == station['שם תחנה']:
            return s['זמן סיור']


def is_free_times(station):
    station_name = ''
    if station['שם תחנה'] == 'מעבדה של תוכנית חד פעמית' or station['שם תחנה'] == 'מעבדת התנסויות':
        station_name = 'מעבדה'
    else:
        station_name = station['שם תחנה']
    for s in stations:
        if s['שם תחנה'] == station_name:
            if len(s['זמנים פנויים']) > 0:
                return True
    return False


def create_schedule_arr():
    schedule_arr = []
    for key in schedule:
        tour_schedule = schedule[key]
        tour_schedule['tour_name'] = tours_for_schedule[key]['סיור']
        schedule_arr.append(tour_schedule)
    return schedule_arr



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


def change_assignment(name, time_slot, tour_index):
    global assign_counter
    time = convert_time_slot(time_slot)
    station_name = ''
    if name == 'מעבדה של תוכנית חד פעמית' or name == 'מעבדת התנסויות':
        station_name = 'מעבדה'
    else:
        station_name = name
    for s in stations:
        if s['שם תחנה'] == station_name and time in s['זמנים פנויים']:
            if float(find_station_time(find_station_by_name(name)[0])) == 1:
                try:
                    if schedule[int(tour_index)][str(time)] == '' and schedule[int(tour_index)][str(time + 0.5)] == '':
                        schedule[int(tour_index)][str(time)] = name
                        schedule[int(tour_index)][str(time + 0.5)] = name
                        s['זמנים פנויים'].remove(time)
                        try:
                            s['זמנים פנויים'].remove(time + 0.5)
                        except:
                            pass
                            assign_counter -= 2
                        return 'True'
                except:
                    pass
            else:
                if schedule[int(tour_index)][str(time)] == '':
                    schedule[int(tour_index)][str(time)] = name
                    s['זמנים פנויים'].remove(time)
                    assign_counter -= 1
                    return 'True'
    return 'False'


def delete_assignment(name, tour_index):
    global assign_counter
    station_name = ''
    if name == 'מעבדה של תוכנית חד פעמית' or name == 'מעבדת התנסויות':
        station_name = 'מעבדה'
    else:
        station_name = name
    schedule_dict = schedule[int(tour_index)]
    t_arr = []
    for t in schedule_dict:
        if schedule_dict[t] == name:
            schedule_dict[t] = ''
            t_arr.append(t)
    for s in stations:
        if s['שם תחנה'] == name:
            for time in t_arr:
                s['זמנים פנויים'].append(float(time))
                assign_counter += 1
    return 'True'

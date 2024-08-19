import copy
import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get your MongoDB URI from environment variables
uri = 'mongodb+srv://OmerGiron:WQzOq6WJ4zkKTXM6@cluster0.vkjllid.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

if not uri:
    raise ValueError("No DB_URI found in environment variables")

# Create MongoDB cluster
cluster = MongoClient(uri, server_api=ServerApi('1'))

# Get the specific database and collection
myDatabase = cluster['Park_Karaso']
tours_col = myDatabase['tours']
stations_col = myDatabase['stations']
stations_unique_col = myDatabase['stations_unique']
schedules_col = myDatabase['schedules']


def get_stations_list():
    return list(stations_col.find())


def get_unique_stations_original_list():
    stations_list = list(stations_unique_col.find({}, {"_id": 0, "שם תחנה": 1, "גיל": 1, "זמן סיור": 1}))
    return stations_list


def get_unique_stations_list():
    stations_list = list(stations_unique_col.find({}, { "_id": 0, "שם תחנה": 1, "גיל": 1, "זמן סיור": 1 }))
    for s in range(len(stations_list)):
        age_to_grade = {
            0: "גן",
            1: "א'",
            2: "ב'",
            3: "ג'",
            4: "ד'",
            5: "ה'",
            6: "ו'",
            7: "ז'",
            8: "ח'",
            9: "ט'",
            10: "י'",
            11: "יא'",
            12: "יב'"
        }
        age_range = stations_list[s]['גיל']
        stations_list[s]['גיל'][0] = age_to_grade[int(age_range[0])]
        stations_list[s]['גיל'][1] = age_to_grade[int(age_range[1])]
    return stations_list


def find_station_by_name(station_name):
    my_query = {'שם תחנה': station_name}
    return list(stations_unique_col.find(my_query, {"_id": 0, "שם תחנה": 1, "גיל": 1, "זמן סיור": 1}))


def insert_station(station):
    station_unique_dict = {
        "שם תחנה": station['name'],
        "גיל": [station['minAge'], station['maxAge']],
        "זמן סיור": station['time']}
    stations_unique_col.insert_one(station_unique_dict)
    station_list = []
    station_dict = {
        "שם תחנה": station['name'],
        "גיל": [station['minAge'], station['maxAge']],
        "זמן סיור": station['time'],
        "זמנים פנויים": []}
    if station['time'] == 1:
        station_dict['זמנים פנויים'] = [9.0, 10.0, 11.0]
    else:
        station_dict['זמנים פנויים'] = [9.0, 9.5, 10.0, 10.5, 11.0, 11.5]
    flag = int(station['groups'])
    for x in range(flag):
        station_list.append(station_dict.copy())
    for x in range(flag):
        stations_col.insert_one(station_list[x])


def update_station(station):
    my_query = {'שם תחנה': station['שם תחנה']}
    if station['זמן סיור'] == 1:
        free_times = [9, 10, 11]
    else:
        free_times = [9, 9.5, 10, 10.5, 11, 11.5]
    stations_unique_col.update_one(my_query, { '$set': {'זמן סיור': station['זמן סיור'], 'גיל': station['גיל']}})
    stations_col.update_many(my_query, { '$set': {'זמן סיור': station['זמן סיור'], 'גיל': station['גיל'], 'זמנים פנויים': free_times}})


def delete_station(station_name):
    if station_name == 'מעבדה של תוכנית חד פעמית' or station_name == 'מעבדת התנסויות':
        stations_unique_col.delete_one({'שם תחנה': station_name})
    else:
        stations_unique_col.delete_one({'שם תחנה': station_name})
        stations_col.delete_many({'שם תחנה': station_name})


def get_tours_list():
    tours_list = list(tours_col.find({}, {"_id": 0}))
    for tour in tours_list:
        age_to_grade = {
            0: "גן",
            1: "א'",
            2: "ב'",
            3: "ג'",
            4: "ד'",
            5: "ה'",
            6: "ו'",
            7: "ז'",
            8: "ח'",
            9: "ט'",
            10: "י'",
            11: "יא'",
            12: "יב'"
        }
        age_range = tour['גיל']
        tour['גיל'][0] = age_to_grade[int(age_range[0])]
        tour['גיל'][1] = age_to_grade[int(age_range[1])]
    return tours_list


def insert_tour(tour):
    tour_dict = {
        "סיור": tour['name'],
        "גיל": [tour['minAge'], tour['maxAge']],
        "תעדוף": tour['priority'],
        "תחנות חובה": tour['mandatory_list'],
        "מסלול אידיאלי": tour['route']}
    tours_col.insert_one(tour_dict)


def update_tour(tour):
    my_query = {"סיור": tour['name']}
    tours_col.update_one(my_query, {
        '$set': {"גיל": [tour['minAge'], tour['maxAge']], "תעדוף": tour['priority'], "תחנות חובה": tour['mandatory_list'], "מסלול אידיאלי": tour['route']}})


def find_tour_by_name(tour_name):
    my_query = {'סיור': tour_name}
    return list(tours_col.find(my_query, {"_id": 0}))


def delete_tour(tour_name):
    tours_col.delete_one({'סיור': tour_name})


def create_tours_for_schedule(tours_names, number_of_groups):
    tours_arr = []
    for i in range(len(tours_names)):
        tour = find_tour_by_name(tours_names[i])[0]
        for x in range(int(number_of_groups[i])):
            tours_arr.append(copy.deepcopy(tour))
    sorted_tours_arr = sorted(tours_arr, key=lambda t: t['תעדוף'])
    return sorted_tours_arr


def get_all_schedules():
    return list(schedules_col.find({}, {"_id": 0}))


def get_schedule_by_date(date_data):
    my_query = {'date': date_data}
    return schedules_col.find_one(my_query, {"_id": 0})


def add_schedule(date_data, schedule_data):
    schedule_dict = {
        'date': date_data,
        'schedule': schedule_data
    }
    schedules_col.insert_one(schedule_dict)


def update_schedule_col(date_data, schedule_data):
    my_query = {'date': date_data}
    schedules_col.update_one(my_query, {'$set': {'schedule': schedule_data}})

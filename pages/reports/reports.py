from flask import Blueprint, render_template, request
from utilities.db_manager import *

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

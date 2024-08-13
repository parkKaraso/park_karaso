import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Secret key setting from .env for Flask sessions
SECRET_KEY = os.environ.get('SECRET_KEY')

DB = {
    'uri': os.environ.get('DB_URI')
}

# Flask environment configurations
FLASK_ENV = os.environ.get('FLASK_ENV')
DEBUG = os.environ.get('DEBUG') == 'True'
FLASK_RUN_HOST = os.environ.get('FLASK_RUN_HOST')
FLASK_RUN_PORT = os.environ.get('FLASK_RUN_PORT')

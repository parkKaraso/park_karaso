from flask import Blueprint, session, render_template

navbar = Blueprint(
    'navbar',
    __name__,
    static_folder='static',
    static_url_path='/navbar',
    template_folder='templates'
)


@navbar.route('/logout')
def logout():
    session.clear()
    return render_template('homePage.html')


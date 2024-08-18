document.addEventListener('DOMContentLoaded', init);

const hebrewSettings = {
    months: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
    weekdaysShort: ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''],
    weekdays: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
};

function init() {
    let today = new Date();
    let first_date = new Date(document.getElementById('first_date').textContent);
    from_picker = new Pikaday({
        field: document.getElementById('from_datepicker'),
        firstDay: 0,
        i18n: hebrewSettings,
        defaultDate: first_date,
        minDate: first_date,
        maxDate: today,
        onSelect: function() {
            to_picker.setMinDate(this.getDate());
        }
    });
    to_picker = new Pikaday({
        field: document.getElementById('to_datepicker'),
        firstDay: 0,
        i18n: hebrewSettings,
        defaultDate: today,
        minDate: first_date,
        maxDate: today,
        onSelect: function() {
            from_picker.setMaxDate(this.getDate());
        }
    });
    from_picker.setDate(first_date);
    to_picker.setDate(today);
    document.getElementById('show_data').addEventListener('click', create_dashboard);
    create_dashboard();
    document.getElementById('to_pdf').addEventListener('click', report_to_pdf);
}

function create_dashboard() {
    let from_selectedDate_str = document.getElementById('from_datepicker').value;
    let from_selectedDate = new Date(from_selectedDate_str);
    let from_date = from_selectedDate.getFullYear() + '-' +
                               ('0' + (from_selectedDate.getMonth() + 1)).slice(-2) + '-' +
                               ('0' + from_selectedDate.getDate()).slice(-2);
    let to_selectedDate_str = document.getElementById('to_datepicker').value;
    let to_selectedDate = new Date(to_selectedDate_str);
    let to_date = to_selectedDate.getFullYear() + '-' +
                               ('0' + (to_selectedDate.getMonth() + 1)).slice(-2) + '-' +
                               ('0' + to_selectedDate.getDate()).slice(-2);
    let endpoint = '/get_dashboard_data/' + from_date + '/' + to_date + '/';
    fetch(endpoint).then(response => response.json()).then(data => {
        let tours_names = data['tours_names']
        let stations_names = data['stations_names']
        let schedules = data['schedules']
        let tours_appearance = data['tours_appearance']
        let stations_usage = data['stations_usage']
        create_header(from_selectedDate, to_selectedDate);
        create_summarize_data(schedules, from_selectedDate, to_selectedDate);
        create_line_chart(schedules);
        create_pie_chart(tours_names, tours_appearance);
        create_bar_chart(stations_names, stations_usage);
    });
}

function create_header(from_selectedDate, to_selectedDate) {
    let to_date =
    ('0' + to_selectedDate.getDate()).slice(-2) + '/'
    + ('0' + (to_selectedDate.getMonth() + 1)).slice(-2) + '/'
    + to_selectedDate.getFullYear();
    let from_date =
    ('0' + from_selectedDate.getDate()).slice(-2) + '/'
    + ('0' + (from_selectedDate.getMonth() + 1)).slice(-2) + '/'
    + from_selectedDate.getFullYear();
    let header = document.getElementById('dashboard_header');
    header.textContent = 'דו"ח לתאריכים ' + to_date + ' - ' + from_date;
}

function create_summarize_data(schedules, from_selectedDate, to_selectedDate) {
    let to_date =
    ('0' + to_selectedDate.getDate()).slice(-2) + '/'
    + ('0' + (to_selectedDate.getMonth() + 1)).slice(-2) + '/'
    + to_selectedDate.getFullYear();
    let from_date =
    ('0' + from_selectedDate.getDate()).slice(-2) + '/'
    + ('0' + (from_selectedDate.getMonth() + 1)).slice(-2) + '/'
    + from_selectedDate.getFullYear();
    let header_text = 'בתאריכים ' + to_date + ' - ' + from_date + ' התקיימו:';
    let chart_header = document.getElementById('chart_header');
    chart_header.textContent = header_text
    activity_days = schedules.length;
    number_of_tours = 0;
    for (let i=0; i<schedules.length; i++) {
        number_of_tours += schedules[i]['schedule'].length;
    }
    let sum_container = document.getElementById('sum_of_tours').querySelector('.number');
    sum_container.textContent = number_of_tours.toString();
    let avg_container = document.getElementById('average_of_tours').querySelector('.number');
    let avg = number_of_tours/activity_days;
    avg_container.textContent = avg.toString();
}

function create_line_chart(schedules) {
    schedule_dates = [];
    schedules_num_of_tours = [];
    for (let i=0; i<schedules.length; i++) {
        let date = new Date(schedules[i]['date']);
        schedule_dates.push(date);
        schedules_num_of_tours.push(schedules[i]['schedule'].length);
    }
    let date_array = [];
    let current_date = new Date(Math.min.apply(null, schedule_dates.map(date => date.getTime())));
    let data_array = [];
    while (current_date <= schedule_dates[schedule_dates.length-1]) {
        let formmated_date = ('0' + current_date.getDate()).slice(-2) + '/'
            + ('0' + (current_date.getMonth() + 1)).slice(-2) + '/'
            + current_date.getFullYear();
        date_array.push(formmated_date);
        let index = findDateIndex(schedule_dates, current_date);
        if (index == -1) {
            data_array.push(0);
        }
        else {
            data_array.push(schedules_num_of_tours[index]);
        }
        current_date.setDate(current_date.getDate() + 1);
    }
    console.log(data_array);
    new Chart('line_chart', {
        type: 'line',
        data: {
            labels: date_array,
            datasets: [{
                data: data_array,
                fill: false,
                backgroundColor: "#b91d47"
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'כמות הסיורים לפי תאריכים',
                fontSize: 20,
                fontFamily: 'Tahoma',
                fontStyle: 'bold',
                fontColor: 'black'
            },
            legend: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        stepSize: 1
                    }
                }],
                xAxes: [{
                    ticks: {
                        maxRotation: 90,
                        minRotation: 45
                    }
                }]
            }
        }
    });
}

function create_pie_chart(tours_names, tours_appearance) {
    let barColors = [
        "#b91d47",
        "#00aba9",
        "#2b5797",
        "#e8c3b9",
        "#1e7145",
        "#E15C19",
        "#B4E5A2",
        "#595959",
        "#A02B93",
        "#EE7EBB",
        "#DAD515",
        "#800000",
        "#996633",
        "#FFAE85",
        "#A6A6A6",
        "#83CBEB",
        "#9933FF",
        "#003300",
        "#080808"
    ];
    new Chart('pie_chart', {
        type: 'pie',
        data: {
            labels: tours_names,
            datasets: [{
                backgroundColor: barColors,
                data: tours_appearance
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'פילוח סיורים לפי שם תוכנית',
                fontSize: 20,
                fontFamily: 'Tahoma',
                fontStyle: 'bold',
                fontColor: 'black'
            },
            legend: {
                position: 'left',
                labels: {
                    boxWidth: 20,
                    fontSize: 10,
                    usePointStyle: true
                }
            },
            layout: {
                padding: 20
            }
        }
    });
}

function create_bar_chart(stations_names, stations_usage) {
    let barColors = [
        "#b91d47",
        "#00aba9",
        "#2b5797",
        "#e8c3b9",
        "#1e7145",
        "#E15C19",
        "#B4E5A2",
        "#595959",
        "#A02B93",
        "#EE7EBB",
        "#DAD515",
        "#800000",
        "#996633",
        "#FFAE85",
        "#A6A6A6",
        "#83CBEB",
        "#9933FF",
        "#003300",
        "#080808"
    ];
    new Chart('bar_chart', {
        type: 'bar',
        data: {
            labels: stations_names,
            datasets: [{
                backgroundColor: barColors,
                data: stations_usage
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'ניצולת תחנות',
                fontSize: 20,
                fontFamily: 'Tahoma',
                fontStyle: 'bold',
                fontColor: 'black'
            },
            legend: false,
            scales: {
                xAxes: [{
                    ticks: {
                        maxRotation: 90,
                        minRotation: 45
                    }
                }]
            }
        }
    });
}

async function report_to_pdf() {
    let { jsPDF } = window.jspdf;
    let pdf = new jsPDF('p', 'mm', 'a4');
    let report_header = await html2canvas(document.getElementById('dashboard_header'));
    pdf.addImage(report_header.toDataURL(), 'JPEG', 10, 10, 190, 10);
    let tours_data = await html2canvas(document.getElementById('tours_data'));
    pdf.addImage(tours_data.toDataURL(), 'JPEG', 35, 30, 60, 50);
    let line_chart_canvas = document.getElementById('line_chart');
    pdf.addImage(line_chart_canvas.toDataURL(), 'JPEG', 105, 30, 70, 50);
    let pie_chart_canvas = document.getElementById('pie_chart');
    pdf.addImage(pie_chart_canvas.toDataURL(), 'JPEG', 55, 90, 100, 50);
    let bar_chart_canvas = document.getElementById('bar_chart');
    pdf.addImage(bar_chart_canvas.toDataURL(), 'JPEG', 5, 150, 200, 85);

    pdf.save('downloaded_charts.pdf');
}

function findDateIndex(dates, dateToFind) {
    return dates.findIndex(date =>
        date.getFullYear() === dateToFind.getFullYear() &&
        date.getMonth() === dateToFind.getMonth() &&
        date.getDate() === dateToFind.getDate()
    );
}

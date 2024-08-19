document.addEventListener('DOMContentLoaded', init);
let picker;

const hebrewSettings = {
    months: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
    weekdaysShort: ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''],
    weekdays: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
};

function init() {
    let today = new Date();
    let container = document.getElementById('datepicker');
    picker = new Pikaday({
        field: container,
        bound: false,
        container: container,
        firstDay: 0,
        i18n: hebrewSettings,
        defaultDate: today,
        onSelect: function(date) {
            let selectedDate = date.getFullYear() + '-' +
                               ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
                               ('0' + date.getDate()).slice(-2);
            get_schedule(selectedDate);
            init_calendar_data();
        },
        onDraw: function() {
            init_calendar_data()
        }
    });
    picker.setDate(today);
    let footerHeight = document.querySelector('#footer').offsetHeight;
    document.querySelector('.Main').style.paddingBottom = footerHeight + 10 + 'px';
    let save_btn = document.getElementById('save_schedule');
    save_btn.addEventListener('click', save_changes);
    let pdf_btn = document.getElementById('to_pdf');
    pdf_btn.addEventListener('click', schedule_to_pdf);
}

function init_calendar_data() {
    let schedules_dates = document.getElementById('schedules_dates').textContent;
    schedules_dates = schedules_dates.substring(2, schedules_dates.length - 2).split("', '");
    let calendar_rows = document.querySelectorAll('.pika-row');
    for (let i=0; i<calendar_rows.length; i++){
        let calendar_cells = calendar_rows[i].querySelectorAll('button');
        for (let j=0; j<calendar_cells.length; j++) {
            let year = calendar_cells[j].getAttribute('data-pika-year');
            let month = calendar_cells[j].getAttribute('data-pika-month');
            month = ('0' + (Number(month) + 1)).slice(-2);
            let day = calendar_cells[j].getAttribute('data-pika-day');
            day = ('0' + day).slice(-2);
            let date = year + '-' + month + '-' + day;
            if (schedules_dates.includes(date)) {
                console.log(date);
                calendar_cells[j].style.backgroundColor = '#72D3A2';
                calendar_cells[j].closest('td').style.backgroundColor = '#72D3A2';
            }
            if (calendar_cells[j].closest('td').classList.contains('is-selected')) {
                calendar_cells[j].style.backgroundColor = '#6699FF';
                calendar_cells[j].closest('td').style.backgroundColor = '#6699FF';
            }
        }
    }
}

function get_schedule(date) {
    let endpoint = '/show_schedule/' + date + '/';
    fetch(endpoint).then(response => response.json()).then(data => {
        if (!data.success) {
            document.getElementById('schedule').style.display = 'none';
            document.getElementById('no_schedule').style.display = 'flex';
        }
        else {
            document.getElementById('schedule').style.display = 'flex';
            document.getElementById('no_schedule').style.display = 'none';
            let formmated_date = 'לוח זמנים לתאריך ' + date.substring(8,10) + '/' + date.substring(5,7) + '/' + date.substring(0,4);
            document.getElementById('schedule_header').textContent = formmated_date;
            show_schedule_data(data.data);
            merge_and_split();
            station_color();
            drag_and_drop();
        }
    });
}

function delete_previous_schedule() {
    let schedule_table = document.getElementById('schedule').querySelector('table');
    let rows = schedule_table.querySelectorAll('tr');
    let i = rows.length;
    while (i > 1) {
        schedule_table.removeChild(schedule_table.lastChild);
        i--;
    }
}

function show_schedule_data(data) {
    delete_previous_schedule();
    let schedule_table = document.getElementById('schedule').querySelector('table');
    let schedule_data = data['schedule'];
    console.log(schedule_data);
    let time_slot = ['9.0', '9.5', '10.0', '10.5', '11.0', '11.5'];
    for (let i=0; i<schedule_data.length; i++) {
        let new_row = document.createElement('tr');
        new_row.setAttribute('data-row-index', i+1);
        let tour_dict = schedule_data[i];

        let cell = document.createElement('td');
            cell.setAttribute('dir', 'rtl');
            let input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.className = 'laboratory_name';
            input.value = schedule_data[i]['laboratory_name'];
            cell.appendChild(input);
            new_row.appendChild(cell);

        for (let j=0; j<time_slot.length; j++) {
            let td = document.createElement('td');
            td.className = "droppable";
            td.setAttribute('data-time-slot', (6-j).toString());
            let div = document.createElement('div');
            div.className = "draggable_cell";
            div.setAttribute('dir', 'rtl');
            div.textContent = schedule_data[i][time_slot[5-j]];
            td.appendChild(div);
            new_row.appendChild(td);
        }
        let class_names = ['guide_name', 'school_name'];
        let input_values = [schedule_data[i]['guide_name'], schedule_data[i]['school_name']];
        for (let k = 0; k < 2; k++) {
            let cell = document.createElement('td');
            cell.setAttribute('dir', 'rtl');
            let input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.className = class_names[k];
            input.value = input_values[k];
            cell.appendChild(input);
            new_row.appendChild(cell);
        }
        let tourNameCell = document.createElement('td');
        tourNameCell.className = 'tour_name';
        tourNameCell.setAttribute('dir', 'rtl');
        tourNameCell.textContent = tour_dict['tour_name'];
        new_row.appendChild(tourNameCell);
        schedule_table.appendChild(new_row);
    }
}

function merge_and_split() {
    let schedule_table = document.getElementById('schedule').querySelector('table');
    let table_rows = schedule_table.querySelectorAll('tr');
    for (let i=0; i<table_rows.length; i++) {
        let cells = table_rows[i].querySelectorAll('.droppable');
        let j=0;
        while (j < cells.length) {
            let current_cell = cells[j];
            let next_cell = cells[j+1];
            if (next_cell && next_cell.textContent == current_cell.textContent && next_cell.textContent != '') {
                current_cell.setAttribute('colspan', 2);
                current_cell.setAttribute('data-time-slot', (5-j).toString());
                next_cell.parentNode.removeChild(next_cell);
                j += 1;
            }
            else {
                current_cell.setAttribute('colspan', 1);
                current_cell.setAttribute('data-time-slot', (6-j).toString());
                j += 1;
            }
        }
    }
}

function updateData(station_name, cell) {
    let time_slot = cell.getAttribute("data-time-slot");
    let tour_index = (Number(cell.closest('tr').getAttribute("data-row-index")) - 1).toString();
    let selectedDate_str = document.getElementById('datepicker').value;
    let selectedDate = new Date(selectedDate_str);
    let date_data = selectedDate.getFullYear() + '-' +
                               ('0' + (selectedDate.getMonth() + 1)).slice(-2) + '-' +
                               ('0' + selectedDate.getDate()).slice(-2);
    let endpoint = '/update_schedule/' + station_name + '/' + time_slot + '/' + tour_index + '/' + date_data + '/';
    fetch(endpoint).then(response => response.text()).then(data => {
        if (data === 'False') {
            let text = 'לא ניתן לשבץ את התחנה בחלון הזמן הנבחר';
            let tempMsg = document.getElementById('tempMsg');
            tempMsg.textContent = text;
            tempMsg.style.display = 'flex';
            document.querySelector('.Main').style.opacity = 0.3;
            setTimeout(function() {
                tempMsg.style.display = 'none';
                document.querySelector('.Main').style.opacity = 1;
            }, 2000);
            return false;
        }
        else {
            let div = document.createElement("div");
            div.className = "draggable_cell";
            div.dir = "rtl";
            div.textContent = station_name;
            cell.closest('td').appendChild(div);
            station_color();
            save_flag = true;
            drag_and_drop();
            return true;
        }

    });
}

function deleteData(station_name, station) {
    let tour_index = (Number(station[0].closest('tr').getAttribute("data-row-index")) - 1).toString();
    let selectedDate_str = document.getElementById('datepicker').value;
    let selectedDate = new Date(selectedDate_str);
    let date = selectedDate.getFullYear() + '-' +
                               ('0' + (selectedDate.getMonth() + 1)).slice(-2) + '-' +
                               ('0' + selectedDate.getDate()).slice(-2);
    let endpoint = '/delete_from_schedule/' + station_name + '/' + tour_index + '/' + date + '/';
    let cell = station[0].closest('td');
    cell.removeChild(cell.firstChild);
    fetch(endpoint).then(response => response.text()).then(data => {
        if (data === 'True') {
            if (cell.getAttribute('colspan') == 2) {
                cell.setAttribute('colspan', 1);
                let data_time_slot = (Number(cell.getAttribute('data-time-slot')) + 1).toString();
                let newCell = document.createElement('td');
                newCell.className = 'droppable';
                newCell.setAttribute('colspan', 1);
                newCell.setAttribute('data-time-slot', cell.getAttribute('data-time-slot'));
                cell.setAttribute('data-time-slot', data_time_slot);
                cell.parentNode.insertBefore(newCell, cell.nextSibling);
            }
            drag_and_drop();
            save_flag = true;
            return true;
        }
        return false;
    });
}

function drag_and_drop() {
    $(function() {
        // Make elements with the class 'draggable' draggable
        $(".draggable_station").draggable({
            helper: "clone",  // Create a copy of the element while dragging
            revert: "invalid", // Revert if not dropped on a valid target
            start: function(event, ui) {
                // Store the initial position
                $(this).data("initialPosition", $(this).position());
            }
        });

        $(".draggable_cell").draggable({
            revert: "invalid"
        });

        // Make elements with the class 'droppable' droppable
        $(".droppable").droppable({
            accept: ".draggable_station",  // Accept only elements with the class 'draggable'
            drop: function(event, ui) {
                if ($(this).children(".draggable_cell").length == 0) {
                    console.log("if 1");
                    if (updateData(ui.helper.text(), this)) {
                        let newCell = $('<div class="draggable_cell" dir="rtl"></div>').text(ui.helper.text()).data("station-id", ui.helper.data("station-id"));
                        $(this).html(newCell);
                        newCell.draggable({
                        revert: "invalid"
                        });
                    }
                }
                else {
                    ui.draggable.animate(ui.draggable.data("initialPosition"), "slow");
                }
            }
        });

        $("#trash").droppable({
            accept: ".draggable_cell",
            over: function(event, ui) {
                $(this).css({
                    transform: "scale(1.2)"
                });
            },
            out: function(event, ui) {
                $(this).css({
                    transform: "scale(1)"
                });
            },
            drop: function(event, ui) {
                $(this).css({
                    transform: "scale(1)"
                });
                if (deleteData(ui.helper.text(), ui.draggable)) {
                    ui.draggable.remove();
                    let initialParent = ui.draggable.data("initialParent");
                    initialParent.empty();
                }
            }
        });
    });
}

function station_color() {
    let stations = document.querySelectorAll('.draggable_station');
    let stations_cell = document.querySelectorAll('.draggable_cell');
    let colors = ['#FF5733', '#FFC0CB', '#6495ED', '#CCCCFF', '#FFD700', '#808000',
    '#00FFFF', '#0000FF', '#FFA07A', '#20B2AA', '#87CEFA', '#00FA9A', '#C71585',
    '#FFE4B5', '#4EA72E', '#FFA500', '#FF4500', '#6A5ACD'];
    for (let i=0; i<stations.length; i++) {
        let station_name = stations[i].textContent;
        stations[i].style.backgroundColor = colors[i];
        for (let j=0; j<stations_cell.length; j++) {
            if (stations_cell[j].textContent == station_name) {
                stations_cell[j].style.backgroundColor = colors[i];
            }
        }
    }
}

function save_changes() {
    let selectedDate_str = document.getElementById('datepicker').value;
    let selectedDate = new Date(selectedDate_str);
    let date_str = selectedDate.getFullYear() + '-' +
                               ('0' + (selectedDate.getMonth() + 1)).slice(-2) + '-' +
                               ('0' + selectedDate.getDate()).slice(-2);
    let schedule_str = JSON.stringify(get_schedule_updates());
    console.log(date_str);
    console.log(schedule_str);
    let endpoint = '/save_changes/' + date_str + '/' + schedule_str + '/';
    fetch(endpoint).then(response => response.text()).then(data => {
        if (data === 'False') {
            let text = 'השינויים שביצעת לא נשמרו';
            let tempMsg = document.getElementById('tempMsg');
            tempMsg.textContent = text;
            tempMsg.style.display = 'flex';
            document.querySelector('.Main').style.opacity = 0.3;
            setTimeout(function() {
                tempMsg.style.display = 'none';
                document.querySelector('.Main').style.opacity = 1;
            }, 2000);
        }
        else {
            let text = 'השינויים שביצעת נשמרו בהצלחה!';
            let tempMsg = document.getElementById('tempMsg');
            tempMsg.textContent = text;
            tempMsg.style.display = 'flex';
            document.querySelector('.Main').style.opacity = 0.3;
            setTimeout(function() {
                tempMsg.style.display = 'none';
                document.querySelector('.Main').style.opacity = 1;
            }, 2000);
        }
    });
}

function get_schedule_updates() {
    time_convert = {
        1: '9.0',
        2: '9.5',
        3: '10.0',
        4: '10.5',
        5: '11.0',
        6: '11.5',
    }
    let schedule_table = document.getElementById('schedule').querySelector('table');
    let table_rows = schedule_table.querySelectorAll('tr');
    let schedule = [];
    for (let i=0; i<table_rows.length; i++) {
        let tour_schedule = {};
        let cells = table_rows[i].querySelectorAll('.droppable');
        if (cells.length > 0) {
            let tour_name = table_rows[i].querySelector('.tour_name').textContent;
            tour_schedule['tour_name'] = tour_name;
            let school_name = table_rows[i].querySelector('.school_name').value;
            tour_schedule['school_name'] = school_name;
            let guide_name = table_rows[i].querySelector('.guide_name').value;
            tour_schedule['guide_name'] = guide_name;
            let laboratory_name = table_rows[i].querySelector('.laboratory_name').value;
            tour_schedule['laboratory_name'] = laboratory_name;
            for (let j=0; j<cells.length; j++) {
                let time = Number(cells[j].getAttribute("data-time-slot"));
                let duration = cells[j].getAttribute("colspan");
                if (duration == 1) {
                    tour_schedule[time_convert[time]] = cells[j].textContent;
                }
                else {
                    tour_schedule[time_convert[time+1]] = cells[j].textContent;
                    tour_schedule[time_convert[time]] = cells[j].textContent;
                }
            }
            schedule.push(tour_schedule);
        }
    }
    return schedule;
}

async function schedule_to_pdf() {
    let { jsPDF } = window.jspdf;
    let pdf = new jsPDF('p', 'mm', 'a4');
    let schedule_header = await html2canvas(document.getElementById('schedule_header'));
    pdf.addImage(schedule_header.toDataURL(), 'JPEG', 55, 10, 100, 10);
    let schedule_table = document.getElementById('schedule').querySelector('table');
    let schedule = await html2canvas(schedule_table);
    let proportion = Number(schedule_table.offsetHeight)/Number(schedule_table.offsetWidth);
    let new_height = Math.round(proportion * 190);
    pdf.addImage(schedule.toDataURL(), 'JPEG', 10, 30, 190, new_height);
    let to_selectedDate_str = document.getElementById('datepicker').value;
    let to_selectedDate = new Date(to_selectedDate_str);
    let formmated_date = ('0' + to_selectedDate.getDate()).slice(-2) + '/'
            + ('0' + (to_selectedDate.getMonth() + 1)).slice(-2) + '/'
            + to_selectedDate.getFullYear();
    let file_name = formmated_date + '.pdf';
    pdf.save(file_name);
}

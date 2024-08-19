document.addEventListener('DOMContentLoaded', init);
let save_flag = true;

window.addEventListener('beforeunload', function (e) {
    if (!save_flag) {
        let text = "לצאת מהעמוד? ייתכן שהשינויים שביצעת לא יישמרו.";
        e.returnValue = text;
    }
});

function init() {
    let create = document.getElementById('create').textContent;
    if (create == 'True') {
       set_date();
       let add_tour = document.getElementById('add_tour');
       add_tour.addEventListener('click', add_tour_select);
       let delete_tour = document.querySelector('.delete_tour');
       for (let i=0; i<delete_tour.length; i++) {
           delete_tour[i].addEventListener('click', function() {
                delete_tour_select(this);
           });
       }
       document.getElementById('tours_data_form').addEventListener('submit', function(e) {
       check_before_submit(e)});
    }
    else {
       let footerHeight = document.querySelector('#footer').offsetHeight;
       document.querySelector('.Main').style.paddingBottom = footerHeight + 10 + 'px';
       init_drag_and_drop();
       merge_and_split();
       station_color();
       let save_btn = document.getElementById('save_schedule');
       save_btn.addEventListener('click', save_changes);
    }
}

function check_before_submit(e) {
    console.log("check before submit");
    e.preventDefault();
    console.log("prevent submit");
    let date = document.getElementById('schedule_date_input').value;
    let endpoint = `/check_before_submit/${date}/`;
    fetch(endpoint).then(response => response.text()).then(data => {
        if (data === 'False') {
            document.getElementById('tours_data_form').submit();
        }
        else {
            document.getElementById('warning_msg').style.display = 'flex';
            document.getElementById('add_tours_data').style.opacity = 0.2;
            document.getElementById('recreate').addEventListener('click', function() {
            document.getElementById('tours_data_form').submit();
            });
            document.getElementById('view').addEventListener('click', function() {
            window.location.href = `/view_schedule/${date}/`;
            });
        }

    });
}

function set_date() {
    today = new Date();
    let yyyy = today.getFullYear();
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let dd = String(today.getDate()).padStart(2, '0');
    let formattedToday = yyyy + '-' + mm + '-' + dd;
    document.getElementById('schedule_date_input').setAttribute('min', formattedToday);
}

function add_tour_select() {
    let add_select_tour = document.querySelector('.select_div');
    let new_element = add_select_tour.cloneNode(true);
    let delete_btn = new_element.querySelector('.delete_tour');
    delete_btn.addEventListener('click', function() {
    delete_tour_select(this);
    });
    new_element.querySelector('input').value = 1;
    let all_selects = document.getElementById('all_selects');
    all_selects.appendChild(new_element);
}

function delete_tour_select(btn) {
    let add_select_tour = btn.closest('.select_div');
    let all_selects = document.getElementById('all_selects');
    all_selects.removeChild(add_select_tour);
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
    let endpoint = '/update_schedule/' + station_name + '/' + time_slot + '/' + tour_index + '/';
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
            init_drag_and_drop();
            return true;
        }

    });
}

function deleteData(station_name, station) {
    let tour_index = (Number(station[0].closest('tr').getAttribute("data-row-index")) - 1).toString();
    let endpoint = '/delete_from_schedule/' + station_name + '/' + tour_index + '/';
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
            save_flag = true;
            return true;
        }
        else {
            return false;
        }
    });
}

function init_drag_and_drop() {
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
    let schedule_date = document.getElementById('schedule_date').textContent;
    let yyyy = schedule_date.substring(6, 10);
    let mm = schedule_date.substring(3, 5);
    let dd = schedule_date.substring(0, 2);
    let date_str = yyyy + '-' + mm + '-' + dd;
    let schedule_str = JSON.stringify(get_schedule());
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
            save_flag = false;
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
            save_flag = true;
        }
    });
}

function get_schedule() {
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
            let school_input = table_rows[i].querySelector('.school_name').value;
            tour_schedule['school_name'] = school_input;
            let guide_input = table_rows[i].querySelector('.guide_name').value;
            tour_schedule['guide_name'] = guide_input;
            let laboratory_input = table_rows[i].querySelector('.laboratory_name').value;
            tour_schedule['laboratory_name'] = laboratory_input;
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

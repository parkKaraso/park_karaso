const crudBtn = document.getElementById("crudBtn");
const editBtn = document.getElementById("editBtn");
const addBtn = document.getElementById("addBtn");
const exitBtn = document.getElementById("exit");
const edit = document.getElementById("edit");
const add = document.getElementById("add");

exitBtn.addEventListener('click', hideForms);
editBtn.addEventListener('click', showEditForm);
addBtn.addEventListener('click', showAddForm);
edit.addEventListener('click', hideForms);
add.addEventListener('click', hideForms);
crudBtn.addEventListener('click', PopUp);

const addStationForm = document.querySelector("#addStationForm");
const editStationForm = document.querySelector("#editStationForm");
const msg_ok_btn = document.getElementById("okBtn");
const popUp = document.querySelector(".crudPopup");
const topBtn = document.querySelector(".topBtn");

function PopUp() {
    popUp.style.display = 'flex';
    addBtn.style.borderBottom = '1px solid rgba(255, 255, 255, 0.9)';
    editBtn.style.borderBottom = '1px solid black';
    editBtn.style.fontWeight = 'normal';
    addBtn.style.fontWeight = 'bold';
    editStationForm.style.display = 'none';
    addStationForm.style.display = 'flex';
    topBtn.style.display = 'flex';
}

function showEditForm(){
    editBtn.style.borderBottom = '1px solid rgba(255, 255, 255, 0.9)';
    addBtn.style.borderBottom = '1px solid black';
    editBtn.style.fontWeight = 'bold';
    addBtn.style.fontWeight = 'normal';
    document.getElementById("editStationForm").style.display = 'flex';
    addStationForm.style.display = 'none';
    updateData();
}

function showAddForm(){
    addBtn.style.borderBottom = '1px solid rgba(255, 255, 255, 0.9)';
    editBtn.style.borderBottom = '1px solid black';
    editBtn.style.fontWeight = 'normal';
    addBtn.style.fontWeight = 'bold';
    addStationForm.style.display = 'flex';
    document.getElementById("editStationForm").style.display = 'none';
}

function hideForms() {
  document.querySelector(".crudPopup").style.display = 'none';
}

const editMaxAge = document.getElementById("editMaxAge");
const editMinAge = document.getElementById("editMinAge");
const timeRadios = document.getElementsByName("time");
let stationSelected = document.getElementById("stationName");
stationSelected.addEventListener('change', updateData);

function updateData() {
    let station_name = document.getElementById("stationName").value;
    let endpoint = '/stations/' + station_name + '/';
    fetch(endpoint).then(response => response.json()).then(data => {
        let min_age = data['גיל'][0];
        let max_age = data['גיל'][1];
        let time = data['זמן סיור'];
        editMinAge.selectedIndex = min_age;
        editMaxAge.selectedIndex = max_age;
        for (let i=0; i<timeRadios.length; i++) {
           if (Number(timeRadios[i].value) == time) {
               timeRadios[i].checked = true;
           }
           else {
               timeRadios[i].checked = false;
           }
        }
    });
  }

const delete_station_td = document.querySelectorAll('.delete_station_btn button');

for (let i=0; i<delete_station_td.length; i++) {
    delete_station_td[i].addEventListener('click', delete_station_msg);
    delete_station_td[i].addEventListener('mouseover', function() {
        this.closest('tr').querySelector('.station_name').style.fontWeight = 'bold';
    });
    delete_station_td[i].addEventListener('mouseleave', function() {
        this.closest('tr').querySelector('.station_name').style.fontWeight = 'normal';
    });
}

function delete_station_msg() {
    let msg = document.getElementById('delete_msg');
    msg.style.display = 'flex';
    let station_name = this.closest('tr').querySelector('.station_name').textContent;
    let text = 'האם אתה בטוח שתרצה למחוק את התחנה ' + '"' + station_name + '"?';
    msg.querySelector('p').textContent = text;
    document.getElementById('delete').addEventListener('click', function() {delete_station(station_name)});
    document.getElementById('cancel').addEventListener('click', function() {
        msg.style.display = 'none';
    });
}

function delete_station(station_name) {
    window.location.href = "/deleteStation?name=" + encodeURIComponent(station_name);
}

function close_msg() {
    let temp_msg = document.querySelector(".tempMsg");
    temp_msg.style.display = "none";
}







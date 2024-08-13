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

const addTourForm = document.querySelector("#addTourForm");
const editTourForm = document.querySelector("#editTourForm");
const popUp = document.querySelector(".crudPopup");
const topBtn = document.querySelector(".topBtn");

function PopUp() {
    popUp.style.display = 'flex';
    addBtn.style.borderBottom = '1px solid rgba(255, 255, 255, 0.9)';
    editBtn.style.borderBottom = '1px solid black';
    editBtn.style.fontWeight = 'normal';
    addBtn.style.fontWeight = 'bold';
    editTourForm.style.display = 'none';
    addTourForm.style.display = 'flex';
    topBtn.style.display = 'flex';
}

function showEditForm(){
    editBtn.style.borderBottom = '1px solid rgba(255, 255, 255, 0.9)';
    addBtn.style.borderBottom = '1px solid black';
    editBtn.style.fontWeight = 'bold';
    addBtn.style.fontWeight = 'normal';
    document.getElementById("editTourForm").style.display = 'flex';
    addTourForm.style.display = 'none';
    updateData();
}

function showAddForm(){
    addBtn.style.borderBottom = '1px solid rgba(255, 255, 255, 0.9)';
    editBtn.style.borderBottom = '1px solid black';
    editBtn.style.fontWeight = 'normal';
    addBtn.style.fontWeight = 'bold';
    addTourForm.style.display = 'flex';
    document.getElementById("editTourForm").style.display = 'none';
}

function hideForms() {
  document.querySelector(".crudPopup").style.display = 'none';
}

//When the page loads, the functions that change the display of the table contents are invoked
window.addEventListener('load', ideal_track);
window.addEventListener('load', mandatory_list);

//The function changes the display of the stations on the ideal route
function ideal_track() {
    let ideal_list = document.querySelectorAll('.ideal_track');
    for (let i=0; i<ideal_list.length; i++) {
        let item_text = ideal_list[i].textContent;
        if (item_text == '[]') {
            ideal_list[i].textContent = '';
        }
        else {
            let splitted_text = item_text.substring(1,item_text.length-1).split(", ");
            let new_text = splitted_text[0].substring(1,splitted_text[0].length-1);
            for (let j=1; j<splitted_text.length; j++) {
                new_text = new_text + ', ' + splitted_text[j].substring(1,splitted_text[j].length-1);
            }
            ideal_list[i].textContent = new_text;
        }
    }
}

//The function changes the display of the stations on the mandatory list
function mandatory_list() {
    let mandatory_list = document.querySelectorAll('.mandatory_list');
    for (let i=0; i<mandatory_list.length; i++) {
        let item_text = mandatory_list[i].textContent;
        if (item_text == '[]') {
            mandatory_list[i].textContent = '';
        }
        else {
            let splitted_text = item_text.substring(1,item_text.length-1).split(", ");
            let new_text = splitted_text[0].substring(1,splitted_text[0].length-1);
            for (let j=1; j<splitted_text.length; j++) {
                new_text = new_text + ', ' + splitted_text[j].substring(1,splitted_text[j].length-1);
            }
            mandatory_list[i].textContent = new_text;
        }
    }
}


const add_mandatory_list = document.getElementById('add_mandatory_list');
add_mandatory_list.addEventListener('change', function() {add_mandatory_tag(this.value)});

function add_mandatory_tag(selected) {
    if (selected == 'choose') {
        return;
    }
    let tag_list = document.getElementById('mandatory_tags');

    let existingTags = tag_list.querySelectorAll('.tag_name');
    for (let tag of existingTags) {
        if (tag.textContent == selected) {
            return;
        }
    }

    let tag = document.createElement('div');
    tag.className = 'station_tag';
    let tag_name = document.createElement('p');
    tag_name.className = 'tag_name';
    tag_name.textContent = selected;
    tag.appendChild(tag_name);
    let tag_btn = document.createElement('button');
    tag_btn.className = 'tag_btn';
    tag_btn.type = 'button';
    tag_btn.textContent = 'X';
    tag_btn.addEventListener('click', function() {
        tag_list.removeChild(tag);
        let hidden_input = document.querySelector(`input[value="${selected}"]`);
        hidden_input_container.removeChild(hidden_input);
        });
    tag.appendChild(tag_btn);
    tag_list.appendChild(tag);

    let hidden_input_container = document.getElementById('mandatory_selected');
    let hidden_input = document.createElement('input');
    hidden_input.type = 'hidden';
    hidden_input.name = 'selected_tags';
    hidden_input.value = selected;
    hidden_input_container.appendChild(hidden_input);
}

const add_station_to_route = document.getElementById('add_station_to_route');
add_station_to_route.addEventListener('click', add_station_select);
const add_delete_station = document.getElementById('add_delete_station');
add_delete_station.addEventListener('click', add_delete_station_from_route);

function add_station_select() {
    let add_select_station = document.querySelector('.add_select_station');
    let select_div = add_select_station.closest('.item');
    let new_element = add_select_station.closest('div').cloneNode(true);
    let num_of_children = select_div.querySelectorAll('.add_select_station').length + 1;
    new_element.querySelector('label').textContent = 'תחנה מספר ' + num_of_children + ':';
    select_div.appendChild(new_element);
}

function add_delete_station_from_route() {
    let add_select_station = document.querySelector('.add_select_station');
    let select_div = add_select_station.closest('.item');
    if (select_div.children.length == 2) {
        let msg = document.getElementById('addTourForm').querySelector('.error_msg');
        let message = "אין אפשרות למחוק תחנה, המסלול האידיאלי חייב להכיל לפחות תחנה אחת";
        msg.textContent = message;
        msg.style.display = 'flex';
        setTimeout(function() {
            msg.style.display = 'none';
        }, 2000);
    }
    else {
        select_div.removeChild(select_div.lastChild);
    }
}


const edit_mandatory_list = document.getElementById('edit_mandatory_list');
edit_mandatory_list.addEventListener('change', function() {edit_mandatory_tag(this.value)});

function edit_mandatory_tag(selected) {
    let tag_list = document.getElementById('edit_mandatory_tags');

    let existingTags = tag_list.querySelectorAll('.tag_name');
    for (let tag of existingTags) {
        if (tag.textContent == selected) {
            return;
        }
    }

    let tag = document.createElement('div');
    tag.className = 'station_tag';
    let tag_name = document.createElement('p');
    tag_name.className = 'tag_name';
    tag_name.textContent = selected;
    tag.appendChild(tag_name);
    let tag_btn = document.createElement('button');
    tag_btn.className = 'tag_btn';
    tag_btn.type = 'button';
    tag_btn.textContent = 'X';
    tag_btn.addEventListener('click', function() {
        tag_list.removeChild(tag);
        let hidden_input_container = document.getElementById('edit_mandatory_selected');
        let hidden_input = document.querySelector(`input[value="${selected}"]`);
        console.log(hidden_input);
        console.log(hidden_input_container.children);
        hidden_input_container.removeChild(hidden_input);
        });
    tag.appendChild(tag_btn);
    tag_list.appendChild(tag);
    let hidden_input_container = document.getElementById('edit_mandatory_selected');
    let hidden_input = document.createElement('input');
    hidden_input.type = 'hidden';
    hidden_input.name = 'selected_tags';
    hidden_input.value = selected;
    hidden_input_container.appendChild(hidden_input);
}

function edit_station_select() {
    let edit_select_station = document.getElementsByClassName('edit_select_station')[0];
    let select_div = edit_select_station.closest('.item');
    let new_element = edit_select_station.closest('div').cloneNode(true);
    let num_of_children = select_div.querySelectorAll('.edit_select_station').length + 1;
    new_element.querySelector('label').textContent = 'תחנה מספר ' + num_of_children + ':';
    select_div.appendChild(new_element);
}

let tourSelected = document.getElementById("tourName");
tourSelected.addEventListener('change', updateData);

const edit_station_to_route = document.getElementById('edit_station_to_route');
edit_station_to_route.addEventListener('click', edit_station_select);
const edit_delete_station = document.getElementById('edit_delete_station');
edit_delete_station.addEventListener('click', edit_delete_station_from_route);

function edit_delete_station_from_route() {
    let edit_select_station = document.getElementsByClassName('edit_select_station')[0];
    let select_div = edit_select_station.closest('.item');
    if (select_div.children.length == 2) {
        let msg = document.getElementById('editTourForm').querySelector('.error_msg');
        let message = "אין אפשרות למחוק תחנה, המסלול האידיאלי חייב להכיל לפחות תחנה אחת";
        msg.textContent = message;
        msg.style.display = 'flex';
        setTimeout(function() {
            msg.style.display = 'none';
        }, 2000);
    }
    else {
        select_div.removeChild(select_div.lastChild);
    }
}

function updateData() {
    let tour_name = document.getElementById("tourName").value;
    let endpoint = '/tour/' + tour_name + '/';
    let editMaxAge = document.getElementById('editMaxAge');
    let editMinAge = document.getElementById('editMinAge');
    let editPriority = document.getElementsByName('priority')[1];
    fetch(endpoint).then(response => response.json()).then(data => {
        let min_age = data['גיל'][0];
        let max_age = data['גיל'][1];
        let priority = data['תעדוף'];
        let mandatory = data['תחנות חובה'];
        let ideal_route = data['מסלול אידיאלי'];
        editMinAge.selectedIndex = min_age;
        editMaxAge.selectedIndex = max_age;
        editPriority.value = priority;
        let tag_list = document.getElementById('edit_mandatory_tags');
        let existingTags = tag_list.querySelectorAll('.station_tag');
        for (let tag of existingTags) {
            tag_list.removeChild(tag);
        }
        let hidden_input_container = document.getElementById('edit_mandatory_selected');
        while (hidden_input_container.children.length > 0) {
            hidden_input_container.removeChild(hidden_input_container.lastChild);
        }
        for (let s of mandatory) {
            edit_mandatory_tag(s);
        }
        let item_list = document.querySelectorAll('.item');
        let route_item = item_list[item_list.length-2];
        let ideal_route_list = route_item.children;
        let list_length = ideal_route_list.length;
        for (let i=2; i<list_length; i++) {
            route_item.removeChild(route_item.lastChild);
        }
        for (let i=0; i<ideal_route.length; i++) {
            let select_list = document.getElementsByName('edit_route');
            let select_option = select_list[0].options;
            let options_value = [];
            for (let o of select_option) {
                options_value.push(o.value);
            }
            let selected = options_value.indexOf(ideal_route[i]);
            if (i == 0) {
                select_list[0].selectedIndex = selected;
            }
            else {
                edit_station_select();
                select_list[select_list.length-1].selectedIndex = selected;
            }
        }
    });
  }

const ok_btn = document.getElementById('okBtn');
ok_btn.addEventListener('click', close_msg);

function close_msg() {
    let temp_msg = document.querySelector(`.tempMsg`);
    temp_msg.style.display = 'none';
}
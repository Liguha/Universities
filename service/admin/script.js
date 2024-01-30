let edit_open_st = false;
let edit_open_ex = false;
const link = "http://127.0.0.1:8000";

function select_category(id)
{
    let cur = document.querySelector(".active");
    cur.classList.remove("active");
    let cur_div_id = "div_" + cur.id;
    let cur_div = document.getElementById(cur_div_id);
    cur_div.style.display = "none";
    let next = document.getElementById(id);
    next.classList.add("active");
    let next_div = document.getElementById("div_" + id);
    next_div.style.display = "inline-block";
}

function make_select(element, list)
{
    element.replaceChildren();
    for (let i = 0; i < list.length; i++)
    {
        let child = document.createElement("option");
        child.value = list[i].id;
        child.textContent = list[i].name;
        element.appendChild(child);
    }
    if (element.onchange != null)
        element.onchange();
}

async function get_select_list(id, type, list_id = null)
{
    let response = await fetch(link + type + "_list",
    {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
        {
            id: list_id
        })
    });
    let ans = await response.json();
    let list = ans.list;
    make_select(document.getElementById(id), list);
}

async function get_info(id, type)
{
    let response = await fetch(link + type + "_info",
    {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
        {
            id: id
        })
    });
    return await response.json();
}

async function get_students_info(id)
{
    edit_open_st = false;
    let ans = await get_info(id, "students");
    let parent = document.getElementById("div_students");
    parent.querySelector("[name=title]").textContent = ans.title;
    parent.querySelector("[name=form]").textContent = ans.form;
    let table = parent.querySelector("[name=stud_body]");
    let old = table.querySelectorAll(`[class=stud_row]`);
    for (let i = 0; i < old.length; i++)
        old[i].remove();
    let sample = document.querySelector("[class=stud_row]");
    let prev = null;
    for (let i = 0; i < ans.students.length; i++)
    {
        let cur = sample.cloneNode(true);
        table.appendChild(cur);
        if (i > 0)
            prev.after(cur);
        cur.querySelector("[name=num]").textContent = i + 1;
        cur.querySelector("[name=name]").textContent = ans.students[i].name;
        cur.querySelector("[name=phone]").textContent = ans.students[i].phone;
        cur.querySelector("[name=gradebook]").textContent = ans.students[i].gradebook;
        cur.querySelector("[class=accept_button]").value = ans.students[i].id;
        cur.querySelector("[class=delete_button]").value = ans.students[i].id;
        prev = cur;
    }
    parent.querySelector("[class=add_new]").value = id;
}

async function change_students(path, data)
{
    let response = await fetch(link + path,
    {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    let ans = await response.json();
    if (!ans.success)
        alert(ans.error);
    let id = document.querySelector("[id=group0]").value;
    get_students_info(id);
}

function st_edit_button_onclick(element)
{
    if (edit_open_st)
    {
        alert("Уже открыто меню редактирования");
        return;
    }
    edit_open_st = true;
    let row = element.parentNode.parentNode;
    row.querySelector("[class=edit_button]").style.display = "none";
    row.querySelector("[class=delete_button]").style.display = "none";
    row.querySelector("[class=accept_button]").style.display = "block";
    let name = document.createElement("input");
    name.setAttribute("type", "text");
    name.setAttribute("value", row.querySelector("[name=name]").textContent);
    let phone = document.createElement("input");
    phone.setAttribute("type", "text");
    phone.setAttribute("value", row.querySelector("[name=phone]").textContent);
    let gradebook = document.createElement("input");
    gradebook.setAttribute("type", "text");
    gradebook.setAttribute("value", row.querySelector("[name=gradebook]").textContent);
    row.querySelector("[name=name]").textContent = "";
    row.querySelector("[name=phone]").textContent = "";
    row.querySelector("[name=gradebook]").textContent = "";
    row.querySelector("[name=name]").appendChild(name);
    row.querySelector("[name=phone]").appendChild(phone);
    row.querySelector("[name=gradebook]").appendChild(gradebook);
}

async function st_accept_button_onclick(element)
{
    let row = element.parentNode.parentNode;
    let data =
    {
        id: element.value,
        name: row.querySelector("[name=name]").firstChild.value,
        phone: row.querySelector("[name=phone]").firstChild.value,
        gradebook: row.querySelector("[name=gradebook]").firstChild.value,
    }
    await change_students("student_update", data);
}

async function st_delete_button_onclick(element)
{
    let data =
    {
        id: element.value
    }
    await change_students("del_student_update", data);
}

async function st_add_new_onclick(id)
{
    let data =
    {
        id: id
    }
    await change_students("add_student_update", data);
}

async function get_exams_info(id)
{
    edit_open_ex = false;
    let ans = await get_info(id, "shedule_g");
    let parent = document.getElementById("div_exams");
    let table = parent.querySelector("[name=exam_body]");
    let old = table.querySelectorAll(`[class=exam_row]`);
    for (let i = 0; i < old.length; i++)
        old[i].remove();
    let sample = document.querySelector("[class=exam_row]");
    parent.querySelector("[name=title]").textContent = document.getElementById("group1").querySelector(`[value='${id}']`).textContent;
    let prev = null;
    for (let i = 0; i < ans.exams.length; i++)
    {
        let cur = sample.cloneNode(true);
        table.appendChild(cur);
        if (i > 0)
            prev.after(cur);
        cur.querySelector("[name=num]").textContent = i + 1;
        let main = cur.querySelector("[class=main]");
        main.querySelector("[name=actor]").textContent = ans.exams[i].actor;
        main.querySelector("[name=actor]").classList.add(ans.exams[i].actor_id);
        let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
        let date_begin = new Date(ans.exams[i].begin);
        let date_end = new Date(ans.exams[i].end);
        main.querySelector("[name=begin]").textContent = date_begin.toLocaleDateString("ru-RU", options);
        main.querySelector("[name=begin]").classList.add(ans.exams[i].begin);
        main.querySelector("[name=end]").textContent = date_end.toLocaleDateString("ru-RU", options);
        main.querySelector("[name=end]").classList.add(ans.exams[i].end);
        main.querySelector("[name=class]").textContent = ans.exams[i].class;
        cur.querySelector("[class=accept_button]").value = ans.exams[i].id;
        cur.querySelector("[class=delete_button]").value = ans.exams[i].id;
        prev = cur;
    }
    parent.querySelector("[class=add_new]").value = id;
}

async function change_exams(path, data)
{
    let response = await fetch(link + path,
    {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    let ans = await response.json();
    if (!ans.success)
        alert(ans.error);
    let id = document.querySelector("[id=group1]").value;
    get_exams_info(id);
}

async function ex_edit_button_onclick(element)
{
    if (edit_open_ex)
    {
        alert("Уже открыто меню редактирования");
        return;
    }
    edit_open_ex = true;
    let row = element.parentNode.parentNode;
    let main = row.querySelector("[class=main]");
    row.querySelector("[class=edit_button]").style.display = "none";
    row.querySelector("[class=delete_button]").style.display = "none";
    row.querySelector("[class=accept_button]").style.display = "block";
    let actor = document.createElement("select");
    let response = await fetch(link + "/educator_dep_list",
    {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
        {
            id: null
        })
    });
    let parsed = await response.json();
    make_select(actor, parsed.list);
    actor.value = row.querySelector("[name=actor]").classList[0];
    let begin = document.createElement("input");
    begin.setAttribute("type", "datetime-local");
    let date_begin = new Date(row.querySelector("[name=begin]").classList[0]);
    let begin_offset = date_begin.getTimezoneOffset();
    begin.setAttribute("name", begin_offset);
    date_begin.setTime(date_begin.getTime() - begin_offset * 60000);
    let begin_time = date_begin.toISOString();
    begin.setAttribute("value", begin_time.slice(0, -1));
    let end = document.createElement("input");
    end.setAttribute("type", "datetime-local");
    let date_end = new Date(row.querySelector("[name=end]").classList[0]);
    let end_offset = date_end.getTimezoneOffset();
    end.setAttribute("name", end_offset);
    date_end.setTime(date_end.getTime() - end_offset * 60000);
    let end_time = date_end.toISOString();
    end.setAttribute("value", end_time.slice(0, -1));
    let num = document.createElement("input");
    num.setAttribute("type", "text");
    num.setAttribute("value", main.querySelector("[name=class]").textContent);
    main.querySelector("[name=actor]").textContent = "";
    main.querySelector("[name=begin]").textContent = "";
    main.querySelector("[name=end]").textContent = "";
    main.querySelector("[name=class]").textContent = "";
    main.querySelector("[name=actor]").appendChild(actor);
    main.querySelector("[name=begin]").appendChild(begin);
    main.querySelector("[name=end]").appendChild(end);
    main.querySelector("[name=class]").appendChild(num);
}

async function ex_accept_button_onclick(element)
{
    let row = element.parentNode.parentNode;
    let main = row.querySelector("[class=main]");
    let begin = main.querySelector("[name=begin]").firstChild.value.replace("T", " ");
    let end = main.querySelector("[name=end]").firstChild.value.replace("T", " ");
    let data =
    {
        id: element.value,
        actor: main.querySelector("[name=actor]").firstChild.value,
        begin: begin,
        end: end,
        class: main.querySelector("[name=class]").firstChild.value
    }
    await change_exams("exam_update", data);
}

async function ex_delete_button_onclick(element)
{
    let data =
    {
        id: element.value
    }
    await change_exams("del_exam_update", data);
}

async function ex_add_new_onclick(id)
{
    let data =
    {
        id: id
    }
    await change_exams("add_exam_update", data);
}
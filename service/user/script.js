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
    element.onchange();
}

function make_list(element, list)
{
    element.replaceChildren();
    for (let i = 0; i < list.length; i++)
    {
        let child = document.createElement("li");
        child.textContent = list[i];
        element.appendChild(child);
    }
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

async function get_university_info(id)
{
    let ans = await get_info(id, "university");
    let parent = document.getElementById("div_higher");
    parent.querySelector("[name=title]").textContent = ans.title;
    parent.querySelector("[name=students]").textContent = ans.students;
    parent.querySelector("[name=foundation]").textContent = ans.foundation;
    parent.querySelector("[name=adress]").textContent = ans.adress;
    make_list(parent.querySelector("[name=directions]"), ans.directions);
    make_list( parent.querySelector("[name=departaments]"), ans.departaments);
}

async function get_group_info(id)
{
    let ans = await get_info(id, "group");
    let parent = document.getElementById("div_groups");
    parent.querySelector("[name=title]").textContent = ans.title;
    parent.querySelector("[name=direction]").textContent = ans.direction;
    parent.querySelector("[name=departament]").textContent = ans.departament;
    parent.querySelector("[name=count]").textContent = ans.students.length;
    make_list(parent.querySelector("[name=students]"), ans.students);
}

async function get_departament_info(id)
{
    let ans = await get_info(id, "departament");
    let parent = document.getElementById("div_departaments");
    parent.querySelector("[name=title]").textContent = ans.title;
    parent.querySelector("[name=head]").textContent = ans.head;
    parent.querySelector("[name=phone]").textContent = ans.phone;
    parent.querySelector("[name=email]").textContent = ans.email;
    make_list(parent.querySelector("[name=educators]"), ans.educators);
}

async function get_shedule_info(id, type)
{
    let ans = await get_info(id, type);
    let parent = document.getElementById(`div_${type}`).querySelector("[class=info]");
    let old = parent.querySelectorAll(`[class=exam_${type}]`);
    for (let i = 0; i < old.length; i++)
        old[i].remove();
    let sample = document.querySelector(`[class=exam_${type}]`);
    let prev = parent.querySelector("[name=title]");
    let free = parent.querySelector("[name=free]");
    if (ans.exams.length == 0)
        free.textContent = "Экзамены отсутствуют";
    else
        free.textContent = "";
    prev.after(free);
    prev = free;
    for (let i = 0; i < ans.exams.length; i++)
    {
        let cur = sample.cloneNode(true);
        parent.appendChild(cur);
        prev.after(cur);
        cur.style.display = "block";
        cur.querySelector("[name=actor]").textContent = ans.exams[i].actor;
        let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
        let date_begin = new Date(ans.exams[i].begin);
        let date_end = new Date(ans.exams[i].end);
        cur.querySelector("[name=begin]").textContent = date_begin.toLocaleDateString("ru-RU", options);
        cur.querySelector("[name=end]").textContent = date_end.toLocaleDateString("ru-RU", options);
        cur.querySelector("[name=class]").textContent = ans.exams[i].class;
        prev = cur;
    }
}
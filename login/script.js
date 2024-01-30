async function login_user()
{
    await fetch("http://127.0.0.1:8000/login_user",
    {
        method: "POST"
    });
    location.href = "http://127.0.0.1:8000/service";
}

async function check_mail()
{
    let mail = document.getElementById("email").value;
    let response = await fetch("http://127.0.0.1:8000/check_mail",
    {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
        {
            mail: mail
        })
    });
    let ans = await response.json();
    if (!ans.success)
    {
        alert(ans.error);
        location.href = "http://127.0.0.1:8000/login";
    }
}

async function login_admin()
{
    let mail = document.getElementById("email").value;
    let code = document.getElementById("code").value;
    let response = await fetch("http://127.0.0.1:8000/login_admin",
    {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
        {
            code: code,
            mail: mail
        })
    });
    let ans = await response.json();
    if (!ans.success)
    {
        alert(ans.error);
        location.href = "http://127.0.0.1:8000/login";
    }
    else
        location.href = "http://127.0.0.1:8000/service";
}

let id_order = ["admin", "email_input", "code_input"];

function show_next(delta, id)
{
    let idx = -1;
    for (let i = 0; i < id_order.length; i++)
    {
        if (id == id_order[i])
        {
            idx = i;
            break;
        }
    }
    let button = document.getElementById(id);
    button.style.display = "none";
    let input = document.getElementById(id_order[idx + delta]);
    input.style.display = "inline-block";
}
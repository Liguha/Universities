const express = require("express");
const mailer = require("nodemailer");
const cookie_parser = require("cookie-parser");
const fs = require("fs");
const { Client } = require("pg");
const { make_list, list_types } = require("./scripts/list.js");
const { make_info, info_types } = require("./scripts/info.js");
const { make_update, update_types } = require("./scripts/update.js");
const { get_departament } = require("./scripts/get_departament");
const { check_auth, auth_code, secret_code, departament_id } = require("./scripts/auth.js");

const client = new Client(
{
    host: ...,
    port: ...,
    database: ...,
    user: ...,
    password: ...
});
client.connect();

const app = express();
app.set("port", 8000);
app.use(express.json());
app.use(cookie_parser());
const link = "http://127.0.0.1:8000";

const transpoter = mailer.createTransport(
{
    host: ...,
    port: ...,
    secure: true,
    auth: 
    {
        user: ...,
        pass: ...
    }
});

function get_files(dir, roles)
{
    fs.readdirSync(dir).forEach(file =>
    {
        let path = "/" + dir + "/" + file;
        app.get(path, (request, response) =>
        {
            let role = check_auth(request);
            if (roles.indexOf(role) != -1)
                response.sendFile(__dirname + path);
            else
                response.redirect(link + "/login");
        });
    });
}

function post_lists(roles)
{
    let types = list_types();
    for (let i = 0; i < types.length; i++)
    {
        app.post("/" + types[i] + "_list", async (request, response) =>
        {
            let role = check_auth(request);
            if (roles.indexOf(role) != -1)
            {
                let id = request.body.id;
                if (role == "admin" && id == null)
                    id = departament_id(request.cookies.secret);
                let res = await make_list(client, types[i], id);
                response.send(res);
            }
            else
                response.redirect(link + "/login");
        });
    }
}

function post_info()
{
    let types = info_types();
    for (let i = 0; i < types.length; i++)
    {
        app.post("/" + types[i].type + "_info", async (request, response) =>
        {
            let roles = types[i].roles;
            let role = check_auth(request);
            if (roles.indexOf(role) != -1)
            {
                let id = request.body.id;
                let res = await make_info(client, types[i].type, id);
                response.send(res);
            }
            else
                response.redirect(link + "/login");
        });
    }
}

function post_update()
{
    let types = update_types();
    for (let i = 0; i < types.length; i++)
    {
        app.post("/" + types[i] + "_update", async (request, response) =>
        {
            let role = check_auth(request);
            if (role != "admin")
                response.redirect(link + "/login");
            let res = await make_update(client, types[i], request.body);
            response.send(res);
        });
    }
}

app.post("/login_user", (request, response) =>
{
    response.cookie("role", "user");
    response.send({success: true});
});

app.post("/check_mail", async (request, response) =>
{
    let mail = request.body.mail;
    let dep_id = await get_departament(client, mail);
    if (dep_id != -1)
    {
        let code = auth_code(mail, dep_id);
        if (code != null)
        {
            let message = 
            {
                from: "Вузы Москвы <тут почта>",
                to: mail,
                subject: "Код авторизации",
                text: "Ваш код авторизации на сайте \"Вузы Москвы\": " + code
            }
            transpoter.sendMail(message);
            response.send({success: true});
        }
        else
            response.send({success: false, error: "Сообщение было недавно отправлено"});
    }
    else
        response.send({success: false, error: "Почта не принадлежит ни одному руководителю факультета"});
});

app.post("/login_admin", (request, response) =>
{
    let mail = request.body.mail;
    let code = request.body.code;
    let info = secret_code(mail, code);
    if (info.secret != null)
    {
        response.cookie("role", "admin");
        response.cookie("secret", info.secret);
        response.send({success: true});
    }
    else
        response.send({success: false, error: "Неверный код"});
});

app.get("/login", (request, response) =>
{
    response.sendFile(__dirname + "/login/login.html");
});

app.get("/service", (request, response) =>
{
    let role = check_auth(request);
    if (role == null)
        response.redirect(link + "/login");
    else
        response.sendFile(__dirname + "/service/" + role + ".html");
});

get_files("login", [null, "user", "admin"]);
get_files("service/user", ["user"]);
get_files("service/admin", ["admin"]);
post_lists(["user", "admin"]);
post_info();
post_update();

app.listen(app.get("port"));
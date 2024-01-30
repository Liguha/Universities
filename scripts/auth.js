let admins = {};
let codes = {};

function check_auth(request)
{   
    let res = null;
    let role = request.cookies.role;
    let secret = request.cookies.secret;
    switch (role)
    {
        case "user":
        {
            res = role;
            break;
        }
        case "admin":
        {
            if (secret == null)
            {
                res = null;
                break;
            }
            if (admins[secret] == null)
               res = null;
            else
                res = role;
            break;
        }
        default:
        {
            res = null;
            break;
        }
    }
    return res;
}

function auth_code(mail, id)
{
    if (codes[mail] != null)
        return null;
    let code = Math.floor(Math.random() * 999999);
    codes[mail] = { code: code, id: id };
    setTimeout(() => delete codes[mail], 60 * 1000);
    return code;
}

function secret_code(mail, code)
{
    let res =
    {
        secret: null,
        id: null
    }
    if (codes[mail] == null)
        return res;
    if (code != codes[mail].code)
        return res;
    res.id = codes[mail].id;
    delete codes[mail];
    res.secret = Math.floor(Math.random() * 99999999999999);
    while (admins[res.secret] != null)
        res.secret = Math.floor(Math.random() * 99999999999999);
    admins[res.secret] = res.id;
    setTimeout(() => delete admins[res.secret], 5 * 3600 * 1000);
    return res;
}

function departament_id(secret)
{
    return admins[secret];
}

module.exports.check_auth = check_auth;
module.exports.auth_code = auth_code;
module.exports.secret_code = secret_code;
module.exports.departament_id = departament_id;
async function get_departament(client, email)
{
    let query = `SELECT d.id, d.title, t1.fio FROM departament d
                RIGHT JOIN 
                (SELECT id, fio, departament_id FROM educator e
                WHERE e.email = '${email}') as t1
                ON d.id = t1.departament_id`;
    let ans = await client.query(query);
    if (ans.rows.length == 0)
        return -1;
    return ans.rows[0].id;
}

module.exports.get_departament = get_departament;
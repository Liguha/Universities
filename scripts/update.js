queries =
{
    student:  "UPDATE student\
                SET fio = '${name}',\
                telephone_number = '${phone}',\
                number_gradebook = '${gradebook}'\
                WHERE id = ${id}",
    del_student: "DELETE FROM student\
                  WHERE id = ${id}",
    add_student:   "INSERT INTO student(\
                        id, fio, group_id,\
                        telephone_number,\
                        number_gradebook\
                    )\
                    VALUES((SELECT MAX(id)+1 FROM student), '', ${id}, '', '')",
    exam:  "UPDATE exam\
            SET date_begin = '${begin}', date_end = '${end}', number_class= ${class}, educator_id= ${actor}\
            WHERE id = ${id}",
    del_exam:  "DELETE FROM exam\
                WHERE id = ${id}",
    add_exam:  "INSERT INTO exam(\
                    id, group_id, educator_id,\
                    date_begin, date_end, number_class)\
                VALUES((SELECT MAX(id)+1 FROM exam), ${id}, (SELECT MIN(id) FROM educator), '2025-01-01 00:00:00', '2025-01-01 00:00:00', 0)"
}

async function make_update(client, type, data)
{
    if (queries[type] == null)
    {
        let res = 
        {
            success: false,
            error: "No such type"
        }
        return res;
    }
    let query = queries[type];
    for (let key in data)
        query = query.replace("${" + key + "}", data[key]);
    await client.query(query);
    return { success: true };
}

function update_types()
{
    let res = [];
    for (let key in queries)
        res.push(key);
    return res;
}

module.exports.make_update = make_update;
module.exports.update_types = update_types;
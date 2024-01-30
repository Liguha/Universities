const queries =
{
    university: "SELECT id, title AS name FROM higher_education_institution",
    group: "SELECT gr.id AS id, gr.name_group AS name\
            FROM higher_education_institution h\
                LEFT JOIN departament d ON h.id = d.higher_ed_ins_id\
                LEFT JOIN \"group\" gr ON d.id = gr.departament_id\
            WHERE h.id = ${}",
    departament:   "SELECT d.id AS id, d.title AS name FROM higher_education_institution h\
                    INNER JOIN departament d ON h.id = d.higher_ed_ins_id\
                    WHERE h.id = ${}",
    educator:  "SELECT  e.id AS id, e.fio AS name FROM higher_education_institution h\
                INNER JOIN departament d ON h.id = d.higher_ed_ins_id\
                INNER JOIN educator e ON d.id = e.departament_id\
                WHERE h.id = ${}\
                ORDER BY name",
    group_dep: "SELECT gr.id AS id, gr.name_group AS name FROM departament d\
                RIGHT JOIN \"group\" gr\
                ON d.id = gr.departament_id\
                WHERE d.id = ${}",
    educator_dep:  "SELECT  e.id AS id, e.fio AS name FROM higher_education_institution h\
                    INNER JOIN departament d ON h.id = d.higher_ed_ins_id\
                    INNER JOIN educator e ON d.id = e.departament_id\
                    WHERE h.id IN\
                        (SELECT higher_ed_ins_id FROM departament\
                        WHERE id = ${})\
                    ORDER BY name"
};

async function make_list(client, type, id)
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
    let query = queries[type].replace("${}", id);
    let ans = await client.query(query);
    let res =
    {
        success: true,
        list: ans.rows
    }
    return res;
}

function list_types()
{
    let res = [];
    for (let key in queries)
        res.push(key);
    return res;
}

module.exports.make_list = make_list;
module.exports.list_types = list_types;
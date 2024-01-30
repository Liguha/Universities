const { departament_id } = require("./auth.js");

const queries =
{
    university: 
    {
        roles: ["user", "admin"],
        text:  "WITH adress AS\
                (SELECT id, CONCAT(title, ', дом ', house) AS adr\
                        FROM  street s),\
                t1 AS (SELECT h.title,\
                    a.adr as adress_ins,\
                    d.title as title_dep, COUNT(st.id) AS amount_student,\
                    h.year_of_foundation,\
                    ed.title as ed_title\
                FROM higher_education_institution h\
                LEFT JOIN departament d ON h.id = d.higher_ed_ins_id\
                LEFT JOIN \"group\" gr ON d.id = gr.departament_id\
                LEFT JOIN student st ON gr.id = st.group_id\
                INNER JOIN adress a ON h.street_id = a.id\
                INNER JOIN educational_direction ed ON gr.code_id = ed.id\
                WHERE h.id = ${}\
                GROUP BY gr.id, d.id, h.title, h.year_of_foundation, a.adr, ed.title)\
                SELECT title, adress_ins, title_dep, SUM(amount_student) as amount_student, year_of_foundation, ed_title\
                FROM t1\
                GROUP BY title,title_dep, adress_ins, year_of_foundation, ed_title",
        parser: (ans) =>
        {
            let title = ans[0].title;
            let adress = ans[0].adress_ins;
            let foundation = ans[0].year_of_foundation;
            let directions = [], departaments = [];
            let students = 0;
            for (let i = 0; i < ans.length; i++)
            {
                if (departaments.indexOf(ans[i].title_dep) == -1)
                    departaments.push(ans[i].title_dep);
                if (directions.indexOf(ans[i].ed_title) == -1)
                    directions.push(ans[i].ed_title);
                students += Number(ans[i].amount_student);
            }
            let res =
            {
                title: title,
                adress: adress,
                foundation: foundation.getFullYear(),
                students: students,
                directions: directions,
                departaments: departaments
            };
            return res;
        }
    },
    group:
    {
        roles: ["user", "admin"],
        text: "SELECT gr.name_group,\
                d.title as dep_title,\
                ed.title as ed_title,\
                st.fio\
                FROM departament d\
                INNER JOIN \"group\" gr ON d.id = gr.departament_id\
                INNER JOIN educational_direction ed ON gr.code_id = ed.id\
                INNER JOIN student st ON gr.id = st.group_id\
                WHERE gr.id = ${}",
        parser: (ans) =>
        {
            let title = ans[0].name_group;
            let departament = ans[0].dep_title;
            let direction = ans[0].ed_title;
            let students = [];
            for (let i = 0; i < ans.length; i++)
                students.push(ans[i].fio);
            let res = 
            {
                title: title,
                departament: departament,
                direction: direction,
                count: students.length,
                students: students
            };
            return res;
        }
    },
    departament:
    {
        roles: ["user", "admin"],
        text:  "SELECT d.title,\
                    d.telephone_number,\
                    d.email,\
                    (SELECT fio FROM educator\
                    WHERE educator.id = d.head_dep_id) as fio_head_dep,\
                    e.fio\
                FROM departament d\
                INNER JOIN educator e\
                ON d.id = e.departament_id\
                WHERE d.id = ${}",
        parser: (ans) =>
        {
            let educators = [];
            for (let i = 0; i < ans.length; i++)
                educators.push(ans[i].fio);
            let res =
            {
                title: ans[0].title,
                phone: ans[0].telephone_number,
                email: ans[0].email,
                head: ans[0].fio_head_dep,
                educators: educators
            }
            return res;
        }
    },
    shedule_g: 
    {
        roles: ["user", "admin"],
        text:  "SELECT e.id AS id, e.date_begin AS begin, e.date_end AS end, e.number_class AS class, ed.fio AS actor, ed.id AS actor_id FROM exam e\
                INNER JOIN \"group\" gr ON e.group_id = gr.id\
                INNER JOIN educator ed ON e.educator_id = ed.id\
                WHERE gr.id = ${}\
                ORDER BY begin",
        parser: (ans) =>
        {
            if (ans[0].actor == null)
                return { exams: [] };
            return { exams: ans }
        }
    },
    shedule_e:
    {
        roles: ["user", "admin"],
        text:  "SELECT t1.name_group AS actor, t1.date_begin AS begin, t1.date_end AS end, t1.number_class AS class\
                FROM\
                (SELECT e.*, gr.name_group as name_group FROM exam e\
                INNER JOIN \"group\" gr ON e.group_id = gr.id) t1\
                RIGHT JOIN\
                (SELECT  e.id ,e.fio   FROM educator e\
                WHERE e.id = ${}) t2\
                ON t1.educator_id = t2.id\
                ORDER BY begin",
        parser: (ans) =>
        {
            if (ans[0].actor == null)
                return { exams: [] };
            return { exams: ans }
        }
    },
    students:
    {
        roles: ["admin"],
        text:  "SELECT *\
                FROM \"group\" gr\
                INNER JOIN student st\
                ON gr.id = st.group_id\
                WHERE gr.id = ${}\
                ORDER BY st.fio",
        parser: (ans) =>
        {
            let students = [];
            for (let i = 0; i < ans.length; i++)
            {
                let cur = {};
                cur.id = ans[i].id;
                cur.name = ans[i].fio;
                cur.phone = ans[i].telephone_number;
                cur.gradebook = ans[i].number_gradebook;
                students.push(cur);
            }
            let res =
            {
                title: ans[0].name_group,
                form: ans[0].form_of_education,
                students: students
            }
            return res;
        }
    }
}

async function make_info(client, type, id)
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
    let query = queries[type].text.replace("${}", id);
    let ans = await client.query(query);
    let res = queries[type].parser(ans.rows);
    res.success = true;
    return res;
}

function info_types()
{
    let res = [];
    for (let key in queries)
        res.push({type: key, roles: queries[key].roles});
    return res;
}

module.exports.make_info = make_info;
module.exports.info_types = info_types;
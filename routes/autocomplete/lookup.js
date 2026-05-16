const { app, con, jwt, map, rules } = require('../../server')

// ROTA PARA LOOKUP'S DINÂMICOS

app.post('/lookup/:table', async(req, res) => {

    let ID_ENTIDADE = jwt.verify(req.headers.x_session, process.env.XKEY).ID_ENTIDADE

    let joinSQL = (req.body.joins || []).map((i, n) => 
        `INNER JOIN ${i} T${n} ON A.${map[i]} = T${n}.${map[i]}`
    ).join('\n')

    let dataSQL = 
    `SELECT
        ${req.body.ID} AS ID,
        CONCAT(${req.body.DS.join(",' - ',")}) AS DS
    FROM ${req.params.table} A
    ${joinSQL}
    WHERE ${rules[req.params.table] || rules["DEFAULT"]} AND A.ID_ENTIDADE = ?`

    let [dataRes] = await con.promise().query(dataSQL, ID_ENTIDADE)

    res.send(dataRes)
})
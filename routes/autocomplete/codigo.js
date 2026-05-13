const { app, con, jwt, map } = require('../../server')

// ROTA PARA CÓDIGOS DINÂMICOS

app.post('/codigo/:table', async(req, res) => {

    let ID_ENTIDADE = jwt.verify(req.headers.x_session, process.env.XKEY).ID_ENTIDADE

    let dataSQL = 
    `SELECT
        COALESCE(MAX(${req.body.field}), 0) +1 AS ${req.body.field}
    FROM ${req.params.table} WHERE ID_ENTIDADE = ?`

    let [dataRes] = await con.promise().query(dataSQL, ID_ENTIDADE)

    res.send(
        dataRes[0]
    )
})
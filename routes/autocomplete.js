const { app, con, jwt } = require('../server')

app.get('/codigo/:table', async(req, res) => {

    let x_session = jwt.verify(req.headers.x_session, process.env.XKEY)

    let sql = `SELECT * FROM VW_CODIGO_${req.params.table} WHERE ID_ENTIDADE = ?`

    let [data] = await con.promise().execute(sql, [x_session.ID_ENTIDADE])

    res.send(data[0])
})

app.get('/lookup/:table', async(req, res) => {

    let x_session = jwt.verify(req.headers.x_session, process.env.XKEY)

    let sql = `SELECT * FROM VW_LOOKUP_${req.params.table} WHERE ID_ENTIDADE = ? AND SN_ATIVO = 1`

    let [data] = await con.promise().execute(sql,[x_session.ID_ENTIDADE])

    res.send(data)
})
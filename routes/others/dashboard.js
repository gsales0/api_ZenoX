const { app, con, jwt, map } = require('../../server')

// ROTA PARA WIDGETS DINÂMICOS

app.post('/dashboard/:table', async(req, res) => {

    let ID_ENTIDADE = jwt.verify(req.headers.x_session, process.env.XKEY).ID_ENTIDADE

    let dataSQL = `SELECT * FROM ${req.params.table} WHERE ID_ENTIDADE = ?`

    let [dataRes] = await con.promise().query(dataSQL, ID_ENTIDADE)

    res.send(dataRes)
})
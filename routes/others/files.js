const { app, con, jwt, map } = require('../../server')

// ROTAS PARA CONSULTAR ANEXOS DINAMICAMENTE

app.get('/files/:table/:id', async(req, res) => {

    let [data] = await con.promise().query(
        `SELECT ANEXO FROM ${req.params.table} WHERE ${map[req.params.table]} = ?`,
        [req.params.id]
    )

    res.send(data[0])
})
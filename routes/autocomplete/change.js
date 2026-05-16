const { app, con, jwt, map } = require('../../server')

// ROTA PARA AUTOCOMPLETAR CAMPOS DINÂMICAMENTE

app.post('/change/:table', async(req, res) => {

    let ID_ENTIDADE = jwt.verify(req.headers.x_session, process.env.XKEY).ID_ENTIDADE
    
    let dataSQL = 
    `SELECT
        ${req.body.fill.join(', ')}
    FROM ${req.params.table}
        WHERE ${map[req.params.table]} = ? AND ID_ENTIDADE = ?`

    let [dataRes] = await con.promise().query(dataSQL, [req.body.ID, ID_ENTIDADE])

    res.send(
        dataRes[0]
    )
})
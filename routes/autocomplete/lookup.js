const { app, con, jwt, map } = require('../../server')

// ROTA PARA LOOKUP'S DINÂMICOS

app.post('/lookup/:table', async(req, res) => {

    let ID_ENTIDADE = jwt.verify(req.headers.x_session, process.env.XKEY).ID_ENTIDADE

    let dataSQL = 
    `SELECT
        ${req.body.ID} AS ID,
        CONCAT(${req.body.DS.join(",' - ',")}) AS DS
    FROM ${req.params.table}
    WHERE SN_ATIVO = 1 AND ID_ENTIDADE = ?`

    let [dataRes] = await con.promise().query(dataSQL, ID_ENTIDADE)

    res.send(dataRes)
})
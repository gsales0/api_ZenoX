const { app, con, jwt, map } = require('../../server')

// ROTA PARA CONSULTAS DINÂMICAS

app.post('/consult/:table', async(req, res) => {

    let ID_ENTIDADE = jwt.verify(req.headers.x_session, process.env.XKEY).ID_ENTIDADE
    let ID_REGISTRO = req.body.dataRow[map[req.params.table]]

    let dataSQL = `SELECT * FROM ${req.params.table} WHERE ID_ENTIDADE = ? AND ${map[req.params.table]} = ?`

    let [dataRes] = await con.promise().query(dataSQL, [ID_ENTIDADE, ID_REGISTRO])
    let subRes = {}

    for(let i = 0; i < req.body.subGrid.length; i++){
        let subSQL = `SELECT * FROM ${req.body.subGrid[i]} WHERE ${map[req.params.table]} = ?`
        let [subData] = await con.promise().query(subSQL, ID_REGISTRO)
        subRes[req.body.subGrid[i]] = subData
    }

    res.send({
        dataRow: dataRes[0],
        subGrid: subRes
    })
})
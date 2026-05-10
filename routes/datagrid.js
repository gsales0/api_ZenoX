const { app, con, jwt } = require('../server')

app.post('/dataGrid/:table', async(req, res) => {

    let token = jwt.verify(req.headers.x_session, process.env.XKEY)

    let sql = `SELECT ${req.body.DATAKEY}, ${req.body.COLUMNS.join(', ')} FROM VW_DATAGRID_${req.params.table} WHERE ID_ENTIDADE = ?`
    let values = [token.ID_ENTIDADE]

    if(req.body.DS_PESQUISA){
        let searchColumns = req.body.COLUMNS.map(col => `CAST(${col} AS CHAR) LIKE ?`).join(' OR ')

        sql += ` AND (${searchColumns})`
        req.body.COLUMNS.forEach(() => values.push(`%${req.body.DS_PESQUISA}%`))

    }

    let [data] = await con.promise().execute(sql, values)

    res.send(data)
})
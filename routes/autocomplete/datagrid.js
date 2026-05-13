const { app, con, jwt, map } = require('../../server')

// ROTA PARA GRIDS DINÂMICAS

app.post('/dataGrid/:table', async(req, res) => {

    let ID_ENTIDADE = jwt.verify(req.headers.x_session, process.env.XKEY).ID_ENTIDADE
    
    let dataSQL = `SELECT ${req.body.DATAKEY}, ${req.body.COLUMNS.join(', ')} FROM ${req.params.table} WHERE ID_ENTIDADE = ?`
    let values = [ID_ENTIDADE]

    if(req.body.DS_PESQUISA){
        let subSQL = req.body.COLUMNS.map(c => {
            values.push(`%${req.body.DS_PESQUISA}%`)
            return `CAST(${c} AS CHAR) LIKE ?`
        }).join(' OR ')

        dataSQL += ` AND (${subSQL})`
    }

    let [dataRes] = await con.promise().query(dataSQL, values)

    res.send(dataRes)
})
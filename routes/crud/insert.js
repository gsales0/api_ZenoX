const { app, con, jwt, map } = require('../../server')

// ROTA PARA INSERTS DINÂMICOS

app.post('/insert/:table', async(req, res) => {

    let conn

    try{
        conn = await con.promise().getConnection()
        await conn.beginTransaction()

        req.body.dataRow.ID_ENTIDADE = jwt.verify(req.headers.x_session, process.env.XKEY).ID_ENTIDADE

        let columns = Object.keys(req.body.dataRow)
        let values = Object.values(req.body.dataRow)

        let dataSQL = `INSERT INTO ${req.params.table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`
        let [dataRes] = await conn.query(dataSQL, values)

        if(req.body.subGrid){
            let subTable = Object.keys(req.body.subGrid)
            let subArray = Object.values(req.body.subGrid)

            for(let i = 0; i < subTable.length; i++){
                if(subArray[i] && subArray[i].length > 0){
                    subArray[i].forEach(i => {i[map[req.params.table]] = dataRes.insertId; delete i.ID})

                    let subColumns = Object.keys(subArray[i][0])
                    let subValue = []
                    let subPlace = []

                    for(let x = 0; x < subArray[i].length; x++){
                        subPlace.push(`(${subColumns.map(() => '?').join(', ')})`)
                        subColumns.forEach(c => {subValue.push(subArray[i][x][c])})
                    }

                    let subSQL = `INSERT INTO ${subTable[i]} (${subColumns.join(', ')}) VALUES ${subPlace.join(', ')}`
                    await conn.query(subSQL, subValue)
                }
            }
        }

        await conn.commit()
        await conn.release()

        res.send({
            sucess: true,
            message: "Registro salvo com sucesso!"
        })
    }
    catch(err){
        await conn.rollback()
        await conn.release()

        if(err.code == "ER_DUP_ENTRY"){
            let campo = err.sqlMessage.match(/\.([^']+)'/)[1]
            
            res.send({
                sucess: false,
                message: `Campo ${campo} já existe em outro Registro!`,
                field: campo
            })
            return
        }

        console.log(err)
        res.send({
            sucess: false,
            message: "Erro Interno!"
        })
    }
})
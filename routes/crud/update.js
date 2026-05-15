const { app, con, jwt, map } = require('../../server')

// ROTA PARA UPDATES DINÂMICOS

app.post('/update/:table', async(req, res) => {

    let conn 

    try{
        conn = await con.promise().getConnection()
        await conn.beginTransaction()

        let ID_REGISTRO = req.body.dataRow[map[req.params.table]]

        for(let i in req.body.dataRow){
            if(req.body.dataRow[i] === '')  req.body.dataRow[i] = null
        }

        let columns = Object.keys(req.body.dataRow)
        let values = Object.values(req.body.dataRow)

        let dataSQL = ` UPDATE ${req.params.table} SET ${columns.map(i => `${i} = ?`).join(', ')} WHERE ${map[req.params.table]} = ?`

        let [dataRes] = await conn.query(dataSQL, [...values, ID_REGISTRO])

        if(req.body.subGrid){
            let subTable = Object.keys(req.body.subGrid)
            let subArray = Object.values(req.body.subGrid)

            for(let i = 0; i < subTable.length; i++){
                await conn.query(`DELETE FROM ${subTable[i]} WHERE ${map[req.params.table]} = ?`, ID_REGISTRO)

                if(subArray[i] && subArray[i].length > 0){
                    subArray[i].forEach(i => {i[map[req.params.table]] = ID_REGISTRO; delete i.ID})

                    let subColumns = Object.keys(subArray[i][0])
                    let subValue = []
                    let subPlace = []

                    for(let x = 0; x < subArray[i].length; x++){
                        subPlace.push(`(${subColumns.map(() => '?').join(', ')})`)
                        
                        subColumns.forEach(c => {
                            if(subArray[i][x][c] === '') subArray[i][x][c] = null
                            subValue.push(subArray[i][x][c])
                        })
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
            message: "Registro alterado com sucesso!"
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

        if(err.code == "ER_NO_DEFAULT_FOR_FIELD" || err.code == "ER_BAD_NULL_ERROR"){
            let campo = err.sqlMessage.match(/'([^']+)'/)[1]

            res.send({
                sucess: false,
                message: `Campo: ${campo} obrigatório não preenchido!`
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
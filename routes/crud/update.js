const { app, con, jwt, map } = require('../../server')

// ROTA PARA UPDATES DINÂMICOS

app.post('/update/:table', async(req, res) => {

    let conn 

    try{
        conn = await con.promise().getConnection()
        await conn.beginTransaction()

        let ID_REGISTRO = req.body.dataRow[map[req.params.table]]
        let ID_ENTIDADE = jwt.verify(req.headers.x_session, process.env.XKEY).ID_ENTIDADE

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
                let subID = subArray[i]
                .map(r => r[map[subTable[i]]])
                .filter(id => id != null && id != '')

                if(subID.length > 0){
                    await conn.query(`DELETE FROM ${subTable[i]} WHERE ${map[subTable[i]]} NOT IN(?) AND ${map[req.params.table]} = ?`, [subID, ID_REGISTRO])
                }
                else{
                    await conn.query(`DELETE FROM ${subTable[i]} WHERE ${map[req.params.table]} = ?`, [ID_REGISTRO])
                }                

                if(subArray[i] && subArray[i].length > 0){
                    for(let x = 0; x < subArray[i].length; x++){
                        let item = subArray[i][x]
                        item[map[req.params.table]] = ID_REGISTRO
                        item.ID_ENTIDADE = ID_ENTIDADE
                        delete item.ID

                        Object.keys(item).forEach(c => {
                            if(item[c] === '') item[c] = null
                        })

                        if(item[map[subTable[i]]]){
                            
                            let itemColumns = Object.keys(item)
                            let itemValues = Object.values(item)

                            await conn.query(`
                                UPDATE ${subTable[i]} SET ${itemColumns.map(c => `${c} = ?`).join(', ')} WHERE ${map[subTable[i]]} = ?
                                `, [...itemValues, item[map[subTable[i]]]])
                        }
                        else{
                            delete item[map[subTable[i]]]

                            let itemColumns = Object.keys(item)
                            let itemValues = Object.values(item)

                            await conn.query(`
                                INSERT INTO ${subTable[i]} (${itemColumns.join(', ')}) VALUES (${itemColumns.map(() => '?').join(', ')})
                                `, itemValues)
                        }
                    }
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

        if(err.code == "ER_ROW_IS_REFERENCED_2"){
            res.send({
                sucess: false,
                message: `O registro contém dependências!`
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
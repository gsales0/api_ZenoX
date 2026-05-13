const { app, con, jwt, map } = require('../../server')

// ROTA PARA EXCLUSÕES DINÂMICAS

app.post('/delete/:table', async(req, res) => {

    let conn

    try{
        conn = await con.promise().getConnection()
        await conn.beginTransaction()

        let ID_REGISTRO = req.body.dataRow[map[req.params.table]]

        let dataSQL = `DELETE FROM ${req.params.table} WHERE ${map[req.params.table]} = ?`
        let [dataRes] = await con.promise().query(dataSQL, ID_REGISTRO)

        if(req.body.subGrid){
            let subTable = Object.keys(req.body.subGrid)

            for(let i = 0; i < subTable.length; i++){
                await conn.query(`DELETE FROM ${subTable[i]} WHERE ${map[req.params.table]} = ?`, ID_REGISTRO)
            }
        }

        await conn.commit()
        await conn.release()

        res.send({
            sucess: true,
            message: "Registro excluído com sucesso!"
        })
    }
    catch(err){
        await conn.rollback()
        await conn.release()

        console.log(err)
        res.send({
            sucess: false,
            message: "Erro Interno!"
        })

    }
})
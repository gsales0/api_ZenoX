const { app, con, jwt } = require('../server')

app.post('/delete/:table', async(req, res) => {

    let sql = `DELETE FROM ${req.params.table} WHERE ${Object.keys(req.body)[0]} = ${Object.values(req.body)[0]}`

    try{
        
    let [data] = await con.promise().execute(sql)

    if(data.affectedRows < 1){
        res.send({
            sucess: false,
            message: "Registro não encontrado"
        })
        return
    }

    res.send({
        sucess: true,
        message: "Registro excluido com sucesso!"
    })

    }
    catch(err){
        console.log(err)

        res.send({
            sucess: false,
            message: "Erro interno!"
        })
    }
})

app.post('/update/:table', async(req, res) => {

    let columns = Object.keys(req.body)
    let values = Object.values(req.body)
    let token = jwt.verify(req.headers.x_session, process.env.XKEY)


    let update = columns.map(i => `${i} = ?`).join(', ')
    let sql = `UPDATE ${req.params.table} SET ${update} WHERE ${columns[0]} = ?`

    try{
        let [data] = await con.promise().execute(sql, [...values, values[0]])

        if(data.affectedRows < 1){
            res.send({
                sucess: false,
                message: "Registro não encontrado!"
            })
            return
        }

        res.send({
            sucess: true,
            message: "Registro alterado com sucesso!"
        })
    }
    catch(err){

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
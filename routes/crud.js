const { app, con, jwt } = require('../server')

/*
app.post('/insert/:table', async(req, res) => {

    let token = jwt.verify(req.headers.x_session, process.env.XKEY)

    req.body.dataRow.ID_ENTIDADE = token.ID_ENTIDADE

    let columns = Object.keys(req.body.dataRow)
    let values = Object.values(req.body.dataRow)

    let sql = `INSERT INTO ${req.params.table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`

    try{

        let [data] = await con.promise().execute(sql, values)

        if(data.affectedRows < 1){
            res.send({
                sucess: false,
                message: "Erro Interno!"
            })
            console.log(data)
            return
        }

        console.log(data)

        let subGrid = req.body.subGrid;

if (subGrid) {
    let subTables = Object.keys(subGrid);
    let subValues = Object.values(subGrid);

    // 1. Solicita uma conexão exclusiva do Pool
    const connection = await con.promise().getConnection();

    try {
        // 2. Inicia a transação NESTA conexão específica
        await connection.beginTransaction();

        for (let i = 0; i < subTables.length; i++) {
            let tableName = subTables[i];
            let rows = subValues[i]; 

            if (rows && rows.length > 0) {
                let columns = Object.keys(rows[0]);
                let columnNamesString = columns.join(', ');
                
                let placeholdersArray = [];
                let values = []; 
                
                for (let x = 0; x < rows.length; x++) {
                    let currentRow = rows[x];
                    let rowPlaceholders = [];
                    
                    for (let col of columns) {
                        rowPlaceholders.push('?'); 
                        values.push(currentRow[col]); 
                    }
                    
                    placeholdersArray.push(`(${rowPlaceholders.join(', ')})`);
                }
                
                let sql = `INSERT INTO ${tableName} (${columnNamesString}) VALUES ${placeholdersArray.join(', ')}`;
                
                // 3. Executa a query utilizando a conexão exclusiva, e não o pool direto
                let [subData] = await connection.execute(sql, values);

                console.log(subData)

                console.log("subData")
            }
        }
        
        // 4. Se o loop terminou sem erros, comita as alterações
        await connection.commit();

    } catch (error) {
        // 5. Se der erro, desfaz tudo na conexão
        await connection.rollback();
        console.error("Erro ao inserir subGrid:", error);
        
    } finally {
        // 6. OBRIGATÓRIO: Libera a conexão de volta para o Pool (seja no sucesso ou no erro)
        connection.release();
    }
}

        res.send({
            sucess: true,
            message: "Registro salvo com sucesso!"
        })
        return
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
})*/

app.post('/consult/:table', async(req, res) => {

    let sql = `SELECT * FROM ${req.params.table} WHERE ${Object.keys(req.body)[0]} = ${Object.values(req.body)[0]}`

    let [data] = await con.promise().execute(sql)

    res.send(data[0])
})

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
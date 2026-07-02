const { app, con, jwt, map } = require('../../server')
const { querySaldo, queryCategoria, queryContas, queryProdutos } = require('../../querys/dashboard')

// ROTA PARA WIDGETS DINÂMICOS

app.post('/dashboard/:widget', async(req, res) => {

    let session = jwt.verify(req.headers.x_session, process.env.XKEY)

    let ID_ENTIDADE = session.ID_ENTIDADE
    let COMPETENCIA = {
        ID_MES: session.ID_MES,
        ID_ANO: session.ID_ANO
    }

    let dataRes
    if(req.params.widget == "default"){
        [dataRes] = await con.promise().query(querySaldo(ID_ENTIDADE, COMPETENCIA))
    }
    else if(req.params.widget == "categorias"){
        [dataRes] = await con.promise().query(queryCategoria(ID_ENTIDADE, COMPETENCIA))
    }
    else if(req.params.widget == "contas"){
        [dataRes] = await con.promise().query(queryContas(ID_ENTIDADE, COMPETENCIA))
    }
    else if(req.params.widget == "produtos"){
        [dataRes] = await con.promise().query(queryProdutos(ID_ENTIDADE, COMPETENCIA))
    }

    res.send(dataRes)
})
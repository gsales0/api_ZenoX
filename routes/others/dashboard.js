const { app, con, jwt, map } = require('../../server')
const querys = require('../../querys/dashboard')

// ROTA PARA WIDGETS DINÂMICOS

app.post('/dashboard/:widget', async(req, res) => {

    let session = jwt.verify(req.headers.x_session, process.env.XKEY)

    let ID_ENTIDADE = session.ID_ENTIDADE
    let COMPETENCIA = {
        ID_MES: session.ID_MES,
        ID_ANO: session.ID_ANO
    }

    let [dataRes] = await con.promise().query(querys[req.params.widget](ID_ENTIDADE, COMPETENCIA))

    res.send(dataRes)
})
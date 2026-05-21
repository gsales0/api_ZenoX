const { app, con, jwt, map } = require('../../server')

app.get('/consult/entidades', async(req, res) => {

    let ID_ENTIDADE = jwt.verify(req.headers.x_session, process.env.XKEY).ID_ENTIDADE

    let [data] = await con.promise().query("SELECT * FROM ENTIDADES WHERE ID_ENTIDADE = ?", ID_ENTIDADE)

    res.send(data[0])
})
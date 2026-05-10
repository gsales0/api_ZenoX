const { app, con, jwt } = require('../server')

const bcrypt = require('bcrypt')

app.get('/:alias/entidade', async(req, res) => {

    let [data] = await con.promise().execute(
        `SELECT * FROM ENTIDADES WHERE CD_ENTIDADE = ?`,
        [req.params.alias]
    )

    res.send({
        sucess: true,
        NM_ENTIDADE: data[0].NM_ENTIDADE
    })
})

app.post('/:alias/userLogin', async(req, res) => {

    let { CD_USUARIO, HS_SENHA } = req.body

    let [data] = await con.promise().execute(
        `SELECT
            U.ID_USUARIO  ,
            U.NM_USUARIO  ,
            U.HS_SENHA    ,
            U.ID_ENTIDADE    
        FROM USUARIOS U
            INNER JOIN ENTIDADES E ON U.ID_ENTIDADE = E.ID_ENTIDADE
        WHERE
            E.CD_ENTIDADE = ? AND U.CD_USUARIO = ?`,
        [req.params.alias, CD_USUARIO]
    )

    if(data.length === 0){
        res.send({
            sucess: false,
            message: "Usuário não cadastrado!"
        })
        return
    }

    let valid = await bcrypt.compare(HS_SENHA, data[0].HS_SENHA)

    if(valid){
        let token = jwt.sign(
            {
                ID_USUARIO: data[0].ID_USUARIO,
                ID_ENTIDADE: data[0].ID_ENTIDADE
            },
            process.env.XKEY,
            {expiresIn: '1h'}
        )

        res.send({
            sucess: true,
            session: token,
            NM_USUARIO: data[0].NM_USUARIO
        })
    }
    else{
        res.send({
            sucess: false,
            message: "Senha inválida!"
        })
    }
})
const { app, con, jwt, map } = require('../../server')
const { pdfmake, fonts, createPdf } = require('./reports.config')

app.post('/reports/listagem/:table', async(req, res) => {

    let ID_ENTIDADE = jwt.verify(req.headers.x_session, process.env.XKEY).ID_ENTIDADE
    let [entidade] = await con.promise().query('SELECT * FROM ENTIDADES WHERE ID_ENTIDADE = ?', ID_ENTIDADE)

    let [dados] = await con.promise().query(`SELECT * FROM ${req.params.table} WHERE ID_ENTIDADE = ?`, ID_ENTIDADE)

    let docDefinition = createPdf(entidade, req.body.columns, dados)

    pdfmake.addFonts(fonts)

    pdfmake.createPdf(docDefinition).getBase64().then((data) => {

        const base64String = 'data:application/pdf;base64,' + data;
        res.send({ success: true, file: base64String });
        
    }).catch(err => {
        console.error("Erro interno ao gerar o PDF:", err);
        res.status(500).send({ error: 'Falha na geração do PDF' });
    });
})
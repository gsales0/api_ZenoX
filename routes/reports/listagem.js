const { app, con, jwt, map } = require('../../server')
const pdfmake = require('pdfmake')
const path = require('path');

const fonts = {
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    }
};

pdfmake.setUrlAccessPolicy(() => true);
pdfmake.setLocalAccessPolicy(() => true);

app.post('/reports/listagem', async(req, res) => {

    let ID_ENTIDADE = jwt.verify(req.headers.x_session, process.env.XKEY).ID_ENTIDADE

    let [data] = await con.promise().query('SELECT * FROM ENTIDADES WHERE ID_ENTIDADE = ?', ID_ENTIDADE)

    let docDefinition = {
        defaultStyle: { font: 'Helvetica' },
        pageSize: 'A4',
        pageMargins: [ 40, 60, 40, 60 ],
        content: [
            {text: data[0].NM_ENTIDADE, style: "header"}
        ] 
    }

    pdfmake.addFonts(fonts)

    pdfmake.createPdf(docDefinition).getBase64().then((data) => {
        // O pdfmake devolve a string limpa. Nós só colamos o cabeçalho do navegador:
        const base64String = 'data:application/pdf;base64,' + data;
        res.send({ success: true, file: base64String });
        
    }).catch(err => {
        console.error("Erro interno ao gerar o PDF:", err);
        res.status(500).send({ error: 'Falha na geração do PDF' });
    });
})
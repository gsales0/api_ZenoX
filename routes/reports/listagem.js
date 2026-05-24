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

const createPdf = function(entidade){

    return config = {
        defaultStyle: { font: 'Helvetica' },
        pageSize: 'A4',
        pageMargins: [ 40, 130, 40, 60 ],

        header: function(currentPage, pageCount) {
            return {
                margin: [40, 30, 40, 0],
                stack: [
                    {
                        columns: [
                            {
                                image: entidade[0].ANEXO,
                                width: 90,
                            },
                            {
                                stack: [
                                    { text: entidade[0].DS_ENTIDADE, fontSize: 16, bold: true,margin: [0, 0, 0, 5] },
                                    { text: `${entidade[0].DS_ENDERECO}, ${entidade[0].NUM_ENDERECO} - ${entidade[0].DS_CIDADE}`, fontSize: 9, color: '#444',margin: [0, 0, 0, 5] },
                                    { text: `CNPJ: ${entidade[0].CNPJ}`, fontSize: 9, color: '#444' },
                                    { text: "Relatório de Listagem", fontSize: 14, bold: true, margin: [0, 25, 0, 0], color: "red"}
                                ],
                                alignment: 'right',
                                margin: [0, 5, 0, 0]
                            }
                        ]
                    },
                    {
                        canvas: [
                            { 
                                type: 'line', 
                                x1: 0, y1: 10, 
                                x2: 515, y2: 10,
                                lineWidth: 0.5, 
                                lineColor: '#bcbcbc' 
                            }
                        ]
                    }
                ]
            }
        }
    }
}

pdfmake.setUrlAccessPolicy(() => true);
pdfmake.setLocalAccessPolicy(() => true);

app.post('/reports/listagem/:table', async(req, res) => {

    let ID_ENTIDADE = jwt.verify(req.headers.x_session, process.env.XKEY).ID_ENTIDADE

    let [data] = await con.promise().query('SELECT * FROM ENTIDADES WHERE ID_ENTIDADE = ?', ID_ENTIDADE)

    let columns = Object.keys(req.body)

    let reportColumns = columns.map(i => {
        return { text: i, bold: true, fillColor: '#f3f4f6' }
    })

    let [dados] = await con.promise().query(`SELECT ${columns.join(', ')} FROM ${req.params.table} WHERE ID_ENTIDADE = ?`, ID_ENTIDADE)


    let tratados = []
    dados.forEach(i => {
        let row = []
        for(let x of columns){
            row.push(i[x])
        }
        tratados.push(row)
    })

    let docDefinition = createPdf(data)

    pdfmake.addFonts(fonts)

    pdfmake.createPdf(docDefinition).getBase64().then((data) => {

        const base64String = 'data:application/pdf;base64,' + data;
        res.send({ success: true, file: base64String });
        
    }).catch(err => {
        console.error("Erro interno ao gerar o PDF:", err);
        res.status(500).send({ error: 'Falha na geração do PDF' });
    });
})
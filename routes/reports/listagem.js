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
        pageMargins: [ 40, 130, 40, 60 ],

        header: function(currentPage, pageCount) {
            return {
                margin: [40, 30, 40, 0], // [esquerda, cima, direita, baixo]
                stack: [
                    {
                        columns: [
                            // LADO ESQUERDO: A LOGO
                            {
                                image: data[0].ANEXO,
                                width: 90, // Largura fixa para não desalinhar
                            },
                            // LADO DIREITO: INFO DA ENTIDADE
                            {
                                stack: [
                                    { text: data[0].DS_ENTIDADE, fontSize: 12, bold: true,margin: [0, 0, 0, 5] },
                                    { text: `${data[0].DS_ENDERECO}, ${data[0].NUM_ENDERECO} - ${data[0].DS_CIDADE}`, fontSize: 9, color: '#444',margin: [0, 0, 0, 5] },
                                    { text: `CNPJ: ${data[0].CNPJ}`, fontSize: 9, color: '#444' },
                                ],
                                alignment: 'right',
                                margin: [0, 5, 0, 0] // Ajuste fino para alinhar com a logo
                            }
                        ]
                    },
                    // LINHA DIVISÓRIA (O toque de classe)
                    {
                        canvas: [
                            { 
                                type: 'line', 
                                x1: 0, y1: 10, 
                                x2: 515, y2: 10, // 515 é a largura útil do A4 (595 - 80 de margens)
                                lineWidth: 0.5, 
                                lineColor: '#bcbcbc' 
                            }
                        ]
                    }
                ]
            }
        }
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
const pdfmake = require('pdfmake')

pdfmake.setUrlAccessPolicy(() => true);
pdfmake.setLocalAccessPolicy(() => true);

const fonts = {
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    }
};

const createPdf = function(entidade, columns, data) {

    // 1. Converter os "widths" (4, 12, etc) em porcentagens exatas para preencher 100% da página
    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
    const pdfWidths = columns.map(col => `${(col.width / totalWidth) * 100}%`);

    // 2. Montar a linha de CABEÇALHO da tabela (usando o "label" das colunas)
    const tableHeader = columns.map(col => ({
        text: col.label.toUpperCase(),
        bold: true,
        fontSize: 9,
        fillColor: '#dedede', // Fundo cinza claro para combinar com o Grid do ZENO-X
        margin: [4, 5, 4, 5]
    }));

    // 3. Montar as linhas de DADOS varrendo a tabela e depois as colunas
    const tableBody = data.map(linhaBanco => {
        return columns.map(col => {
            let valor = linhaBanco[col.field];

            // Bônus: Tratamento genérico para campos tipo "SN_" (Sim/Não)
            if (col.field.startsWith('SN_')) {
                valor = valor == 1 ? "Sim" : "Não";
            }

            return {
                // Garante que se o banco trouxer null, ele não imprima "null" escrito no PDF
                text: valor !== null && valor !== undefined ? String(valor) : '',
                fontSize: 9,
                margin: [4, 3, 4, 3]
            };
        });
    });

    // 4. Retornar a configuração completa
    return {
        defaultStyle: { font: 'Helvetica' },
        pageSize: 'A4',
        pageMargins: [ 40, 130, 40, 60 ],

        // Seu cabeçalho com a logo e dados da empresa (Intacto)
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
                                    { text: entidade[0].DS_ENTIDADE, fontSize: 16, bold: true, margin: [0, 0, 0, 5] },
                                    { text: `${entidade[0].DS_ENDERECO}, ${entidade[0].NUM_ENDERECO} - ${entidade[0].DS_CIDADE}`, fontSize: 9, color: '#444', margin: [0, 0, 0, 5] },
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
        },

        // 5. NOVO: A propriedade CONTENT onde a tabela é desenhada dinamicamente!
        content: [
            {
                table: {
                    headerRows: 1,      // Repete o cabeçalho se a tabela quebrar para a página 2
                    widths: pdfWidths,  // Usa a largura em porcentagem que calculamos no passo 1
                    body: [
                        tableHeader,    // Linha 1: Os Labels
                        ...tableBody    // Linhas Seguintes: Os Dados espalhados usando Spread (...)
                    ]
                },
                // Usa um design nativo do pdfmake limpo, só com linhas horizontais, bem moderno
                layout: 'lightHorizontalLines' 
            }
        ]
    };
}

module.exports = {
    pdfmake: pdfmake,
    fonts: fonts,
    createPdf: createPdf,
}
CREATE TABLE MOVIMENTACOES (
    ID_MOVIMENTACAO     INT PRIMARY KEY AUTO_INCREMENT  ,
    ID_ENTIDADE         INT NOT NULL                    ,
    TP_MOVIMENTACAO     VARCHAR(1) NOT NULL             , -- 'V' Venda, 'O' Ordem de Serviço
    DT_MOVIMENTACAO     DATE NOT NULL                   ,
    ID_PESSOA           INT NOT NULL                    , -- Cliente
    ID_CONTRATO         INT                             , -- Caso a OS seja recorrente
    DS_MOVIMENTACAO     VARCHAR(100) NOT NULL           ,
    CD_STATUS           VARCHAR(1) NOT NULL             , -- 'O' Orçamento, 'A' Aprovado, 'L' Liquidado, 'P' Pago
    VL_DESCONTO         DECIMAL(10,2)                   ,
    VL_MOVIMENTACAO     DECIMAL(10,2) NOT NULL          , -- Valor Total (Já com desconto)
    CD_METODO           VARCHAR(1)                      ,
    ID_CONTA            INT                             ,
    HISTORICO           VARCHAR(250)                    ,
    
    FOREIGN KEY (ID_ENTIDADE) REFERENCES ENTIDADES(ID_ENTIDADE) ,
    FOREIGN KEY (ID_PESSOA) REFERENCES PESSOAS(ID_PESSOA)       ,
    FOREIGN KEY (ID_CONTRATO) REFERENCES CONTRATOS(ID_CONTRATO) ,
    FOREIGN KEY (ID_CONTA) REFERENCES CONTAS(ID_CONTA)
);

CREATE TABLE MOVIMENTACOES_ITENS (
    ID_MOVIMENTACAO_ITEM INT PRIMARY KEY AUTO_INCREMENT  ,
    ID_MOVIMENTACAO      INT NOT NULL                    ,
    ID_ENTIDADE          INT NOT NULL                    ,
    ID_PRODUTO           INT NOT NULL                    , -- Produto/Serviço vendido
    DS_ITENS             VARCHAR(100)                    , -- Descrição extra (ex: cor, tamanho)
    UN_MEDIDA            VARCHAR(10)                     ,
    QT_ITENS             DECIMAL(10,3) NOT NULL          ,
    VL_UNITARIO          DECIMAL(10,2) NOT NULL          ,
    VL_TOTAL             DECIMAL(10,2) NOT NULL          ,
    
    FOREIGN KEY (ID_MOVIMENTACAO) REFERENCES MOVIMENTACOES(ID_MOVIMENTACAO) ,
    FOREIGN KEY (ID_ENTIDADE) REFERENCES ENTIDADES(ID_ENTIDADE)             ,
    FOREIGN KEY (ID_PRODUTO) REFERENCES PRODUTOS(ID_PRODUTO)
);

ALTER TABLE MOVIMENTACOES_ITENS DROP COLUMN UN_MEDIDA;
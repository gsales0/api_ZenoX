CREATE TABLE ESTOQUE (
    ID_ESTOQUE          INT PRIMARY KEY AUTO_INCREMENT  ,
    ID_ENTIDADE         INT NOT NULL                    ,
    DT_ESTOQUE          DATE NOT NULL                   ,
    TP_ESTOQUE          VARCHAR(1) NOT NULL             , -- 'E' Entrada, 'S' Saída
    DS_ESTOQUE          VARCHAR(100) NOT NULL           ,
    ID_PESSOA           INT                             , -- Fornecedor ou Cliente
    DOC_ESTOQUE         VARCHAR(50)                     , -- NF, Recibo, etc
    CD_STATUS           VARCHAR(1) NOT NULL             , -- 'A' Aberto, 'E' Efetivado, 'C' Cancelado
    VL_ESTOQUE          DECIMAL(10,2)                   , -- Total da movimentação
    CD_METODO           VARCHAR(1)                      ,
    ID_CONTA            INT                             ,
    HISTORICO           VARCHAR(250)                    ,
    
    FOREIGN KEY (ID_ENTIDADE) REFERENCES ENTIDADES(ID_ENTIDADE) ,
    FOREIGN KEY (ID_PESSOA) REFERENCES PESSOAS(ID_PESSOA)       ,
    FOREIGN KEY (ID_CONTA) REFERENCES CONTAS(ID_CONTA)
);

CREATE TABLE ESTOQUE_ITENS (
    ID_ESTOQUE_ITEM     INT PRIMARY KEY AUTO_INCREMENT  ,
    ID_ESTOQUE          INT NOT NULL                    ,
    ID_ENTIDADE         INT NOT NULL                    ,
    ID_PRODUTO          INT NOT NULL                    , -- Produto/Serviço
    DS_ITENS            VARCHAR(100)                    ,
    UN_MEDIDA           VARCHAR(10)                     ,
    QT_ITENS            DECIMAL(10,3) NOT NULL          , -- 10,3 para permitir Kg, Metros (ex: 1.500)
    VL_UNITARIO         DECIMAL(10,2) NOT NULL          ,
    VL_TOTAL            DECIMAL(10,2) NOT NULL          ,
    
    FOREIGN KEY (ID_ESTOQUE) REFERENCES ESTOQUE(ID_ESTOQUE)     ,
    FOREIGN KEY (ID_ENTIDADE) REFERENCES ENTIDADES(ID_ENTIDADE) ,
    FOREIGN KEY (ID_PRODUTO) REFERENCES PRODUTOS(ID_PRODUTO) -- Ajuste para o nome real da sua tabela de produtos
);

ALTER TABLE ESTOQUE_ITENS DROP COLUMN UN_MEDIDA;
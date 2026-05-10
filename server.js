require('dotenv').config()

// Servidor Express
const express = require('express')
const cors = require('cors')
const http = require('http')

const app = express()

app.use(cors({ origin: "*" }))
app.use(express.json())

const server = http.createServer(app)

server.listen(process.env.PORT, () => {
    console.log("Servidor Live!! Porta:", process.env.PORT)
})

// Conexão com Banco de Dados
const mysql = require('mysql2')

const con = mysql.createPool({
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBDATA
})

con.getConnection((err, suc) => {
    if(err) throw err
    console.log("Conectado com Banco de Dados! Database:", process.env.DBDATA)
    suc.release()
})

// Exporta os Módulos
const jwt = require('jsonwebtoken')

module.exports = {
    app: app,
    con: con,
    jwt: jwt
}
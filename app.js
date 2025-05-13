const http = require('http')
const express = require('express')
const app = express()
const PORT = 3000
const router = require("./routes/router")
const session = require("express-session")
const cors = require("cors")
const PATH=require('path')

app.use(cors())
app.use(express.json());
app.use(express.static(PATH.join(__dirname, 'gui')));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, maxAge: 24 * 60 * 60 * 1000
    }
}))


app.use(router)


app.listen(PORT, () => {
    console.log("listening on 3000")
})
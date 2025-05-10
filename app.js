const http = require('http')
const express = require('express')
const app = express()
const PORT = 3000
const router = require("./routes/router")


app.use(express.json());
app.use(express.static('public'))
app.use(router)


app.listen(PORT, () => {
    console.log("listening on 3000")
})
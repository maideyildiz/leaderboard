const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.send('Hello Worlduuuuuuu')
})

app.listen(3000)
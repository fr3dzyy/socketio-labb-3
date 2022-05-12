const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server)
const port = 3000

const mongo = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'
let db

mongo.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, client) => {
    if (err) {
      console.error(err)
      return
    }
    db = client.db('nodesocket')
    messages = db.collection('messages')
    dicethrows = db.collection('dicethrows')
  }
)

app.use(express.static('public'))

app.get('/messages', (req, res) => {
  messages.find().toArray((err, items) => {
    if (err) throw err
    res.json({ messages: items })
  })
})

app.get('/dicethrows', (req, res) => {
  dicethrows.find().toArray((err, items) => {
    if (err) throw err
    res.json({ dicethrows: items })
  })
})

io.on('connection', (socket) => {
  console.log(`A client with id ${socket.id} connected to the chat!`)

  socket.on('chatMessage', (msg) => {
    console.log('Meddelanden: ' + msg.message)
    io.emit('newChatMessage', msg.user + ' : ' + msg.message)
    let today = new Date()
    let date =
      today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
    let time =
      today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds()
    let dateTime = date + ' ' + time
    messages.insertOne(
      {
        user: msg.user,
        message: msg.message,
        date: dateTime,
      },
      (err, result) => {
        if (err) throw err
        console.log(result)
      }
    )
  })

  socket.on('newRoll', (data) => {
    io.emit(
      'newUserData',
      data.user +
        ' gets nr: ' +
        data.value +
        ' Roll-count: ' +
        data.count +
        ' Total: ' +
        data.totalAmount
    )
    let today = new Date()
    let date =
      today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
    let time =
      today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds()
    let dateTime = date + ' ' + time
    dicethrows.insertOne(
      {
        date: dateTime,
        user: data.user,
        count: data.count,
        value: data.value,
        totalAmount: data.totalAmount,
      },
      (err, result) => {
        if (err) throw err
        console.log(result)
      }
    )
  })

  socket.on('disconnect', () => {
    console.log(`Client ${socket.id} disconnected!`)
  })
})

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
})

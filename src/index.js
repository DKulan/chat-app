const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const path = require('path')

const app = express()

const server = http.createServer(app)
const io = socketio(server)

const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))


io.on('connection', (socket) => {
    console.log('New web socket connection.')
    socket.emit('message', 'Welcome!')

    // Broadcast to all users except the one that joined.
    socket.broadcast.emit('userConnected', 'A new user has joined!')

    socket.on('disconnect', () => {
        io.emit('userDisconnected', 'User has disconnected.')
    })

    socket.on('userMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.emit('message', message)

        // Acknowledgement
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', `https://google.com/maps?q=${coords.lat},${coords.lon}`)
        callback()
    })

})

server.listen(3000, () => {
    console.log('Listening on port 3000')
})
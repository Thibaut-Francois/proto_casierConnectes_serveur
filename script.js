const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const ip  = require('ip');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const ipAdress = ip.address();  


app.get('/', (req, res) => {
    //send ip address to client
    res.send(ipAdress);
});

io.on('connection', (socket) => {
    console.log('Un client est connecté');

    // Écouter les messages du client
    socket.on('message', (data) => {
        console.log('Message reçu du client:', data);
        // Envoyer une réponse au client
        socket.emit('response', { data: 'Message bien reçu par le serveur Node.js!' });
    });

    socket.on('disconnect', () => {
        console.log('Un client s\'est déconnecté');
    });
});

server.listen(3000, () => {
    console.log('Serveur Socket.IO en écoute http://'+ipAdress+':3000');
});

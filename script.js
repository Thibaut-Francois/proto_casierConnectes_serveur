const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const ip  = require('ip');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const ipAdress = ip.address();  

// node script.js


// Stocker les clients connectés par type
const clients = {
    clientTablette: null,
    clientServoMoteur: null
};

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

    socket.on('register', (clientType) => {
        if (clientType === 'clientTablette' || clientType === 'clientServoMoteur') {
            clients[clientType] = socket; // Stocker la référence du client
            console.log(`Client enregistré : ${clientType} (${socket.id})`);
        }
    });

    // Écouter les messages de clientTablette et les envoyer à clientServoMoteur
    socket.on('commandeCasier', (data) => {
        console.log('Commande reçue de clientTablette:', data);
    
        // Rechercher un client ServoMoteur et lui envoyer la commande
        // console.log(clients.clientServoMoteur);
        // io.sockets.sockets.forEach((client) => {
        //     //console.log(client.clientType);
        //     if (client.clientType === 'clientServoMoteur') {
        //         client.emit('commandeCasier', data);
        //         console.log('Commande envoyée à clientServoMoteur');
        //     }
        // });

        if (clients.clientServoMoteur){
            clients.clientServoMoteur.emit('commandeCasier', data);
            console.log('CCommande envoyée à clientServoMoteur');
        }
    });


    socket.on('disconnect', () => {
        console.log('Un client s\'est déconnecté');

         // Supprimer le client de la liste s'il se déconnecte
        Object.keys(clients).forEach((key) => {
            if (clients[key] && clients[key].id === socket.id) {
                clients[key] = null;
                console.log(`Client ${key} supprimé de la liste`);
            }
        });
    });
});

server.listen(3000, () => {
    console.log('Serveur Socket.IO en écoute http://'+ipAdress+':3000');
});

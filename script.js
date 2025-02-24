const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const ip  = require('ip');
const cors = require("cors");

const app = express();
const server = http.createServer(app);
//const io = socketIo(server);
const ipAdress = ip.address(); 
const { Server } = require("socket.io"); // Import de socket.io pour le serveur

app.use(cors({
    //origin: "http://127.0.0.1:5500", // Autorise uniquement cette origine
    origin: "*", // Autorise uniquement cette origine
    methods: ["GET", "POST"]
}));

const io = new Server(server, {
    cors: {
        origin: "*", // 🔹 Autorise uniquement les connexions depuis ton navigateur
        methods: ["GET", "POST"]
    }
});

// node script.js

const table = {
    0: { tool: 'tournevis', locker: 1, isOpen: false },
    1: { tool: 'marteau', locker: 2, isOpen: false },
    2: { tool: 'clé', locker: 3, isOpen: false }
}

const tableJ = JSON.stringify(table, null, 2);
console.log(tableJ);

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(tableJ);
});




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

    // Envoyer la table actuelle au client qui vient de se connecter
    socket.emit("updateTable", table);

    // Écouter les demandes de mise à jour de la table
    socket.on("updateLocker", ({ id, isOpen }) => {
        if (table[id]) {
            table[id].isOpen = isOpen; // Modifier la valeur
            console.log(`Casier ${id} mis à jour :`, table[id]);

            // Envoyer la mise à jour à tous les clients
            io.emit("updateTable", table);
        }
    });

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

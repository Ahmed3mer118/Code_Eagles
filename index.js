
import WebSocket from 'ws';

// Create a WebSocket server
// const server = new WebSocket.Server({ port: 8000 });
// const clients = new Set();
// console.log(clients)
const wssWebSocket = new WebSocket('wss://code-eagles.vercel.app/');
console.log(wssWebSocket.url);

wssWebSocket.close();



// server.on('connection', (socket) => {
//   clients.add(socket);
//   console.log('New client connected');

//   socket.on('message', (message) => {
//     console.log(`Received: ${message}`);
//     // Broadcast the message to all connected clients
//     clients.forEach(client => {
//       if (client !== socket && client.readyState === WebSocket.OPEN) {
//         client.send(message);
//       }
//     });
//   });

//   socket.on('close', () => {
//     clients.delete(socket);
//     console.log('Client disconnected');
//   });
// });

// console.log('WebSocket server is running on ws://localhost:8000');
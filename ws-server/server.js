import http from 'http';
import { WebSocketServer } from 'ws';
import setupWebSocket from './websocket.js';

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'Server is running' }));
});

const wss = new WebSocketServer({ server });
setupWebSocket(wss);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

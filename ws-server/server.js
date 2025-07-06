import http from 'http';
import { WebSocketServer } from 'ws';

const PORT = 9000;

const chatrooms = new Map();

//populate with user data
//like this:
/* {
    userID : id,
    opened-chatroom: id,
    to-message: contact-id
} */

const server = http.createServer((req, res) => {
    if(req.method === 'GET'){
        console.log(`${req.method} method received`);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Hello World');
    }
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {

    let ws_user = null;
    
    ws.on('message', (data) => {
        try{
            const user = JSON.parse(data);

            if(!user.userID){
                console.warn('Missing userID in message');
                return;
            }

            ws_user = user.userID;

            chatrooms.set(user.userID, {
                socket: ws,
                openedChatRoom: user['opened-chatroom'],
                toMessage : user['to-message']
            });

            console.log(`User ${user.userID} added to chatrooms temp data / open chatrooms`);
            console.log([...chatrooms]);
        }catch(e){
            console.error(`Invalid JSON received:`, e.message);
        }
    });

    ws.on('close', () => {

        if (ws_user !== null) {
            chatrooms.delete(ws_user);
            console.log(`User ${ws_user} disconnected and removed from chatrooms`);
        } else {
            console.log('A user disconnected, but no userID was associated');
        }

        console.log([...chatrooms]);
        //delete ws_user from chatrooms
    });
});

server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`Connected to port ${PORT}`);
});
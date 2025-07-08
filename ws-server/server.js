import http from 'http';
import { WebSocketServer } from 'ws';

const PORT = 9000;

const chatrooms = new Map();

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

            console.log(user);

            switch(user.type){
                case 'set_chatroom':
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

                    ws.send(JSON.stringify({
                        type: 'ready',
                        message: 'can send message'
                    }));
                    break;

                case 'sent_message':
                    if(!user.userID){
                        console.warn('Missing userID in message');
                        return;
                    }

                    console.log(`${ws_user} sent a message to ${user.receiver} on chatroom ${user.chatroomID}`);

                    //find user.receiver in users listed in chatrooms. user.receiver === chatrooms.id
                    const targetUser = chatrooms.get(user.receiver);

                    if(!targetUser){
                        console.warn('There is no target user');
                    }

                    targetUser.socket.send(JSON.stringify({
                        type: 'received_message',
                        chatroomID: user.chatroomID,
                        from: user.userID,
                        message: user.message
                    }));

                    break;
            }

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

server.listen(PORT,'0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`Connected to port ${PORT}`);
});
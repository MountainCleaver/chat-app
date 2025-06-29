import pool from "./db.js";

const clients = new Map();

export default function setupWebSocket(wss){
    wss.on('connection', (ws, req) => {
        let userId = null;

        ws.on('message', async (data) => {
            try{
                const payload = JSON.parse(data);

                if(payload.type === 'init'){
                    userId = payload.userId;
                    clients.set(userId, ws);
                    console.log(`User ${userId} connected`);
                    return;
                }

                if(payload.type === 'send_message'){
                    const {sender, receiver, chatroom_id, message} = payload;

                    const [result] = await pool.query(`
                            INSERT INTO messages (chatroom_id, sender, receiver, message, timestamp, read_receipt) VALUES (?,?,?,?, NOW(), 'unread')
                        `, [chatroom_id, sender, receiver, message]);
                                         const [rows] = await pool.query(`SELECT * FROM messages WHERE id = ?`, [result.insertId]);

                if(clients.has(receiver)){
                    clients.get(receiver).send(JSON.stringify({
                        type: 'new_message',
                        message: rows[0]
                    }));
                }
                }


            }catch(err){
                console.error('Error handling message:', err);
            }
        });
        ws.on('close', () => {
            if(userId){
                clients.delete(userId);
                console.log(`User ${userId} disconnected`)
            }
        });
    });
}
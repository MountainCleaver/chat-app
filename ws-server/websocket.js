import pool from "./db.js";

const clients = new Map(); // userId -> { ws, activeChatroomId }

export default function setupWebSocket(wss) {
    wss.on('connection', (ws, req) => {
        let userId = null;

        ws.on('message', async (data) => {
            try {
                const payload = JSON.parse(data);

                // Initialize connection with userId
                if (payload.type === 'init') {
                    userId = payload.userId;
                    clients.set(userId, { ws, activeChatroomId: null });
                    console.log(`User ${userId} connected`);
                    return;
                }

                // Track which chatroom the user is viewing
                if (payload.type === 'chatroom_change') {
                    const client = clients.get(payload.userId);
                    if (client) {
                        client.activeChatroomId = payload.chatroomId;
                        console.log(`User ${payload.userId} switched to chatroom ${payload.chatroomId}`);
                    }
                    return;
                }

                // Handle message sending
                if (payload.type === 'send_message') {
                    const { sender, receiver, chatroom_id, message } = payload;

                    const [result] = await pool.query(`
                        INSERT INTO messages (chatroom_id, sender, receiver, message, timestamp, read_receipt)
                        VALUES (?, ?, ?, ?, NOW(), 'unread')
                    `, [chatroom_id, sender, receiver, message]);

                    const [rows] = await pool.query(`SELECT * FROM messages WHERE id = ?`, [result.insertId]);

                    const client = clients.get(receiver);
                    if (client && client.activeChatroomId === chatroom_id) {
                        client.ws.send(JSON.stringify({
                            type: 'new_message',
                            message: rows[0]
                        }));
                    }
                    return;
                }

            } catch (err) {
                console.error('Error handling message:', err);
            }
        });

        ws.on('close', () => {
            if (userId && clients.has(userId)) {
                clients.delete(userId);
                console.log(`User ${userId} disconnected`);
            }
        });
    });
}

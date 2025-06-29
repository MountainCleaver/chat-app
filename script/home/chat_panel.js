let ws;
let currentUserId = null;
let toUserId = null;
let chatroomId = null;

document.addEventListener('DOMContentLoaded', async () => {
    await initializeUser(); // fetch session info
    await toMessage();
});

window.addEventListener('toMessageChanged', async () => {
    await toMessage();
});

async function initializeUser() {
    const res = await fetch('config/session.php', {
        method: 'POST',
        credentials: 'include'
    });

    const json = await res.json();
    currentUserId = json.data.id;

    if (!currentUserId) {
        throw new Error("Session user not found.");
    }

    // Establish WebSocket after confirming user ID
    ws = new WebSocket("ws://localhost:3000");

    ws.addEventListener('open', () => {
        ws.send(JSON.stringify({ type: "init", userId: currentUserId }));
        console.log("WebSocket connection opened");
    });

    ws.addEventListener('message', (event) => {
        const payload = JSON.parse(event.data);
        if (payload.type === 'new_message') {
            displayMessage(payload.message, 'incoming');
        }
    });

    ws.addEventListener('close', () => {
        console.log('WebSocket closed');
    });
}

const contact_name = document.getElementById('contact-name');
const contact_email = document.getElementById('contact-email');
const message_input = document.getElementById('chat');
const send_button = document.getElementById('send-btn');
const chat_space = document.getElementById('chat-log');

send_button.addEventListener('click', () => {
    const msg = message_input.value.trim();
    if (!msg || !ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({
        type: 'send_message',
        sender: currentUserId,
        receiver: toUserId,
        chatroom_id: chatroomId,
        message: msg
    }));

    displayMessage({ message: msg }, 'outgoing');
    message_input.value = '';
});

message_input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
        const msg = message_input.value.trim();
        if (!msg || !ws || ws.readyState !== WebSocket.OPEN) return;

        ws.send(JSON.stringify({
            type: 'send_message',
            sender: currentUserId,
            receiver: toUserId,
            chatroom_id: chatroomId,
            message: msg
        }));

        displayMessage({ message: msg }, 'outgoing');
        message_input.value = '';
    }
});

async function toMessage() {
    try {
        const url_contact = 'apis/home/message.php';
        const response_to_message = await fetch(url_contact, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (!response_to_message.ok) {
            throw new Error('Response not okay with getting contact to message');
        }

        const data_to_message = await response_to_message.json();

        if (!data_to_message.data) {
            throw new Error('Add a Contact or Select a contact to start messaging');
        }

        const contact_username = data_to_message.data.username;
        const contact_email_address = data_to_message.data.email;

        toUserId = data_to_message.data.id;
        chatroomId = data_to_message.data.chatroom_id;

        contact_name.textContent = contact_username.charAt(0).toUpperCase() + contact_username.slice(1);
        contact_email.textContent = contact_email_address;
        chat_space.innerHTML = ``;

        // 🆕 Get previous messages
        await fetchAndRenderMessages(chatroomId);

    } catch (e) {
        contact_name.textContent = "Contact Username will appear here";
        contact_email.textContent = "Contact Email will appear here";
        chat_space.innerHTML = `<p style="text-align:center;">${e.message}</p>`;
        console.error(`Error: ${e}`);
    }
}


function displayMessage(msg, type) {
    const bubble = document.createElement('div');
    bubble.className = type === 'incoming' ? 'incoming-msg' : 'outgoing-msg';
    bubble.textContent = msg.message;
    chat_space.appendChild(bubble);
    chat_space.scrollTop = chat_space.scrollHeight;
}


async function fetchAndRenderMessages(chatroomId) {
    try {
        const res = await fetch('apis/home/fetch_messages.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (!res.ok) throw new Error("Failed to fetch messages");

        const json = await res.json();
        if (!json.status) throw new Error(json.message);

        chat_space.innerHTML = ''; // clear before render

        json.data.forEach(msg => {
            const type = msg.sender === currentUserId ? 'outgoing' : 'incoming';
            displayMessage({ message: msg.message }, type);
        });

    } catch (e) {
        chat_space.innerHTML = `<p style="text-align:center;">${e.message}</p>`;
        console.error('Message fetch error:', e);
    }
}

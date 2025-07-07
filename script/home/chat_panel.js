import { type } from "os";

/* document.addEventListener('DOMContentLoaded', async () => {
    await toMessage();
}); */
const online_status = document.getElementById('online-status');


window.addEventListener('toMessageChanged', async () => {
    await toMessage();
});

const websocket = new WebSocket('ws://192.168.100.57:9000'); //change to your PC's local Ip address //I did it like this because I am also testing on my phone.  A good appraoch is to make it dynamic by fetching your ip address via API

let chat_session = null;
let can_message = false;

websocket.addEventListener('open', () => {
    console.log('connected to web soket');
    online_status.style.backgroundColor = 'green';
    online_status.innerHTML = `Online`
});

websocket.addEventListener('message', (e) => {
    try{
        const data = JSON.parse(e.data);
        if (data.type === 'ready') {
            can_message = true;
            console.log('Ready to send message')
        }
    }catch(e){
        console.log('Received invalid message from server')
    }
});

websocket.addEventListener('close', () => {
    console.log('connected to web soket');
    online_status.style.backgroundColor = 'red';
    online_status.innerHTML = `Offline &nbsp;<button type="button" onclick="window.location.reload()">Refresh</button>`;
    can_message = false;
});


const contact_name = document.getElementById('contact-name');
const contact_email = document.getElementById('contact-email');

const chat_space = document.getElementById('chat-log');
const chat_input = document.getElementById('chat');
const chat_send  = document.getElementById('chat-send-btn');

const chat_interface = document.getElementById('chat-interface');

async function toMessage () {//sets the messaging UI, or : adds username, email, and messages to the chat panel
        try{
            const url_contact = 'apis/home/message.php'
            const response_to_message = await fetch(url_contact, {
                method : 'POST',
                headers : {'Content-Type':'application/json'},
                credentials : 'include'
            });

            if(!response_to_message.ok){
                throw new Error('Response not okay with getting contact to message');
            }

            const data_to_message = await response_to_message.json();
            
            if(!data_to_message.data){
                throw new Error('Add a Contact or Select a contact to start messaging');
            }//trigger if data is null or if there is no target user yet


            //these code should not be triggered if datadata is null right
            const contact_username =  data_to_message.data.username;
            const contact_email_address =  data_to_message.data.email;

            contact_name.textContent = contact_username.charAt(0).toUpperCase() + contact_username.slice(1);
            contact_email.textContent = contact_email_address;

            chat_space.innerHTML = ``;

            console.log(data_to_message);
            chat_session = setValuesForWebsocket(
                data_to_message.current_user_id, 
                data_to_message.data.id,
                data_to_message.data.chatroom_id,
            );

            if (websocket.readyState === WebSocket.OPEN && chat_session !== null){
                websocket.send(JSON.stringify(chat_session));
            }
        }catch(e){
            contact_name.textContent = "Contact Username will appear here";
            contact_email.textContent = "Contact Email will appear here";
            chat_space.innerHTML = `<p style="text-align:center;">${e.message}</p>`;
            console.error(`Error: ${e}`);
        }
    }

function setValuesForWebsocket(currentuserID, targetuserID, chatroomID){

    return {
        userID: currentuserID,
        'to-message' : targetuserID,
        'opened-chatroom': chatroomID
    };
}

chat_interface.addEventListener('keydown', async (e) => {
    if(e.key === 'Enter'){
        e.preventDefault();
        const cleaned_message = sanitizeMessage(chat_input.value);
        console.log(chat_session);

        if (!can_message || websocket.readyState !== WebSocket.OPEN || !cleaned_message){
            alert('Not yet ready to send message');
            return;
        }

        await sendMessage(chat_session, cleaned_message);
        
        console.log(`${cleaned_message} sending to ${chat_session['to-message']}`);
        console.log();
        chat_input.value = '';
    }

});

function sanitizeMessage(message) {
    if (!message || message.trim().length === 0) {
        alert('You cannot send empty messages');
        return null;
    }

    // Trim and remove invisible/control characters
    let cleaned = message.trim().replace(/[\x00-\x1F\x7F]/g, '');

    // Optional: Basic HTML escape (client-side)
    cleaned = cleaned
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    return cleaned;
}

async function sendMessage(chatroomSession, message){
    try{
        const url = 'apis/messaging/send_message.php';
        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            credentials: 'include',
            body: JSON.stringify({
                sender: chatroomSession.userID,
                message: message,
                receiver: chatroomSession['to-message'],
                chatroomID: chatroomSession['opened-chatroom'],
            })
        });

        if(!res.ok){
            throw new Error('Something went wrong');
        }

        const data = await res.json();

        if(data.status){
            //console.log(`${data.status} tell websoket ${data.sender} sent ${data.message} to ${data.receiver}`);
            websocket.send(JSON.stringify({
                type: 'message-sent'
            }));
        }else{
            //console.log(`${data} mesage sending failed`);
        }

        console.log(data);

    }catch(e){
        console.error(`Error: ${e}`);
    }
}
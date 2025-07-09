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

const contact_name = document.getElementById('contact-name');
const contact_email = document.getElementById('contact-email');

const chat_space = document.getElementById('chat-log');
const chat_input = document.getElementById('chat');
const chat_send  = document.getElementById('chat-send-btn');

const chat_interface = document.getElementById('chat-interface');

/* ======================================================================================================================================================================================================================================= */

websocket.addEventListener('open', () => {
    console.log('connected to web soket');
    online_status.style.backgroundColor = 'green';
    online_status.innerHTML = `Online`;
});

websocket.addEventListener('message', async (e) => {
    try{
        const data = JSON.parse(e.data);

        switch(data.type){
            case 'ready':
                    can_message = true;
                    console.log('Ready to send message');
                break;
            case 'received_message':
                console.log('You received a message');
                console.log(data.message);

                if(chat_session === null){
                    return;
                }
                
                if (chat_session['opened-chatroom'] === data.chatroomID){
                    await fetchNewMessage(data.chatroomID, data.from);
                    newInteractionEvent(data.from);
                }else if(chat_session['opened-chatroom'] !== data.chatroomID){
                    Toastify({
                        text: `New message from user ${data.from}`,
                        duration: 3000,
                        gravity: "top", // or "bottom"
                        position: "right", // or "left" or "center"
                        close: true,
                        style: {
                            background: "#ffffff",
                            color: "#111",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            padding: "10px 16px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                            fontSize: "14px",
                        }
                    }).showToast();

newInteractionEvent(data.from);

                }
                break;
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
        //console.log();
        chat_input.value = '';
    }

});

/* SENDING AND GETTING MESSAGE SENDING AND GETTING MESSAGE SENDING AND GETTING MESSAGE SENDING AND GETTING MESSAGE */
/* SENDING AND GETTING MESSAGE SENDING AND GETTING MESSAGE SENDING AND GETTING MESSAGE SENDING AND GETTING MESSAGE */
/* SENDING AND GETTING MESSAGE SENDING AND GETTING MESSAGE SENDING AND GETTING MESSAGE SENDING AND GETTING MESSAGE */

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

            //chat_space.innerHTML = ``;

            console.log(data_to_message);
            chat_session = setValuesForWebsocket(
                data_to_message.current_user_id, 
                data_to_message.data.id,
                data_to_message.data.chatroom_id,
            );

            if (websocket.readyState === WebSocket.OPEN && chat_session !== null){
                websocket.send(JSON.stringify(chat_session));
            }

            await fetchMessage(chat_session['opened-chatroom'], chat_session.userID);

        }catch(e){
            contact_name.textContent = "Contact Username will appear here";
            contact_email.textContent = "Contact Email will appear here";
            chat_space.innerHTML = `<p style="text-align:center;">${e.message}</p>`;
            console.error(`Error: ${e}`);
        }
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

            console.log(`${data.status} tell websoket ${data.sender} sent ${data.message} to ${data.receiver}`);
            websocket.send(JSON.stringify({
                type: 'sent_message',
                userID: chatroomSession.userID,
                receiver: chatroomSession['to-message'],
                chatroomID: chatroomSession['opened-chatroom'],
                message: message
            }));

        }else{
            console.log(`${data} mesage sending failed`);
        }

        console.log(data);
        newInteractionEvent();
        appendNewMessage(data, data.receiver);

    }catch(e){
        console.error(`Error: ${e}`);
    }
}

async function fetchMessage(chatroomID, from){

    try{
        const url = 'apis/messaging/fetch_message.php';
        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            credentials: 'include',
            body: JSON.stringify({
                chatroomID: chatroomID,
                from: from
            })
        });
        
        if(!res.ok){
            throw new Error('Something went wrong');
        }

        const data = await res.json();

        displayMessages(data.data, from);
        console.log(`messages`, data);
        
    }catch(e){
        console.error(e);
    }

}

async function fetchNewMessage(chatroomID, from){
    
    try{
        const url = 'apis/messaging/new_message.php';
        const res = await fetch(url, {
            method     : 'POST',
            headers    : {'Content-Type':'application/json'},
            credentials: 'include',
            body :JSON.stringify({
                chatroomID: chatroomID
            })
        });

        if(!res.ok){
            throw new Error('Something went wrong');
        }

        const data = await res.json();
        console.log(data.new_message);
        appendNewMessage(data.new_message, from);

    }catch(e){
        console.error(e);
    }
    
}


/* HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS */
/* HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS */

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

function setValuesForWebsocket(currentuserID, targetuserID, chatroomID){

    return {
        type: 'set_chatroom',
        userID: currentuserID,
        'to-message' : targetuserID,
        'opened-chatroom': chatroomID
    };
}

function displayMessages(arr, from){
    if(arr.length === 0){
        chat_space.innerHTML = `<h2 style="text-align:center;">Start messaging now!</h2><br><br>`;
    }else{
        chat_space.innerHTML = arr.map((e) => {
            return`
                <div class="${e.sender === from ? 'sender' : 'receiver'} message">${e.message}</div>
            `
        }).join('');
        chat_space.scrollTop = chat_space.scrollHeight;
    }
}


function appendNewMessage(message, from) {
    const newMessage = document.createElement('div');

    // Set the text content of the message
    newMessage.textContent = message.message;
    newMessage.classList.add('message');

    // Add the appropriate class based on who sent the message
    if (message.sender === from) {
        newMessage.classList.add('receiver');
    } else {
        newMessage.classList.add('sender');
    }

    // Append to chat space
    chat_space.appendChild(newMessage);
    chat_space.scrollTop = chat_space.scrollHeight;
}


function newInteractionEvent(id = '') {
    const event = new CustomEvent('newInteraction', {
        detail: { contact: id }
    });
    window.dispatchEvent(event);
}

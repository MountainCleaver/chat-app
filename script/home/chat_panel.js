/* document.addEventListener('DOMContentLoaded', async () => {
    await toMessage();
}); */

window.addEventListener('toMessageChanged', async () => {
    await toMessage();
});

const websocket = new WebSocket('ws://localhost:9000');

let chat_session = null;

websocket.addEventListener('open', () => {
    console.log('connected to web soket');
});

const contact_name = document.getElementById('contact-name');
const contact_email = document.getElementById('contact-email');

const chat_space = document.getElementById('chat-log');

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
                data_to_message.data.chatroom_id);

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
        'opened-chatroom': targetuserID,
        'to-message' : chatroomID
    };
}
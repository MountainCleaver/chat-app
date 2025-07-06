document.addEventListener('DOMContentLoaded', async () => {

    var user_id = null;

    const username    = document.getElementById('username');
    
    const searchField = document.getElementById('search-field');
    const searchResult= document.getElementById('search-result');

    const contacts    = document.getElementById('contacts-list');

    let isLoading = false;
    let messageLoading = false;

    await checkSession();
    await getContacts();

    async function messageContact(id){
        
        try{
            const url = 'apis/home/set_contact.php';

            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({
                    'user_id': id
                })
            });

            if(!response.ok){
                throw new Error('Reponse not okay');
            }

            const data = await response.json();

            toMessageChangedEvent();
            
        }catch(e){
            console.error('Error ', e.message);
        }
    }

    function toMessageChangedEvent(){
        const event = new CustomEvent('toMessageChanged');
        window.dispatchEvent(event);
    }

    async function getContacts () {
        
        try{
            const url = "apis/home/contacts.php";
            const response = await fetch(url);

            if(!response.ok){
                throw new Error('Reponse not okay');
            }
            const data = await response.json();

            console.log(data);
            await messageContact(data.friends[0].id);
            contacts.innerHTML = data.friends.map(friend => {
                return `
                    <li id="${friend.id}">
                        <p>${friend.username.charAt(0).toUpperCase() + friend.username.slice(1)}</p>
                        <p>${friend.email}</p>
                        <div style="display:flex; justify-content:space-between;">
                            <button class="unfriend-btn" data-userid="${friend.id}" style="font-size:0.7rem;">Unfriend ❌</button>
                            <button class="message-btn" data-userid="${friend.id}" data-username="${friend.username}">Message ➡</button>
                        </div>
                        <hr>
                    </li>
                `;
}).join('');

        }catch(e){
            console.log('Error: ', e.message);
            contacts.innerHTML = `<p>There was an error fetching your friends</p>`;
        }
    }


    /* THINGS RELATED TO SEARCHING THINGS RELATED TO SEARCHING THINGS RELATED TO SEARCHING THINGS RELATED TO SEARCHING THINGS RELATED TO SEARCHING THINGS RELATED TO SEARCHING*/
    /* THINGS RELATED TO SEARCHING THINGS RELATED TO SEARCHING THINGS RELATED TO SEARCHING THINGS RELATED TO SEARCHING THINGS RELATED TO SEARCHING THINGS RELATED TO SEARCHING*/

    searchField.addEventListener('input', (e) => {
        searchResult.innerHTML = '';
        if(e.target.value.length === 0){
            return;
        }
        debouncedSearch(e.target.value)
    });

    function debouncer(func, delay){
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(()=>{
                func.apply(null, args);
            }, delay);
        };
    }

    const debouncedSearch = debouncer(searchUser, 500);
    async function searchUser (q) {
        try{
            const url      = `apis/home/search.php?q=${encodeURIComponent(q)}`;

            const response = await fetch(url, {
                method  : 'GET',
                headers : {'Content-Type':'application/json'}
            });

            if(!response.ok){
                throw new Error('reponse not okay');
            }

            const data = await response.json();
            console.log(data.data);
            
            if(data.data.length === 0){
                searchResult.innerHTML = `<p>${data.message}</p>`;
                return;
            } else {
                searchResult.innerHTML += data.data.map(row => {
                    return `
                        <p>${row.username}</p>
                        <p>${row.email}</p>
                        ${!row.contact_status 
                            ? `<button class="add-friend-btn" data-userid="${row.id}" id="user-${row.id}" >Add Friend</button>` 
                            : row.contact_status==='pending' 
                                ? row.request_sender === 'current_user' 
                                    ? `<button class="cancel-rqst-btn" data-userid="${row.id}" style="color:red;">Cancel Request</button>`
                                    : `<button class="accept-rqst-btn" data-userid="${row.id}" style="color:blue;">Accept Request</button>`
                                : `<p style="display:inline-block">Friends ✅</p> | <button class="message-btn" data-userid="${row.id}">Message</button>`
                        }
                        <hr>
                    `;
                }).join('');
            }

        }catch(e){
            console.error(e.message);
        }
    }

/* BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS  */
/* BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS BUTTONS LISTENERS  */
    searchResult.addEventListener('click', async (e) => {
        
        if(isLoading){
            return;
        }

        if(e.target.classList.contains('add-friend-btn')){ //ADD
            isLoading = true;
            const targetId = e.target.dataset.userid;
            console.log(`Add friend user ${targetId}`)
            //add friend function
            /* 
                add this user to the contact_rel table
             */

            await addFriend(e.target, targetId);
            isLoading = false;
        }

        else if(e.target.classList.contains('cancel-rqst-btn')){//CANCEL
            isLoading = true;
            const targetId = e.target.dataset.userid;
            console.log(`Cancel friend request for ${targetId}`)
            //add friend function
            /* 
                delete this user from contact_rel relevant tothe current user
             */
            await cancelRequest(e.target, targetId);
            isLoading = false;
        }

        else if(e.target.classList.contains('message-btn')){//MESSAGE
            isLoading = true;
            const targetId = e.target.dataset.userid;
            console.log(`Message ${targetId}`)
            //message friend
            /* 
                chat
             */
            await messageContact(targetId);
            isLoading = false;
        }

        else if(e.target.classList.contains('accept-rqst-btn')){//ACCEPT REQUEST
            isLoading = true;
            const targetId = e.target.dataset.userid;
            console.log(`Accept friend request ${targetId}`)
            //accept friend request
            /* 
                change targeted status to 'accepted'
             */
            await acceptRequest(e.target, targetId);
            isLoading = false;
        }

    });

    contacts.addEventListener('click', async (e) => {


        if(messageLoading){
            return;
        }

        if(e.target.classList.contains('message-btn')){
            messageLoading = true;
            e.target.textContent = "Loading...";

            const targetId = e.target.dataset.userid;

            await messageContact(targetId);


            messageLoading = false;
            e.target.textContent = "Message ➡";
        }else if (e.target.classList.contains('unfriend-btn')){
            console.log(`Unfriend : ${e.target.dataset.userid}`);
        }

    });

    /* CONTACT INTERACTIONS CONTACT INTERACTIONS CONTACT INTERACTIONS CONTACT INTERACTIONS CONTACT INTERACTIONS CONTACT INTERACTIONS CONTACT INTERACTIONS CONTACT INTERACTIONS CONTACT INTERACTIONS CONTACT INTERACTIONS  */
    /* CONTACT INTERACTIONS CONTACT INTERACTIONS CONTACT INTERACTIONS CONTACT INTERACTIONS CONTACT INTERACTIONS CONTACT INTERACTIONS CONTACT INTERACTIONS CONTACT INTERACTIONS CONTACT INTERACTIONS CONTACT INTERACTIONS  */

    async function addFriend(button, id){

        button.textContent = 'Sending Request...';
        try{
            const url = `apis/home/contacts.php`

            const response = await fetch(url, {
                method : 'POST',
                headers : {'Content-Type': 'application/json'},
                body : JSON.stringify({
                    user_id : id
                }),
                credentials: 'include'
            });

            if(!response.ok){
                throw new Error('response not okay');
            }

            const data = await response.json();

            if(!data.status){
                throw new Error(data.message);
            }

            button.textContent = 'Cancel Request';
            button.style.color = 'red';
            button.classList.remove('add-friend-btn')
            button.classList.add('cancel-rqst-btn')
                
            console.log(data);
        }catch(e){
            console.error("Error: ", e.message);

            if(e.message === 'Friend request already exists.'){
                alert('This user already added you, please accept their request')
                button.textContent = 'Accept Request';
                button.style.color = 'blue';
                button.classList.remove('add-friend-btn');
                button.classList.add('accept-rqst-btn');
                return;
            }
            
            button.textContent = 'Add Friend';
            button.style.color = 'black';
            button.classList.remove('cancel-rqst-btn')
            button.classList.add('add-friend-btn')
        }
    }

    async function cancelRequest(button, id){
        button.textContent = 'Cancelling Request...';
        try{
            const url = `apis/home/contacts.php`;

            const response = await fetch(url, {
                method : 'DELETE',
                headers: {'Content-Type':'application/json'},
                body : JSON.stringify({
                    user_id : id
                })
            });

            if(!response.ok){
                throw new Error('response not okay');
            }

            const data = await response.json()

            if(!data.status){
                throw new Error(data.message);
            }

            button.textContent = 'Add Friend';
            button.style.color = 'black';
            button.classList.remove('cancel-rqst-btn')
            button.classList.add('add-friend-btn')

            console.log(data);

        }catch(e){
            console.error("Error: ", e.message);
            button.textContent = 'Cancel Request';
            button.style.color = 'red';
            button.classList.remove('add-friend-btn')
            button.classList.add('cancel-rqst-btn')
        }
    }

    async function acceptRequest(button, id){
        button.textContent = 'Accepting Request...'
        try{
            const url = `apis/home/contacts.php`;

            const response = await fetch(url, {
                method  : 'PATCH',
                headers : {'Content-Type':'application/json'},
                body    : JSON.stringify({
                    user_id : id
                }),
            });

            if(!response.ok){
                throw new Error('Response not okay');
            }

            const data = await response.json();
            console.log(data);

            if(!data.status){
                throw new Error(data.message);
            }

            button.textContent = 'message';
            button.style.color = 'black';
            button.classList.add('message-btn');
            button.classList.remove('accept-rqst-btn');

            console.log(data);

            await getContacts();

        }catch(e){
            console.error(e.message);

            if(e.message === 'Friend Request is Cancelled by the sender'){
                button.textContent = 'Add Friend';
                button.style.color = 'black';
                button.classList.remove('accept-rqst-btn');
                button.classList.add('add-friend-btn');
                return;
            }

            button.textContent = 'Accept Request';
            button.style.color = 'blue';
            button.classList.remove('add-friend-btn')
            button.classList.add('accept-rqst-btn')
            
        }
    }

    function message(){

    }


    /* AUTH RELATED AUTH RELATED AUTH RELATED AUTH RELATED AUTH RELATED AUTH RELATED */
    /* AUTH RELATED AUTH RELATED AUTH RELATED AUTH RELATED AUTH RELATED AUTH RELATED */
    /* AUTH RELATED AUTH RELATED AUTH RELATED AUTH RELATED AUTH RELATED AUTH RELATED */
    
    async function checkSession(){
        try{

            const url = 'config/session.php';

            const response = await fetch(url, {
                method  : 'POST',
                headers : {'Content-Type':'application/json'},
                credentials : 'include'
            });

            if(!response.ok){
                throw new Error('There was a problem getting your session data');
            }

            const data = await response.json();

            if(!data.status){
                window.location.href = 'index.html'
                throw new Error(data.message);
            }

            username.textContent = data.message;
            user_id = Number(data.data.id);
            console.log(data.data);

        }catch(e){
            console.error('Error', e.message);
        }
    }

});
document.addEventListener('DOMContentLoaded', () => {
    checkSession();

    var user_id = '';

    const username    = document.getElementById('username');
    const logoutBtn   = document.getElementById('logout-btn');
    
    const searchField = document.getElementById('search-field');
    const searchResult= document.getElementById('search-result');

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
            const url      = `apis/home/search.php?q=${encodeURIComponent(q)}&id=${user_id}`;

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
                                ? `<button class="cancel-rqst-btn" data-userid="${row.id}" style="color:red;">Cancel Request</button>` 
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


    searchResult.addEventListener('click', async (e) => {

        if(e.target.classList.contains('add-friend-btn')){
            const targetId = e.target.dataset.userid;
            console.log(`Add friend user ${targetId}`)
            //add friend function
            /* 
                add this user to the contact_rel table
             */

            await addFriend(targetId);
        }

        if(e.target.classList.contains('cancel-rqst-btn')){
            const targetId = e.target.dataset.userid;
            console.log(`Cancel friend request for ${targetId}`)
            //add friend function
            /* 
                delete this user from contact_rel relevant tothe current user
             */
        }

        if(e.target.classList.contains('message-btn')){
            const targetId = e.target.dataset.userid;
            console.log(`Message ${targetId}`)
            //message friend
            /* 
                chat
             */
        }

    });

    async function addFriend(id){

        document.getElementById(`user-${id}`).textContent = 'Sending Request...';
        try{
            const url = `apis/home/contacts.php`

            const response = await fetch(url, {
                method : 'POST',
                headers : {'Content-Type': 'application/json'},
                body : JSON.stringify({
                    user_id : id
                })
            });

            if(!response.ok){
                throw new Error('response not okay');
            }

            const data = await response.json();

                document.getElementById(`user-${id}`).textContent = 'Cancel Request';
                document.getElementById(`user-${id}`).style.color = 'red';
                document.getElementById(`user-${id}`).classList.remove('add-friend-btn')
                document.getElementById(`user-${id}`).classList.add('cancel-rqst-btn')
                
                

            console.log(data);
        }catch(e){
            console.error("Error: ", e.message);
            document.getElementById(`user-${id}`).textContent = 'Add Friend';
        }
    }

    async function cancelRequest(){

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
            user_id = data.data.id
            console.log(data);

        }catch(e){
            console.error('Error', e.message);
        }
    }

    async function logoutUser(){
        try{
            const url = 'apis/auth/logout.php';

            const response = await fetch(url, {
                method : 'POST',
                credentials: 'include'
            });

            if(!response.ok){
                throw new Error('Failed to log you out');
            }

            window.location.href = 'index.html';
            
        }catch(e){
            console.error('Error', e.message);
        }
    }

    logoutBtn.addEventListener('click', () => {
        if (confirm("Confirm logout") == true) {
            alert('You logged out');
            logoutUser();
        } else {
            alert('You are not logged out');
        }
    });

});
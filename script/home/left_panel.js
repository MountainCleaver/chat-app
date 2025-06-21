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
                        <hr>
                    `;
                }).join('');
            }

        }catch(e){
            console.error(e.message);
        }
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
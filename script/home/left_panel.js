document.addEventListener('DOMContentLoaded', () => {
    checkSession();

    const username  = document.getElementById('username');
    const logoutBtn = document.getElementById('logout-btn');
    
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
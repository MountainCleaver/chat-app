document.addEventListener('DOMContentLoaded', () => {

    const username = document.getElementById('username-profile');
    const email = document.getElementById('email-profile');

    const logoutBtn   = document.getElementById('logout-btn');

    ( async () => {
        
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

            username.textContent = data.data.username.charAt(0).toUpperCase() + data.data.username.slice(1);
            email.textContent = data.data.email;
            
            console.log(`Right Panel`, data.data);

        }catch(e){

        }
    })()

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

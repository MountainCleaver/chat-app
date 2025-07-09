document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');

    const email     = document.getElementById('email');
    const password  = document.getElementById('password');

    const loginBtn  = document.getElementById('login-btn');

    const errLogin  = document.getElementById('error-login');

    let error = '';

    (async () => {
        
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

            if(data.status){
                window.location.href = 'home.html'
                throw new Error(data.message);
            }

            console.log(data);

        }catch(e){
            console.error('Error', e.message);
        }
    })();

    loginForm.addEventListener('keydown', async (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); 

            if (!validateFields()) {
                errLogin.innerHTML = error;
                return;
            }

            const trimmed_email = email.value.trim();
            const trimmed_password = password.value.trim();

            const user_creds = {
                email: trimmed_email,
                password: trimmed_password
            }

            await login(user_creds);
        }
    });


    

    loginBtn.addEventListener('click', async () => {

        if(!validateFields()){
            errLogin.innerHTML = error;
            return;
        }

        const trimmed_email = email.value.trim();
        const trimmed_password = password.value.trim();

        const user_creds = {
            email: trimmed_email,
            password: trimmed_password
        }

        await login(user_creds);
        
    });


    async function login(creds){
        try{
            const url = 'apis/auth/login.php';

            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(creds)
            });

            if(!response.ok){
                throw new Error('There was an error with the request');
            }

            const data = await response.json();
            console.log(data);

            if(!data.status){
                throw new Error(data.message);
            }else{
                error = `<p style="color:green">${data.message}</p>`;
                errLogin.innerHTML = error;
            }
            
            window.location.href = 'home.html';
        }catch(e){
            console.error('Error:', e);
            error = `<p style="color: red; display:inline;">${e.message}</p>`;
            errLogin.innerHTML = error;
        }
    }

    function validateFields(){
        if((email.value.trim() === '' || email.value.trim().length === 0)|| (password.value.trim() === '' || password.value.trim().length === 0)){
            error = `<p style="color: red; display:inline;">Email and Password cannot be empty.</p>`;
            return false;
        }

        return true;
    }



    

    /* 
    
    1. accept email and password
    2. validate email and password
    3. if valid, send a POST request to the server
    4. if successful, redirect to the dashboard
    5. if error, display error message
    6. if email or password is empty, display error message
    
    
    */


});
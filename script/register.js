document.addEventListener('DOMContentLoaded', ()=>{
    const regForm   = document.getElementById('reg-form');
    const username  = document.getElementById('username');
    const email     = document.getElementById('email');
    const password  = document.getElementById('password'); 
    const cpassword = document.getElementById('c-password'); 

    const errU = document.getElementById('error-username');
    const errE = document.getElementById('error-email');
    const errP = document.getElementById('error-password');
    const errCP= document.getElementById('error-c-password');

    const signupBtn = document.getElementById('sign-up-btn');

    let errors = {
        username: true,
        email: true,
        password: true,
        cpassword: true
    };

    username.addEventListener('input', (e)=>{
        if(e.target.value.length <3){
            return;
        }
        debouncedValidateUsername(e.target.value);  
        
    });

    email.addEventListener('input', (e) => {
        if(e.target.value.length < 3 && e.target.value.includes('@') === false){
            return;
        }
        debouncedValidateEmail(e.target.value);
    
    });


    password.addEventListener('input', (e) => {
        debouncedValidatedPassword(e.target.value);
    });

    cpassword.addEventListener('input', (e) => {
        if(e.target.value !== password.value){
            errCP.innerHTML = `<p style="color: red; display:inline;">Passwords do not match.</p>`;
            errors.cpassword = true;
        }else {
            errCP.innerHTML = `<p style="color: green; display:inline;">Passwords do match.</p>`;
            errors.cpassword = false;
        }
        validateAll();
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

    signupBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if(errors.username || errors.email || errors.password || errors.cpassword){
            alert('You cannot submit the form with errors.');
            return;
        }else{
            const form = {
                username: username.value,
                email: email.value,
                password: password.value
            }
            registerUser(form);
        }
        

    });

    async function registerUser(form){
        try{
            const url = 'apis/registration/register.php';

            const response = await fetch(url, {
                'method'  : 'POST',
                'headers' : {'Content-Type':'application/json'},
                'body'    : JSON.stringify(form)
            });

            if(!response.ok){
                throw new Errpr('There was an error with the request');
            }

            const data = await response.json();
            alert(data.message);
            console.log(data);

            if(data.status){
                window.location.href = 'index.html';
                regForm.reset();
                errU.innerHTML = ``;
                errE.innerHTML = ``;
                errP.innerHTML = ``;
                errCP.innerHTML = ``;
                errors = {
                    username: true,
                    email: true,
                    password: true,
                    cpassword: true
                };
            }else{
                alert('There was an error with the registration. Please try again.');
            }
        }catch(e){
            console.error('Error:', es);
        }
    }
    

    /* VALIDATORS */
    /* VALIDATORS */
    function validateAll(){
        console.log(errors)
        if((errors.username || errors.email || errors.password || errors.cpassword) || 
            (username.value.length === 0 || email.value.length === 0 || password.value.length === 0 || cpassword.value.length === 0)){
            signupBtn.disabled = true;
        } else {
            signupBtn.disabled = false;
        }
    }

    const debouncedValidatedPassword = debouncer(validatePassword, 500);
    function validatePassword (input) {
        if(input.length < 7){
            errP.innerHTML = `<p style="color: red; display:inline;">Password must be at least 7 characters long.</p>`;
            errors.password = true;
            cpassword.disabled = true;
        }else{
            errP.innerHTML = ``;
            errors.password = false;
            cpassword.disabled = false;
        }
        validateAll();
    }

    const debouncedValidateUsername = debouncer(validateUsername, 500);
    async function validateUsername (input) {
        
        try{

            const url = 'apis/registration/check-username.php';

            const response = await fetch(url, {
                'method'  : 'POST',
                'headers' : {'Content-Type': 'application/json'},
                'body'    : JSON.stringify({
                    'username' : input
                })
            });

            if(!response.ok){
                throw new Error('There was an error with the request');
            }

            const data = await response.json();
            console.log(data);
            
            errU.innerHTML = `
                <p style="display:inline; color:${data.status ? 'green' : 'red'}">${data.message}</p>
            `;
            errors.username = !data.status;
            validateAll();
            
        }catch(e){
            console.error('Error:', e);
        }

    }

    const debouncedValidateEmail = debouncer(validateEmail, 500);
    async function validateEmail (input) {
        
        try{

            const url = 'apis/registration/check-email.php';

            const response = await fetch(url, {
                'method'  : 'POST',
                'headers' : {'Content-Type': 'application/json'},
                'body'    : JSON.stringify({
                    'email' : input
                })
            });

            if(!response.ok){
                throw new Error('There was an error with the request');
            }

            const data = await response.json();
            console.log(data);
            
            errE.innerHTML = `
                <p style="display:inline; color:${data.status ? 'green' : 'red'}">${data.message}</p>
            `;
            errors.email = !data.status;
            validateAll();
            
        }catch(e){
            console.error('Error:', e);
        }
    }


});
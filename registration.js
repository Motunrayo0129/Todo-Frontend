document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    registrationForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        errorMessage.textContent = '';

        if(!usernameInput.value.trim()) {
            errorMessage.textContent = 'Username is required.';
            errorMessage.style.color = 'red';
            return;
        }
        if(!emailInput.value.trim() || !validateEmail(emailInput.value)) {
            errorMessage.textContent = 'Valid email is required.';
            errorMessage.style.color = 'red';
            return;
        }
        if(passwordInput.value.length < 6) {
            errorMessage.textContent = 'Password must be at least 6 characters long.';
            errorMessage.style.color = 'red'; 
            return;  
        }
        
        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: usernameInput.value,
                    email: emailInput.value,
                    password: passwordInput.value
                }),
                
               
            });
            console.log("data sent to backend");

            if(response.ok) {
                const data = await response.json();
                console.log('Registration successful:', data.message);
                errorMessage.style.color = 'green';
                errorMessage.textContent = 'Registration successful! Redirecting to login...';
                window.location.href = 'login.html';
            } else {
                const errorData = await response.json();
                errorMessage.textContent = errorData.message || 'Registration failed. Please try again.';
                errorMessage.style.color = 'red';
            } 
            } catch (error) {
                console.error('Error during registration:', error);
                errorMessage.textContent = 'An error occurred. Please try again later.';
                errorMessage.style.color = 'red';
            }
            
    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        errorMessage.textContent = '';

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        errorMessage.style.color = 'red';

        if(!email) {
            errorMessage.textContent = 'Email is required.';
            return;
        }
        if(!password) {
            errorMessage.textContent = 'Pass.';
            return;
        }
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                
            });
            if(response.ok) {
                const data = await response.json();
                console.log('Login successful:', data);
                errorMessage.style.color = 'green';
                errorMessage.textContent = 'Login successful! Redirecting to dashboard...';
                console.log(data);

                setTimeout(() => {
                    localStorage.setItem('username', data.username);
                    localStorage.setItem('userId', data.userId);
                    window.location.href = 'to_do_task.html';
                }, 1000);
            } else {
                const errorData = await response.json();
                errorMessage.textContent = errorData.message || 'Login failed. Please try again.';
            }
        } catch (error) {
            console.error('Error during login:', error);
            errorMessage.textContent = 'An error occurred. Please try again later.';
        }
    });
});
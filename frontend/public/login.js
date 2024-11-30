document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get username and password values
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.role) {
                // Save the logged-in username to localStorage upon successful login
                localStorage.setItem('loggedInUser', data.username);
                // Redirect based on user role
                if (data.role === 'admin') {
                    window.location.href = 'admin_dashboard.html'; // Redirect to admin dashboard
                } else if (data.role === 'employee') {
                    window.location.href = 'employee_dashboard.html'; // Redirect to employee dashboard
                }
            } else {
                document.getElementById('error-message').textContent = data.error;
            }
        } catch (error) {
            document.getElementById('error-message').textContent = 'Error logging in. Please try again.';
            console.error('Login Error:', error);
        }
    });
});

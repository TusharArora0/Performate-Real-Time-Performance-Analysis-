document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    
    if (username === 'admin' && password === 'admin123') {
        window.location.href = 'admin_dashboard.html';
    } else if (username === 'employee' && password === 'employee123') {
        window.location.href = 'employee_dashboard.html';
    } else {
        document.getElementById('error-message').textContent = 'Invalid login credentials.';
    }
});

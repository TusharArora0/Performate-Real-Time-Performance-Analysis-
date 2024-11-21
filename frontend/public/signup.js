// Example of sending the signup request to the backend
document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;
    const role = document.getElementById("role").value;
  
    const response = await fetch('http://localhost:5000/api/signup', {  // Make sure this URL matches your backend's route
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, email, role }),
    });
  
    const data = await response.json();
    if (response.ok) {
      alert('User created successfully');
      window.location.href = 'index.html';  // Redirect to login page
    } else {
      alert('Error: ' + data.error);
    }
  });
  
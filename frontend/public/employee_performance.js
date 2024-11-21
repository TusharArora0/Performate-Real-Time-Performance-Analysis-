const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');

async function loadEmployeeDetails() {
    try {
        // Show loading state
        document.getElementById('performanceDetails').innerHTML = `
            <div class="loading-message">
                Loading employee details...
            </div>
        `;

        // Fetch employee details
        const response = await fetch(`http://localhost:5000/api/employee-details?username=${encodeURIComponent(username)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch employee details');
        }

        const employeeData = await response.json();

        // Calculate performance score out of 10
        const scoreOutOfTen = ((employeeData.performanceScore || 0) / 100 * 10).toFixed(1);

        // Update performance details
        document.getElementById('performanceDetails').innerHTML = `
            <div class="detail-row">
                <h2>${employeeData.username}'s Performance Overview</h2>
            </div>
            <div class="detail-row">
                <span class="label">Performance Score:</span>
                <span class="value">${scoreOutOfTen}/10</span>
            </div>
            <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">${employeeData.email || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="label">Work Done:</span>
                <span class="value">${employeeData['work done'] || 0}</span>
            </div>
            <div class="detail-row">
                <span class="label">Work Hours:</span>
                <span class="value">${employeeData['work hours'] || 0}</span>
            </div>
            <div class="detail-row">
                <span class="label">Attendance:</span>
                <span class="value">${employeeData.attendance || 0} days</span>
            </div>
            <div class="detail-row">
                <span class="label">Rank:</span>
                <span class="value">${employeeData.rank || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="label">Appraisal Amount:</span>
                <span class="value">$${employeeData.appraisalAmount || 0}</span>
            </div>
        `;

        // Load tasks
        await loadEmployeeTasks();

    } catch (error) {
        console.error('Error fetching employee details:', error);
        document.getElementById('performanceDetails').innerHTML = `
            <div class="error-message">
                ${error.message || 'Error fetching employee details. Please try again.'}
            </div>
        `;
    }
}

async function loadEmployeeTasks() {
    try {
        const response = await fetch(`http://localhost:5000/api/employee-tasks?username=${encodeURIComponent(username)}`);
        if (!response.ok) throw new Error('Error fetching tasks');

        const tasks = await response.json();
        const tasksTableBody = document.querySelector('#tasksTable tbody');
        
        if (!tasksTableBody) {
            console.error('Tasks table body not found');
            return;
        }

        tasksTableBody.innerHTML = '';

        if (!tasks || tasks.length === 0) {
            tasksTableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="no-tasks">No tasks assigned yet</td>
                </tr>
            `;
            return;
        }

        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.description || 'No description'}</td>
                <td><span class="status-badge ${task.status || 'pending'}">${task.status || 'pending'}</span></td>
                <td>${task.assignedDate ? new Date(task.assignedDate).toLocaleDateString() : 'No date'}</td>
            `;
            tasksTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
        const tasksTableBody = document.querySelector('#tasksTable tbody');
        if (tasksTableBody) {
            tasksTableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="error-message">Error loading tasks</td>
                </tr>
            `;
        }
    }
}

// Initialize the page
if (username) {
    loadEmployeeDetails();
} else {
    document.getElementById('performanceDetails').innerHTML = `
        <div class="error-message">
            No username provided. Please return to the dashboard.
        </div>
    `;
}

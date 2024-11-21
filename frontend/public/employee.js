async function loadEmployeeDashboard() {
    const username = localStorage.getItem('loggedInUser');

    if (!username) {
        console.error("No user logged in");
        document.getElementById('error-message').textContent = 'Please log in to access your dashboard.';
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/employee-data?username=${username}`);
        
        if (!response.ok) {
            throw new Error('Error fetching employee data');
        }

        const employeeData = await response.json();

        if (employeeData.error) {
            throw new Error(employeeData.error || 'Employee not found');
        }

        document.getElementById('employeeName').textContent = `Name: ${employeeData.username}`;
        document.getElementById('employeeEmail').textContent = `Email: ${employeeData.email}`;
        document.getElementById('employeeWorkDone').textContent = `Work Done: ${employeeData.workDone}/150`;
        document.getElementById('employeeWorkHours').textContent = `Work Hours: ${employeeData.workHours}/355`;
        document.getElementById('employeeAttendance').textContent = `Attendance: ${employeeData.attendance}/30`;

        // Calculate and display performance
        const performance = await calculatePerformance(
            employeeData.workHours,
            employeeData.workDone,
            employeeData.attendance
        );

        // Add performance display elements if they exist
        if (document.getElementById('performanceScore')) {
            document.getElementById('performanceScore').textContent = `Performance Score: ${performance.score}/10`;
        }
        if (document.getElementById('performanceLevel')) {
            document.getElementById('performanceLevel').textContent = `Level: ${performance.level}`;
        }
        if (document.getElementById('performanceRemarks')) {
            document.getElementById('performanceRemarks').textContent = `${performance.remarks}`;
        }

        await loadEmployeeTasks();
        await loadEmployeeAppraisals();

    } catch (error) {
        console.error('Error loading employee data:', error);
        document.getElementById('error-message').textContent = 'Error loading employee data. Please try again.';
    }
}

async function calculatePerformance(workHours, workDone, attendance) {
    const maxWorkHours = 355;
    const minWorkHours = 70;
    const maxWorkDone = 150;
    const minWorkDone = 1;
    const maxAttendance = 30;
    const minAttendance = 6;

    // Calculate individual scores
    const workHoursScore = ((workHours - minWorkHours) / (maxWorkHours - minWorkHours)) * 10;
    const workDoneScore = ((workDone - minWorkDone) / (maxWorkDone - minWorkDone)) * 10;
    const attendanceScore = ((attendance - minAttendance) / (maxAttendance - minAttendance)) * 10;

    // Calculate overall performance score
    const performanceScore = (workHoursScore + workDoneScore + attendanceScore) / 3;
    const finalScore = parseFloat(performanceScore.toFixed(2));

    // Determine performance level and remarks
    let level, remarks;
    if (finalScore >= 8) {
        level = 'Excellent';
        remarks = `Outstanding performance! Work Hours: ${workHours}/${maxWorkHours}, Work Done: ${workDone}/${maxWorkDone}, Attendance: ${attendance}/${maxAttendance}`;
    } else if (finalScore >= 6) {
        level = 'Good';
        remarks = `Good performance! Work Hours: ${workHours}/${maxWorkHours}, Work Done: ${workDone}/${maxWorkDone}, Attendance: ${attendance}/${maxAttendance}`;
    } else if (finalScore >= 4) {
        level = 'Average';
        remarks = `Room for improvement. Work Hours: ${workHours}/${maxWorkHours}, Work Done: ${workDone}/${maxWorkDone}, Attendance: ${attendance}/${maxAttendance}`;
    } else {
        level = 'Needs Improvement';
        remarks = `Performance needs attention. Work Hours: ${workHours}/${maxWorkHours}, Work Done: ${workDone}/${maxWorkDone}, Attendance: ${attendance}/${maxAttendance}`;
    }

    return {
        score: finalScore,
        level,
        remarks
    };
}

async function loadEmployeeTasks() {
    const username = localStorage.getItem('loggedInUser');
    try {
        const response = await fetch(`http://localhost:5000/api/employee-tasks/${username}`);
        if (!response.ok) throw new Error('Error fetching tasks');
        
        const tasks = await response.json();
        const tbody = document.querySelector('#tasksTable tbody');
        tbody.innerHTML = '';
        
        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.taskDescription}</td>
                <td>${task.status}</td>
                <td>${new Date(task.assignedDate).toLocaleDateString()}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function loadEmployeeAppraisals() {
    const username = localStorage.getItem('loggedInUser');
    try {
        const response = await fetch(`http://localhost:5000/api/employee-appraisals/${username}`);
        if (!response.ok) throw new Error('Error fetching appraisals');
        
        const appraisals = await response.json();
        
        // Get the existing appraisals container
        const existingContainer = document.getElementById('appraisalsContainer');
        if (existingContainer) {
            existingContainer.innerHTML = appraisals.map(appraisal => `
                <div class="appraisal-item">
                    <p>Amount: ₹${appraisal.amount}</p>
                    <p>Date: ${new Date(appraisal.date).toLocaleDateString()}</p>
                </div>
            `).join('<hr>');
        }
    } catch (error) {
        console.error('Error loading appraisals:', error);
    }
}

loadEmployeeDashboard();
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const employee_name = document.getElementById('emp_name').value;
    const taskDescription = document.getElementById('taskDescription').value;

    try {
        const response = await fetch('http://localhost:5000/api/assign-task', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ employee_name, taskDescription })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Task assigned successfully!');
            document.getElementById('taskForm').reset();
        } else {
            alert(data.error || 'Failed to assign task');
        }
    } catch (error) {
        console.error('Error assigning task:', error);
        alert('Error assigning task');
    }
});

async function loadPerformanceData() {
    try {
        const response = await fetch('http://localhost:5000/api/employee-rankings');
        if (!response.ok) throw new Error('Failed to load performance data');

        const performanceData = await response.json();
        const performanceTable = document.getElementById('performanceTable').querySelector('tbody');
        performanceTable.innerHTML = '';

        performanceData.forEach((data) => {
            const workDone = data['work done'] || data.workDone || 1;
            const workHours = data['work hours'] || data.workHours || 70;
            const attendance = data.attendance || 6;

            const row = document.createElement('tr');
            const rankClass = data.rank <= 3 ? `rank-${data.rank}` : '';
            
            row.innerHTML = `
                <td class="${rankClass}">${data.rank}</td>
                <td>${data.username}</td>
                <td>
                    <div class="metrics">
                        <span>Work Done: ${workDone}/150</span>
                        <span>Work Hours: ${workHours}/355</span>
                        <span>Attendance: ${attendance}/30</span>
                    </div>
                </td>
                <td>${data.performanceScore.toFixed(2)}/10</td>
                <td>${data.level}</td>
                <td>
                    <button class="appraisal-btn" data-username="${data.username}">Appraise</button>
                </td>
            `;

            const appraisalBtn = row.querySelector('.appraisal-btn');
            appraisalBtn.addEventListener('click', () => {
                submitAppraisal(data.username);
            });

            performanceTable.appendChild(row);
        });

        addPerformanceSummary(performanceData);

    } catch (error) {
        console.error('Error loading performance data:', error);
        const performanceTable = document.getElementById('performanceTable').querySelector('tbody');
        if (performanceTable) {
            performanceTable.innerHTML = '<tr><td colspan="6">Error loading performance data</td></tr>';
        }
    }
}

function addPerformanceSummary(performanceData) {
    const summaryDiv = document.getElementById('performanceSummary');
    if (!summaryDiv) return;

    const avgScore = performanceData.reduce((acc, curr) => acc + curr.performanceScore, 0) / performanceData.length;
    const topPerformer = performanceData[0];

    summaryDiv.innerHTML = `
        <div class="summary-card">
            <h3>Performance Overview</h3>
            <p>Average Score: ${avgScore.toFixed(2)}/10</p>
            <p>Top Performer: ${topPerformer.username} (${topPerformer.performanceScore.toFixed(2)}/10)</p>
            <p>Total Employees: ${performanceData.length}</p>
        </div>
    `;
}

// Initialize the dashboard
loadPerformanceData();

// Add this function to handle appraisal submission
async function submitAppraisal(username) {
    const amount = prompt('Enter appraisal amount:');
    if (!amount || isNaN(amount)) {
        alert('Please enter a valid amount');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/appraisal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                employee_name: username,
                amount: parseFloat(amount)
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Appraisal submitted successfully!');
        } else {
            alert(data.error || 'Failed to submit appraisal');
        }
    } catch (error) {
        console.error('Error submitting appraisal:', error);
        alert('Error submitting appraisal');
    }
}


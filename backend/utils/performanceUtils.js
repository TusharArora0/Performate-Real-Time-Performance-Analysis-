function calculatePerformance(employees) {
    const maxWorkHours = 355; 
    const minWorkHours = 70;
    const maxWorkDone = 150;
    const minWorkDone = 1;
    const maxAttendance = 30;
    const minAttendance = 6;

    employees.forEach(employee => {
        const workHours = employee['work hours'] || minWorkHours;
        const workDone = employee['work done'] || minWorkDone;
        const attendance = employee.attendance || minAttendance;

        const workHoursScore = ((workHours - minWorkHours) / (maxWorkHours - minWorkHours)) * 10;
        const workDoneScore = ((workDone - minWorkDone) / (maxWorkDone - minWorkDone)) * 10;
        const attendanceScore = ((attendance - minAttendance) / (maxAttendance - minAttendance)) * 10;

        const performanceScore = (workHoursScore + workDoneScore + attendanceScore) / 3;

        employee.performanceScore = parseFloat(performanceScore.toFixed(2));
        employee.rank = 0;
    });

    employees.sort((a, b) => b.performanceScore - a.performanceScore);

    employees.forEach((employee, index) => {
        employee.rank = index + 1;
    });

    return employees;
}

module.exports = { calculatePerformance };

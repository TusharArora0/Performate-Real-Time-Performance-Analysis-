const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user'); 
const Task = require("./models/task.js");
const Appraisal = require('./models/appraisal');
const cors = require('cors');
const app = express();
const path = require('path'); 
const { calculatePerformance } = require('./utils/performanceUtils');

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}));

app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());

app.get('/api/user-profile', async (req, res) => {
    try {
        res.json({ username: 'Admin User' });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user profile' });
    }
});

app.get('/api/employee-rankings', async (req, res) => {
    try {
        const employees = await User.find({ role: 'employee' });
        console.log('Raw employee data:', employees); // Debug log
        
        const rankings = employees.map(employee => {
            // Get the values with defaults if not present
            const workDone = employee['work done'] ?? 1;
            const workHours = employee['work hours'] ?? 70;
            const attendance = employee.attendance ?? 6;

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

            // Determine level
            let level;
            if (finalScore >= 8) level = 'Excellent';
            else if (finalScore >= 6) level = 'Good';
            else if (finalScore >= 4) level = 'Average';
            else level = 'Needs Improvement';

            return {
                _id: employee._id,
                username: employee.username,
                workDone: workDone,
                workHours: workHours,
                attendance: attendance,
                performanceScore: finalScore,
                level: level
            };
        });

        // Sort by performance score
        rankings.sort((a, b) => b.performanceScore - a.performanceScore);

        // Add ranks after sorting
        const rankedEmployees = rankings.map((employee, index) => ({
            ...employee,
            rank: index + 1
        }));

        console.log('Processed rankings:', rankedEmployees); // Debug log
        res.json(rankedEmployees);
    } catch (error) {
        console.error('Error fetching rankings:', error);
        res.status(500).json({ error: 'Error fetching employee rankings' });
    }
});

function getPerformanceLevel(score) {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Average';
    return 'Needs Improvement';
}

mongoose.connect('mongodb://localhost:27017/perform_mate', {family: 4})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));


app.post('/api/signup', async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        
        const newUser = new User({ username, email, password, role });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating user' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username instead of email
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Password comparison
        if (user.password === password) {
            res.status(200).json({ message: 'Login successful', username: user.username, role: user.role });
        } else {
            res.status(400).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error logging in' });
    }
});

app.get('/api/employee-data', async (req, res) => {
    const { username } = req.query;
    try {
        const employee = await User.findOne({ username });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.status(200).json({
            username: employee.username,
            email: employee.email,
            workDone: employee['work done'],
            workHours: employee['work hours'],
            attendance: employee.attendance
        });
    } catch (error) {
        console.error('Error fetching employee data:', error);
        res.status(500).json({ error: 'Error fetching employee data' });
    }
});

app.post('/api/assign-task', async (req, res) => {
    try {
        const { employee_name, taskDescription } = req.body;
        console.log('Received task assignment request:', { employee_name, taskDescription }); // Debug log

        // Verify the employee exists
        const employee = await User.findOne({ username: employee_name });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const newTask = new Task({ 
            employee_name, 
            taskDescription,
            status: 'Pending',
            assignedDate: new Date()
        });
        
        await newTask.save();
        res.status(201).json({ message: 'Task assigned successfully' });
    } catch (error) {
        console.error('Error assigning task:', error);
        res.status(500).json({ error: 'Error assigning task' });
    }
});

app.get('/api/employee-tasks/:username', async (req, res) => {
    try {
        const tasks = await Task.find({ employee_name: req.params.username });
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Error fetching tasks' });
    }
});

app.post('/api/appraisal', async (req, res) => {
    try {
        const { employee_name, amount } = req.body;
        console.log('Received appraisal request:', { employee_name, amount }); // Debug log

        // Verify the employee exists
        const employee = await User.findOne({ username: employee_name });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const newAppraisal = new Appraisal({
            employee_name,
            amount: parseFloat(amount),
            date: new Date()
        });

        await newAppraisal.save();
        res.status(201).json({ message: 'Appraisal added successfully' });
    } catch (error) {
        console.error('Error adding appraisal:', error);
        res.status(500).json({ error: 'Error adding appraisal' });
    }
});

app.get('/api/employee-appraisals/:username', async (req, res) => {
    try {
        const appraisals = await Appraisal.find({ employee_name: req.params.username });
        res.json(appraisals);
    } catch (error) {
        console.error('Error fetching appraisals:', error);
        res.status(500).json({ error: 'Error fetching appraisals' });
    }
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    employee_name: { type: String, required: true },
    taskDescription: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    assignedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);

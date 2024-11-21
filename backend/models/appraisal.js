const mongoose = require('mongoose');

const appraisalSchema = new mongoose.Schema({
    employee_name: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appraisal', appraisalSchema); 
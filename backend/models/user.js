// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee'], required: true },
    'work hours': { type: Number, default: 70 },
    'work done': { type: Number, default: 1 },
    attendance: { type: Number, default: 6 }
});

module.exports = mongoose.model('User', userSchema);



const express = require('express');
const User = require('../models/user'); 
const router = express.Router();


router.post('/signup', async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const newUser = new User({ username, email, password, role });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error creating user' });
    }
});


router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        
        if (user.password === password) {
            res.status(200).json({ message: 'Login successful', user });
        } else {
            res.status(400).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error logging in' });
    }
});

module.exports = router;

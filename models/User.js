const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePhoto: { type: String, default: '/images/default-user.png' }, // Default avatar
    location: { type: String, default: 'Not set' }
});

module.exports = mongoose.model('User', userSchema);
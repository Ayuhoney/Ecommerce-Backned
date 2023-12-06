const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        default: 'user', // Default role is user
        enum: ['user', 'admin'] // Allowable roles
    },
    token: {
        type: String,
        default: ''
    },
    tokenExp: {
        type: Number
    },
    tokens: [{ type: Object }]
});

module.exports = mongoose.model('User', userSchema);

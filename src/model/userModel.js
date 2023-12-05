const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true
    },
    phone: {
        type: String,
        // required: true,
        
    },
    email: {
        type: String,
        required: true,
        trim:true,
        unique:true
    },
    password: {
        type: String,
        required: true,
        trim:true,

    },
    token:{
        type:String,
        default:''
    },
    tokenExp:{
        type:Number
    },
    tokens:[{type:Object}]
 
})

module.exports = mongoose.model('User', userSchema);
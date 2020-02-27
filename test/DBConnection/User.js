const mongoose = require('mongoose');

const UseSchema = new mongoose.Schema({
    user_name:{
        type:String,
        required: true,
        trim: true
    },
    user_password:{
        type:String,
        required: true,
        trim: true
    },
    user_grp:{
        type:String,
        required: true,
        trim: true
    },
    user_firstname:{
        type:String,
        required: true,
        trim: true
    },
    user_lastname:{
        type:String,
        required: true,
        trim: true
    },
    user_type:{
        type:Number,
        required: true,
        trim: true
    },
});

const Use = mongoose.model("tbl_user", UseSchema);
module.exports = Use;
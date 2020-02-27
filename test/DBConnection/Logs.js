const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    user_id:{
        type:String,
        trim: true
    },
    user_name:{
        type:String,
        trim: true
    },
    action_id:{
        type:Number,
        required: true,
        trim: true
    },
    action_name:{
        type:String,
        required: true,
        trim: true
    },
    action_date:{
        type:String,
        required: true,
        trim: true
    },
    action_viewed:{
        type:Boolean,
        trim: true
    },
    action_removed:{
        type:Boolean,
        trim: true
    },
});

const Log = mongoose.model("tbl_log", LogSchema);
module.exports = Log;
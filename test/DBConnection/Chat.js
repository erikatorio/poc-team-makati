const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    user_id:{
        type:String,
        trim: true
    },
    sender:{
        type:String,
        trim: true,
        required: true
    },
    receiver:{
        type:String,
        trim: true,
        required: true
    },
    messages:{
        type:String,
        trim: true,
        required: true
    },
    dateTime:{
        type:String,
        trim: true,
        required: true
    },
    viewed:{
        type: Boolean,
        trim: true,
        required: true
    }
});

const Chat = mongoose.model("tbl_chat", ChatSchema);
module.exports = Chat;
const mongoose = require('mongoose');

const TallySchema = new mongoose.Schema({
    user_grp:{
        type:String,
        required: true,
        trim: true
    },
    assault:{
        type:Number,
        required: true,
        trim: true
    },
    sh:{
        type:Number,
        required: true,
        trim: true
    },
    bullying:{
        type:Number,
        required: true,
        trim: true
    },
    selfHarm:{
        type:Number,
        required: true,
        trim: true
    },
    drugUse:{
        type:Number,
        required: true,
        trim: true
    },
    hateSpeech:{
        type:Number,
        required: true,
        trim: true
    },
    iths:{
        type:Number,
        required: true,
        trim: true
    },
    harassment:{
        type:Number,
        required: true,
        trim: true
    },
    theft:{
        type:Number,
        required: true,
        trim: true
    },
    verbalAbuse:{
        type:Number,
        required: true,
        trim: true
    },
});

const Tally = mongoose.model("tbl_tally", TallySchema);
module.exports = Tally;
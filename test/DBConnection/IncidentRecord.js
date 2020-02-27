const mongoose = require('mongoose');

const IncidentRecordSchema = new mongoose.Schema({
    record_no:{
        type:Number,
        trim: true,
        lowercase: true,
        required: true
    },
    incident_type:{
        type:String,
        trim: true,
        required: true
    },
    incident_who:{
        type:String,
        required: true,
        trim: true
    },
    incident_when:{
        type:String,
        required: true,
        trim: true
    },
    incident_comments:{
        type:String,
        required: true,
        trim: true
    },
    incident_attachment:{
        type:String,
        trim: true
    },
    incident_complainant_id:{
        type:String,
        trim: true
    },
    incident_status:{
        type:String,
        required: true,
        trim: true
    },
    incident_reason:{
        type:String,
        trim: true
    },
    record_date:{
        type:String,
        required: true,
        trim: true
    },
    anonymous:{
        type:Boolean,
        required: true,
        trim: true
    },
    displayed:{
        type:Boolean,
        trim: true
    }
});

const IncidentRecord = mongoose.model("tbl_incidentRecord", IncidentRecordSchema);
module.exports = IncidentRecord;
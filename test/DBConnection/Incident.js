const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    incident_type:{
        type:String,
        required: true,
        trim: true
    },
});

const Incident = mongoose.model("tbl_incident", IncidentSchema);
module.exports = Incident;
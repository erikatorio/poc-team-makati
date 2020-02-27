const express = require('express');
const mongoose = require('mongoose');
const IncidentRecord = require('../DBConnection/IncidentRecord');
const route = express.Router();

route.get('/incidentRecords', function(req, res, next){
	var mySort = {record_date: -1};
	IncidentRecord.find().sort(mySort).exec(function(err, incidentRecord){
		if(err){
			res.send(err);
		}
		res.json(incidentRecord);
	});
});

//get specific record
route.get('/incidentRecords/id', function(req, res, next){
	IncidentRecord.find({_id: mongoose.Types.ObjectId(req.params.id)}, function(err, user){
		if(err){
			res.send(err);
		}
		res.json(user);
	});
});


//count all records
route.get('/incidentRecordsAll', function(req, res, next){
	IncidentRecord.count(function(err, incidentRecord){
		if(err){
			res.send(err);
		}
		res.json(incidentRecord);
	});
});

//count all pending status
route.get('/incidentRecordsPending', function(req, res, next){
	IncidentRecord.count({"incident_status": "Pending"}, function(err, incidentRecord){
		if(err){
			res.send(err);
		}
		res.json(incidentRecord);
	});
});

//get all pending
route.get('/PendingRecords', function(req, res, next){
	var options = {year: 'numeric', month: 'long', day: 'numeric'};
	var today = new Date().toLocaleDateString("en-US", options);
	IncidentRecord.find({"incident_status": "Pending", "displayed":false ,"record_date": {$regex: today}}, function(err, incidentRecord){
		if(err){
			res.send(err);
		}
		res.json(incidentRecord);
	}).sort({record_date: 1});
});

//count all records today
route.get('/incidentRecordsToday', function(req, res, next){
	var options = {year: 'numeric', month: 'long', day: 'numeric'};
	var today = new Date().toLocaleDateString("en-US", options);
	IncidentRecord.count({"record_date": {$regex: today}}, function(err, incidentRecord){
		if(err){
			res.send(err);
		}
		res.json(incidentRecord);
	});
});

route.post('/', async (req, res) => {
    const{record_no,incident_type, incident_who, incident_when, incident_comments,
        incident_attachment, incident_complainant_id, incident_status, record_date,
        anonymous, displayed} = req.body;
    let incidentRecord = {};
    incidentRecord.record_no = record_no;
    incidentRecord.incident_type = incident_type;
    incidentRecord.incident_who = incident_who;
    incidentRecord.incident_when = incident_when;
    incidentRecord.incident_comments = incident_comments;
    incidentRecord.incident_attachment = incident_attachment;
    incidentRecord.incident_complainant_id = incident_complainant_id;
	incidentRecord.incident_status = incident_status;
	incidentRecord.incident_reason = incident_reason;
    incidentRecord.record_date = record_date;
	incidentRecord.anonymous = anonymous;
	incidentRecord.displayed = displayed;
    let incidentRecordModel = new IncidentRecord(incidentRecord);
    await incidentRecordModel.save();
    res.json(incidentRecordModel);
  });

  //update
route.put('/incidentRecord/:id', function(req, res, next){
	console.log(req.body);
	var incidentRecord = req.body;
	var updIncidentRecord = {};

	if(incidentRecord.incident_status){
		updIncidentRecord.incident_status = incidentRecord.incident_status;
	}

	if(incidentRecord.incident_reason){
		updIncidentRecord.incident_reason = incidentRecord.incident_reason;
	}
	console.log(updIncidentRecord);

	if(!updIncidentRecord){
		res.status(400);
		res.json({
			"error": "Bad Data"
		});
	} else {
		IncidentRecord.update({_id:mongoose.Types.ObjectId(req.params.id)}, {$set:updIncidentRecord}, function(err, incidentRecord){
			if(err){
				res.send(err);
			}
			res.json(incidentRecord);
		});
	}
});

//update displayed
route.put('/displayed/:id', function(req, res, next){
	var incidentRecord = req.body;
	var updIncidentRecord = {};

	if(incidentRecord.displayed){
		updIncidentRecord.displayed = incidentRecord.displayed;
	}

	if(!updIncidentRecord){
		res.status(400);
		res.json({
			"error": "Bad Data"
		});
	} else {
		IncidentRecord.update({_id:mongoose.Types.ObjectId(req.params.id)}, {$set:updIncidentRecord}, function(err, incidentRecord){
			if(err){
				res.send(err);
			}
			res.json(incidentRecord);
		});
	}
});
  
  module.exports = route;
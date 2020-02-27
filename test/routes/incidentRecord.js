var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://127.0.0.1:27017/reporter', ['tbl_incidentRecord']);

//GET ALL
router.get('/incidentRecord', function(req, res, next){
	db.tbl_incidentRecord.find(function(err, incidentRecord){
		if(err){
			res.send(err);
		}
		res.json(incidentRecord);
	});
});

//count all records
router.get('/incidentRecords', function(req, res, next){
	db.tbl_incidentRecord.count(function(err, incidentRecord){
		if(err){
			res.send(err);
		}
		res.json(incidentRecord);
	});
});

//count all pending status
router.get('/incidentRecordsPending', function(req, res, next){
	db.tbl_incidentRecord.count({"incident_status": "Pending"}, function(err, incidentRecord){
		if(err){
			res.send(err);
		}
		res.json(incidentRecord);
	});
});

//count all records today
router.get('/incidentRecordsToday', function(req, res, next){
	db.tbl_incidentRecord.count({record_date:{"$lte":new Date()}}, function(err, incidentRecord){
		if(err){
			res.send(err);
		}
		res.json(incidentRecord);
	});
});

//GET ONE by id
router.get('/incidentRecord/:id', function(req, res, next){
	db.tbl_incidentRecord.findOne({_id: mongojs.ObjectId(req.params.id)}, function(err, incidentRecord){
		if(err){
			res.send(err);
		}
		res.json(incidentRecord);
	});
});

//update
router.put('/incidentRecord/:id', function(req, res, next){
	console.log(req.body);
	var incidentRecord = req.body;
	var updIncidentRecord = {};

	if(incidentRecord.incident_status){
		updIncidentRecord.incident_status = incidentRecord.incident_status;
	}
	console.log(updIncidentRecord);

	if(!updIncidentRecord){
		res.status(400);
		res.json({
			"error": "Bad Data"
		});
	} else {
		db.tbl_incidentRecord.update({_id:mongojs.ObjectId(req.params.id)}, {$set:updIncidentRecord}, function(err, incidentRecord){
			if(err){
				res.send(err);
			}
			res.json(incidentRecord);
		});
	}
});

module.exports = router;
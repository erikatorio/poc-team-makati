const express = require('express');
const mongoose = require('mongoose');
const Logs = require('../DBConnection/Logs');
const route = express.Router();

route.get('/', function(req, res, next){
	Logs.find().sort({action_date: -1}).exec(function(err, logs){
		if(err){
			res.send(err);
		}
		res.json(logs);
	});
});

//get all sent record 
route.get('/sentRecords', function(req, res, next){
	Logs.find({$or:[{"action_id":3}, {"action_id":6}], "action_removed":false}, function(err, logs){
		if(err){
			res.send(err);
		}
		res.json(logs);
	}).sort({action_date:-1});
});

//count all unviewed notif
route.get('/unviewed', function(req, res, next){
	Logs.count({"action_viewed":false,$or:[{"action_id":3}, {"action_id":6}], "action_removed":false}, function(err, log){
		if(err){
			res.send(err);
		}
		res.json(log);
	});
});


route.post('/', async (req, res) => {
    const{user_id,user_name, action_id, action_name, action_date, action_viewed, action_removed} = req.body;
    let log = {};
    log.user_id = user_id;
    log.user_name = user_name;
    log.action_id = action_id;
    log.action_name = action_name;
    log.action_date = action_date;
	log.action_viewed = action_viewed;
	log.action_removed = action_removed;
    let logModel = new Logs(log);
    await logModel.save();
    res.json(logModel);
  });

//update viewed
route.put('/log/:id', function(req, res, next){
	var log = req.body;
	var updLog = {};

	if(log.action_viewed){
		updLog.action_viewed = log.action_viewed;
  }

	if(!updLog){
		res.status(400);
		res.json({
			"error": "Bad Data"
		});
	} else {
		Logs.update({_id:mongoose.Types.ObjectId(req.params.id)}, {$set:updLog}, function(err, log){
			if(err){
				res.send(err);
			}
			res.json(log);
		});
	}
});

//update removed
route.put('/removed/:id', function(req, res, next){
	var log = req.body;
	var updLog = {};

	if(log.action_removed){
		updLog.action_removed = log.action_removed;
  }

	if(!updLog){
		res.status(400);
		res.json({
			"error": "Bad Data"
		});
	} else {
		Logs.update({_id:mongoose.Types.ObjectId(req.params.id)}, {$set:updLog}, function(err, log){
			if(err){
				res.send(err);
			}
			res.json(log);
		});
	}
});
  
  module.exports = route;
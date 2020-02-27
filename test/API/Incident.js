const express = require('express');
const mongoose = require('mongoose');
const Incident = require('../DBConnection/Incident');
const route = express.Router();

route.get('/', function(req, res, next){
	Incident.find(function(err, incident){
		if(err){
			res.send(err);
		}
		res.json(incident);
	});
});

// route.get('/uses', (req, res) => {
//     const{name,password} = req.body;
//     let user = {};
//     user.name = name;
//     user.password = password;
//     let userModel = new User.find();
//     res.json(userModel);
//   });

route.post('/', async (req, res) => {
    const{incident_type} = req.body;
    let incident = {};
    incident.incident_type = incident_type;
    let incidentModel = new Incident(incident);
    await incidentModel.save();
    res.json(incidentModel);
  });
  
  module.exports = route;
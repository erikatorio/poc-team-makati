var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://127.0.0.1:27017/reporter', ['tbl_incident']);

//GET ALL
router.get('/incident', function(req, res, next){
	db.tbl_incident.find(function(err, incident){
		if(err){
			res.send(err);
		}
		res.json(incident);
	});
});

module.exports = router;
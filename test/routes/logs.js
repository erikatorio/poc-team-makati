var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://127.0.0.1:27017/reporter', ['tbl_logs']);

//GET ALL
router.get('/logs', function(req, res, next){
	db.tbl_logs.find(function(err, logs){
		if(err){
			res.send(err);
		}
		res.json(logs);
	});
});

module.exports = router;
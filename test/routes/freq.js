var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://127.0.0.1:27017/reporter', ['tbl_tally']);

//GET ALL
router.get('/freq', function(req, res, next){
	db.tbl_tally.find(function(err, freq){
		if(err){
			res.send(err);
		}
		res.json(freq);
	});
});

module.exports = router;
var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://127.0.0.1:27017/reporter', ['tbl_dept']);

//GET ALL
router.get('/dept', function(req, res, next){
	db.tbl_dept.find(function(err, dept){
		if(err){
			res.send(err);
		}
		res.json(dept);
	});
});

module.exports = router;
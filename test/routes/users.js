var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://127.0.0.1:27017/reporter', ['tbl_user']);

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

//GET ALL
router.get('/users', function(req, res, next){
	db.tbl_user.find(function(err, users){
		if(err){
			res.send(err);
		}
		res.json(users);
	});
});

//count all users except admin
router.get('/usersAll', function(req, res, next){
	db.tbl_user.count({"user_type":1},function(err, users){
		if(err){
			res.send(err);
		}
		res.json(users);
	});
});

//GET ONE by id
router.get('/user/:id', function(req, res, next){
	db.tbl_user.findOne({_id: mongojs.ObjectId(req.params.id)}, function(err, user){
		if(err){
			res.send(err);
		}
		res.json(user);
	});
});


//SAVE
router.post('/user', function(req, res, next){
	var user = req.body;
	if(!user.user_type || !(user.user_name + '')){
		res.status(400);
		res.json({
			"error": "Bad Data"
		});
	} else {
		db.tbl_user.save(user, function(err, user){
			if(err){
				res.send(err);
			}
			res.json(user);
		})
	}
});

//DELETE
router.delete('/user/:id', function(req, res, next){
	db.tbl_user.remove({_id: mongojs.ObjectId(req.params.id)}, function(err, user){
		if(err){
			res.send(err);
		}
		res.json(user);
	});
});

//UPDATE
router.put('/user/:id', function(req, res, next){
	var user = req.body;
	var updUser = {};

	if(user.user_password){
		updUser.user_password = user.user_password;
	}

	if(!updUser){
		res.status(400);
		res.json({
			"error": "Bad Data"
		});
	} else {
		db.tbl_user.update({_id: mongojs.ObjectId(req.params.id)}, updUser, {}, function(err, user){
			if(err){
				res.send(err);
			}
			res.json(user);
		});
	}
});

module.exports = router;
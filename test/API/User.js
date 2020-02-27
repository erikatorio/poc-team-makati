const express = require('express');
const mongoose = require('mongoose');
const User = require('../DBConnection/User');
const route = express.Router();

route.get('/users', function(req, res, next){
	User.find(function(err, uses){
		if(err){
			res.send(err);
		}
		res.json(uses);
	});
});

//get all users except admin
route.get('/usersOnly', function(req, res, next){
	User.find({"user_type":1}, function(err, uses){
		if(err){
			res.send(err);
		}
		res.json(uses);
	});
});

//count all users except admin
route.get('/usersAll', function(req, res, next){
	User.count({"user_type":1},function(err, uses){
		if(err){
			res.send(err);
		}
		res.json(uses);
	});
});

//get users ascending by username
route.get('/usernameSortA', function(req, res, next){
	User.find({"user_type":1},function(err, uses){
		if(err){
			res.send(err);
		}
		res.json(uses);
	}).sort({user_name:1});
});

//get users descending by username
route.get('/usernameSortD', function(req, res, next){
	User.find({"user_type":1},function(err, uses){
		if(err){
			res.send(err);
		}
		res.json(uses);
	}).sort({user_name:-1});
});

//get users ascending by firstname
route.get('/firstnameSortA', function(req, res, next){
	User.find({"user_type":1},function(err, uses){
		if(err){
			res.send(err);
		}
		res.json(uses);
	}).sort({user_firstname:1});
});

//get users descending by firstname
route.get('/firstnameSortD', function(req, res, next){
	User.find({"user_type":1},function(err, uses){
		if(err){
			res.send(err);
		}
		res.json(uses);
	}).sort({user_firstname:-1});
});

//get users ascending by lastname
route.get('/lastnameSortA', function(req, res, next){
	User.find({"user_type":1},function(err, uses){
		if(err){
			res.send(err);
		}
		res.json(uses);
	}).sort({user_lastname:1});
});

//get users descending by lastname
route.get('/lastnameSortD', function(req, res, next){
	User.find({"user_type":1},function(err, uses){
		if(err){
			res.send(err);
		}
		res.json(uses);
	}).sort({user_lastname:-1});
});

//get users ascending by department
route.get('/deptSortA', function(req, res, next){
	User.find({"user_type":1},function(err, uses){
		if(err){
			res.send(err);
		}
		res.json(uses);
	}).sort({user_grp:1});
});

//get users descending by department
route.get('/deptSortD', function(req, res, next){
	User.find({"user_type":1},function(err, uses){
		if(err){
			res.send(err);
		}
		res.json(uses);
	}).sort({user_grp:-1});
});

route.post('/', async (req, res) => {
    const{user_name,user_password, user_grp, user_firstname, user_lastname, user_type} = req.body;
    let user = {};
    user.user_name = user_name;
    user.user_password = user_password;
    user.user_grp = user_grp;
    user.user_firstname = user_firstname;
    user.user_lastname = user_lastname;
    user.user_type = user_type;
    let userModel = new User(user);
    await userModel.save();
    res.json(userModel);
  });
  
  module.exports = route;
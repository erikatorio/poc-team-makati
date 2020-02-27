const express = require('express');
const mongoose = require('mongoose');
const Dept = require('../DBConnection/Dept');
const route = express.Router();

route.get('/', function(req, res, next){
	Dept.find(function(err, dept){
		if(err){
			res.send(err);
		}
		res.json(dept);
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
    const{user_grp} = req.body;
    let dept = {};
    dept.user_grp = user_grp;
    let deptModel = new Dept(dept);
    await deptModel.save();
    res.json(deptModel);
  });
  
  module.exports = route;
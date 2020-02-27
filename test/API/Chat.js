const express = require('express');
const mongoose = require('mongoose');
const Chat = require('../DBConnection/Chat');
const route = express.Router();

//ALL
route.get('/', function(req, res, next){
	Chat.find(function(err, chat){
		if(err){
			res.send(err);
		}
		res.json(chat);
	});
});

//get all unviewed
route.get('/unviewedChats', function(req, res, next){
	var options = {year: 'numeric', month: 'long', day: 'numeric'};
	var today = new Date().toLocaleDateString("en-US", options);
	Chat.find({"viewed":false, "receiver":"Admin"}, function(err, chat){
		if(err){
			res.send(err);
		}
		res.json(chat);
	}).sort({dateTime: 1});
});

//count unviewed
route.get('/unviewed', function(req, res, next){
	Chat.count({"viewed":false, "receiver":"Admin"}, function(err, chat){
		if(err){
			res.send(err);
		}
		res.json(chat);
	});
});

//SPECIFIC
// route.get('/:id', function(req, res, next){
//   Chat.find({user_id:req.params.id}, function(err, chat){
// 		if(err){
// 			res.send(err);
// 		}
// 		res.json(chat);
// 	});
// });

//ADMIN'S
route.get('/admin', function(req, res, next){
	Chat.find({$or:[{"sender":"Admin"}, {"receiver":"Admin"}]}, function(err, chat){
		  if(err){
			  res.send(err);
		  }
		  res.json(chat);
	  });
  });

//ADD NEW
route.post('/', async (req, res) => {
  const{user_id, sender, receiver, messages, dateTime, viewed} = req.body;
  let chat = {};
  chat.user_id = user_id;
  chat.sender = sender;
  chat.receiver = receiver;
  chat.messages = messages;
  chat.dateTime = dateTime;
  chat.viewed = viewed;

  let chatModel = new Chat(chat);
  await chatModel.save();
  res.json(chatModel);
});

//update viewed
route.put('/chat/:id', function(req, res, next){
	var chat = req.body;
	var updChat = {};

	if(chat.viewed){
		updChat.viewed = chat.viewed;
  }

	if(!updChat){
		res.status(400);
		res.json({
			"error": "Bad Data"
		});
	} else {
		Chat.update({_id:mongoose.Types.ObjectId(req.params.id)}, {$set:updChat}, function(err, chat){
			if(err){
				res.send(err);
			}
			res.json(chat);
		});
	}
});

module.exports = route;
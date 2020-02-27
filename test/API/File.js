const express = require('express');
const mongoose = require('mongoose');
multer = require('multer');
const File = require('../DBConnection/File');
const route = express.Router();

const DIR = './public/';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, DIR);
    },
    filename: (req, file, cb) => {
      const fileName = file.originalname.toLowerCase().split(' ').join('-');
      cb(null, fileName)
    }
  });
  
  var upload = multer({
    storage: storage,
    // limits: {
    //   fileSize: 1024 * 1024 * 5
    // },
    fileFilter: (req, file, cb) => {
      if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" ||
          file.mimetype == "image/gif") {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
      }
    }
  });

  route.post('/create-user', upload.array('file0', 6), (req, res, next) => {
    const reqFiles = []
    const url = req.protocol + '://' + req.get('host')
    for (var i = 0; i < req.files.length; i++) {
      reqFiles.push(url + '/public/' + req.files[i].filename)
    }
  
    const user = new File({
      _id: new mongoose.Types.ObjectId(),
      file0: reqFiles
    });
    user.save().then(result => {
      console.log(result);
      res.status(201).json({
        message: "Done upload!",
        userCreated: {
          _id: result._id,
          file0: result.file0
        }
      })
    }).catch(err => {
      console.log(err),
        res.status(500).json({
          error: err
        });
    })
  });
  
  // route.get("/", (req, res, next) => {
  //   File.find().then(data => {
  //     res.status(200).json({
  //       // message: "User list retrieved successfully!",
  //       // users: data
  //     });
  //   });
  // });

  route.get('/', function(req, res, next){
    File.find(function(err, dept){
      if(err){
        res.send(err);
      }
      res.json(dept);
    });
  });
  
  module.exports = route;
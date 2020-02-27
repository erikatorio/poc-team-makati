const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
var path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const mongodb = require('mongodb');
const connectDB = require('./DBConnection/Connection');

var http = require('http');

let app = express();

app.use(cors({ origin: true }));

connectDB();
app.use(express.json({extended:false}));
app.use('/api/userModel', require('./API/User'));
app.use('/api/logModel', require('./API/Log'));
app.use('/api/tallyModel', require('./API/Freq'));
app.use('/api/incidentModel', require('./API/Incident'));
app.use('/api/deptModel', require('./API/Dept'));
app.use('/api/incidentRecordModel', require('./API/IncidentRecord'));
app.use('/api/chatModel', require('./API/Chat'));
app.use('/api', require('./API/File'));

var index = require('./routes/index');
var users = require('./routes/users');
var freq = require('./routes/freq');
var incidentRecord = require('./routes/incidentRecord');
var logs = require('./routes/logs');
var incident = require('./routes/incident');
var dept = require('./routes/dept');

const port = process.env.port || 3000;

app.set('views', path.join(__dirname, 'client_sample/src'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({extended: true}));

app.use(methodOverride('_method'));
app.set('view engine', 'ejs');


const publicVapidKey = 'BIty5Q7aAdZPTB3th1Tqr9inm_hzHRhsUABOFiPPvqasfaRhtMNsO6MptziBoBvzuO5lDKuNCU7k-6zuVmnd1V4';
const privateVapidKey = 'eiN1tRJ8eEUjDn2niPwwjaLWaUMp1YkgWbSbSZI6JKg';

webpush.setVapidDetails('mailto:test@test.com', publicVapidKey, privateVapidKey);

//subscribe route
app.post('/subscribe', (req, res) =>{
	//get pushSubscription object
	const subscription = req.body;

	//send 201 - resource created
	res.status(201).json({});

	//create payload
	const payload = JSON.stringify({ title: 'Push Test'});

	//pass object into sendNotif
	webpush.sendNotification(subscription, payload).catch(err=> console.error(err));
});




app.use(express.static(path.join(__dirname, 'client_sample')));

app.use('/', index);
app.use('/api', users);
app.use('/api', freq);
app.use('/api', incidentRecord);
app.use('/api', logs);
app.use('/api', incident);
app.use('/api', dept);


 app.listen(port, function(){
 	console.log('Server started on port ' + port);
});
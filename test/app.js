var http = require('http');
var path = require('path');
var fs = require('fs');
var checkMimeType = true;

var hostname = '127.0.0.1';
var port = 3000;

var server = http.createServer((req, res) => {
	var filename = req.url == "" || req.url == "/" ? "/index.html" : req.url;
	var ext = path.extname(filename);
	var localPath = __dirname;
	var validExtensions = {
		".html" : "text/html",
		".js" : "application/javascript",
		".css" : "text/css",
		".jpg" : "image/jpeg",
		".png" : "image/png",
		".ico" : "image/ico"
	};

	var validMimeType = true;
	var mimeType = validExtensions[ext];
	console.log(mimeType);
	if(checkMimeType) {
		validMimeType = validExtensions[ext] !== undefined;
	}
	console.log(localPath);

	if(validMimeType) {
		localPath += filename;
		fs.exists(localPath, function(exists){
			if(exists) {
				console.log("Serving file: " + localPath);
				getFile(localPath, res, mimeType);
			} else {
				console.log("File " + localPath + " not found");
				res.writeHead(404);
				res.end();
			}
		});
	} else {
		console.log("Invalid file extension detected: " + ext + " (" + filename + ")");
	}
});

function getFile(localPath, res, mimeType) {
	fs.readFile(localPath, (err, contents) => {
		if(err){
			res.writeHead(500);
			res.end();
		}
		res.setHeader("Content-Length", contents.length);
		if(mimeType !== undefined) {
			res.setHeader("Content-Type", mimeType);
		}
		res.statusCode = 200;
		res.end(contents);
	});
};

server.listen(port, hostname, () => {
	console.log('Server started on port ' + port);
});
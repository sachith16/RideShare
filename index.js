var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var Firebase = require('firebase');
var path = require('path');

app.use(bodyparser());

Firebase.initializeApp({
    databaseURL: "https://rideshare-81bd5.firebaseio.com",
    serviceAccount: 'rideshare-81bd5-firebase-adminsdk-4of8h-49510167e9.json'
});

var db = Firebase.database();
//var usersRef = db.ref("users");

//Link static route to CSS folder
app.use('/css',express.static(__dirname+'/css'));

//Link static route to map folder-contains html files
app.use('/map',express.static(__dirname+'/map'));

app.get("/",function(req,res){
	res.sendFile('map/index.html',{root:__dirname});
});

app.get("/sign-in",function(req,res){
	res.sendFile('map/sign-in.html',{root:__dirname});
});

app.get("/share-ride",function(req,res){
	res.sendFile('map/share-ride.html',{root:__dirname});
});

app.post('/login', function(req, res) {
	if(req.body.username==''){
		res.end('0');
	}else{
		var ref = db.ref("users/"+req.body.username);

	    ref.once("value",function(snapshot) {
	    	if(snapshot.exists()){
	    		res.end('1');
	    	}else{
	    		res.end('0');
	    	}    
	  	});
	}
});

app.listen(8080,function(){
	console.log("Logged");	
});



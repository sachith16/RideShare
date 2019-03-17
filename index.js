var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var sessions = require('express-session');
var Firebase = require('firebase');
var path = require('path');
var socket = require('socket.io');
//Distance Matrix Setup
var distance = require('google-distance-matrix');
distance.key('AIzaSyCl9mEA7T-iUdXFZnYqWo9ALm98slWZkdc');
distance.mode('driving');
//Global variable setup
var session;
var user='';
var waypoints=[];
var matchedpoints=[];
var rqst;
var feePerKM=30;
//NPM packages setup
app.use(bodyparser());
app.use(sessions({secret:'jr5dbvs9maq'}));
//Firebase database initialization
Firebase.initializeApp({
    databaseURL: "https://rideshare-81bd5.firebaseio.com",
    serviceAccount: 'rideshare-81bd5-firebase-adminsdk-4of8h-49510167e9.json'
});
var db = Firebase.database();
//App setup
//Link static route to JavaScript folder
app.use('/script',express.static(__dirname+'/script'));

//Link static route to map folder-contains html files
app.use('/map',express.static(__dirname+'/map'));

//Link static route to map folder-contains html files
app.use('/icons',express.static(__dirname+'/icons'));

app.use('/',express.static(__dirname));

app.get("/",function(req,res){	
	res.sendFile('map/index.html',{root:__dirname});
});

app.get("/sign-in",function(req,res){
	res.sendFile('map/sign-in.html',{root:__dirname});
});

app.get("/sign-up",function(req,res){
	res.sendFile('map/sign-up.html',{root:__dirname});
});

app.get("/share-ride",function(req,res){
	res.sendFile('map/share-ride.html',{root:__dirname});
});

app.get("/request-ride",function(req,res){
	res.sendFile('map/request-ride.html',{root:__dirname});
});

app.get("/view-rides",function(req,res){
	res.sendFile('map/view-rides.html',{root:__dirname});
});

app.get("/test-map",function(req,res){
	res.sendFile('map/map.html',{root:__dirname});
});

app.get("/rides-map",function(req,res){
	res.sendFile('map/map-rides.html',{root:__dirname});
});

app.post('/login', function(req, res) {
	if(req.body.username==''){
		res.end('0');
	}else{
		var ref = db.ref("users/"+req.body.username);
	    ref.once("value",function(snapshot) {
	    	if(snapshot.exists()){
	    		session=req.session;
	    		session.username=req.body.username;
	    		res.end('1');	    		
	    	}else{
	    		res.end('0');
	    	}    
	  	});
	}
});

app.post('/signup', function(req, res) {
	var ref = db.ref("users/"+req.body.username);
	ref.set({age: req.body.age,
			job: req.body.job,
			living: req.body.living
			}, function(error) {
		if (error) {
		  res.end('Error');	
		} else {
		  res.end('User Successfully Added');	
		}
	}); 		 	
});

app.post('/add-ride', function(req, res) {
	session=req.session;
	user=session.username;	
	var ref = db.ref("rides/"+user);
	ref.set({username: user,
			deviceid: req.body.deviceid,
			origin_name: req.body.origin_name,
			destination_name: req.body.destination_name,
			origin: req.body.origin,
			destination: req.body.destination,
			waypoints: req.body.waypoints.substr(1).slice(0, -1).split("),(")
	}, function(error) {
		if (error) {
		  res.end('0');	
		} else {
		  res.end('1');	
		}
	}); 		 	
});

app.post('/check-ride', function(req, res) {
	session=req.session;
	user=session.username;	
	var ref = db.ref("rides/"+user);

	ref.once("value",function(snapshot) {
	    if(snapshot.exists()){
	    	res.end('1');	    		
	    }else{
	    	res.end('0');
	    }    
	});
});

app.post('/remove-ride', function(req, res) {
	session=req.session;
	user=session.username;	
	var ref = db.ref("rides/"+user);
	ref.remove()
    .then(function() {
    	res.end('Successfully Removed');
    })
    .catch(function(error) {
    	res.end('Error: '+error);
    });		 	
});
var reads = [];
app.post('/match-ride', function(req, res) {
	rqst=req;
	session=req.session;
	user=session.username;
	waypoints=req.body.waypoints.substr(1).slice(0, -1).split("),(");	

	var highestDistance=0;
	var matchedDeviceID;
	var sendingDetailsRequested;
	var sendingDetailsStarted;

	var ref = db.ref("rides");

	ref.once("value",function(snapshot) {

		var snapLength=snapshot.numChildren();
		var j=0;		
		

	    if(snapshot.exists()){
	    	snapshot.forEach((child) => {
	    		matchedpoints=[];
	    		reads.push(j);
				for (var i=0;i<child.val().waypoints.length;i++){					
				    if(waypoints.includes(child.val().waypoints[i])){
				    	matchedpoints.push(child.val().waypoints[i]);
				    }
				}
				if(matchedpoints.length>1){
					getDistanceMatch(child.val().origin,child.val().destination,rqst.body.origin,
						rqst.body.destination,matchedpoints[0],matchedpoints[matchedpoints.length-1],function(result,duration,costS,costR,distanceM){
							console.log(result);
							if(result && distanceM>highestDistance){								
								matchedDeviceID=child.val().deviceid;
								
								sendingDetailsRequested=JSON.stringify({username:child.val().username,
								device_id:child.val().deviceid,
								duration : duration,
								origin_name:child.val().origin_name,
								destination_name:child.val().destination_name,
								cost:costR});

								sendingDetailsStarted=JSON.stringify({username:user,
								device_id:req.body.deviceid,
								origin_name:req.body.origin_name,
								destination_name:req.body.destination_name,
								cost:costS});

								highestDistance=distanceM;
								if(j==snapLength){
									//Sending matched details to requested user
									//io.sockets.connected[rqst.body.deviceid].emit('match',sendingDetailsRequested);
									//Sending matched details to started user
									//io.sockets.connected[matchedDeviceID].emit('match',sendingDetailsStarted);
								}
							}
					});
				}			

				j=j+1;
			});	
	    }else{
	    	res.end('No rides at the time');
	    }

	    return Promise.all("reads");    
	}).then(function(values) { 
        console.log(reads);
    });		 	
});

function getDistanceMatch(s_o,s_d,r_o,r_d,m_o,m_d,callback){
	var origins = [s_o,r_o,m_o,m_o,s_o];
	var destinations = [s_d,r_d,m_d,r_o,r_o];

	return distance.matrix(origins, destinations, function (err, distances) {
	    if (distances.status == 'OK') {
	        if (distances.rows[0].elements[0].status == 'OK' && distances.rows[1].elements[0].status == 'OK' && distances.rows[2].elements[0].status == 'OK') {
	            //Distance of the ride of started rider
	            var distanceS = distanceFloat(distances.rows[0].elements[0].distance.text);
	            //Distance of the ride of requested rider
	            var distanceR = distanceFloat(distances.rows[1].elements[1].distance.text);
	            //Distance of the overlapping part
	            var distanceM = distanceFloat(distances.rows[2].elements[2].distance.text);
	            //Distance from overlapping origin to requested riders' origin
	            var distanceP = distanceFloat(distances.rows[3].elements[3].distance.text);

	            console.log(distanceS+" "+distanceR+" "+distanceM+" "+distanceP+" "+distances.rows[4].elements[4].duration.text);

	            //Cost of the ride of started rider
	            var costS=((distanceS-distanceM)*feePerKM)+((distanceM*feePerKM)/2);
	            //Cost of the ride of requested rider
	            var costR=((distanceR-distanceM)*feePerKM)+((distanceM*feePerKM)/2);

	            if((distanceM>(distanceS*0.5) || distanceM>(distanceR*0.5)) && distanceP<5){
	            	callback(true,distances.rows[4].elements[4].duration.text,costS,costR,distanceM);
	            }else{
	            	callback(false);
	            }
	        }else{
	        	callback(false);
	        } 
	    } else{callback(false);} 
	});
}

app.post('/get-all-rides', function(req, res) {
	var ref = db.ref("rides");

	ref.once("value",function(snapshot) {
	    if(snapshot.exists()){
	    	items=[]
	    	snapshot.forEach((child) => {
	    		itemSample=[];
				itemSample.push(child.val().origin_name);
				itemSample.push(child.val().destination_name);
				itemSample.push(child.val().origin);
				itemSample.push(child.val().destination);
				itemSample.push(child.val().username);
				items.push(itemSample);			
			});
			res.end(JSON.stringify(items));
	    }else{
	    	res.end(0);
	    }    
	});		 	
});

app.post('/respond-match', function(req, res) {
	io.sockets.connected[req.body.deviceid].emit('match-response',req.body.response); 		 	
});

function distanceFloat(distance){
	if(distance.includes("km")){
		return parseFloat(distance.replace("km","").slice(0, -1));
	}else{
		return parseFloat(distance.replace("m","").slice(0, -1))/1000;
	}
}

var server=app.listen(8080,function(){
	console.log("Logged");	   
});

var io = socket(server);
io.on('connection', (socket) => {
    socket.emit('initialize', socket.id);
    //io.sockets.connected[socket.id].emit('initialize',"output");
});

/*class User{
  private var name;

  constructor(name) {
    this.name = name;
  }

  sayHi() {
    alert(this.name);
  }

}*/




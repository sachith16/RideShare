var map;
var services;
var from_place;
var to_place;
var pointsArray=[];//Keeps the waypoints of the route
var io_id='';//Socket id
var type=-1;// 0->Requested user, 1->Started user ,-1->No type
var match_deviceid='';//Socket id of the matched users' device
var match_response=-1;//Response to the match by other user
var my_response=-1;//Response to the match by me
var matched_origin;//Origin cordinates of matched ride
var matched_destination;//Destination cordinates of matched ride
var display;
// Make connection
var socket = io.connect('http://192.168.1.104:8080');//------->IP address of server

socket.on('initialize', function(data){
    io_id=data;
});

socket.on('match', function(data){
	document.getElementById('match-panel').style.visibility = "visible";	
	data_json=JSON.parse(data.toString());
	match_deviceid=data_json.device_id;
	match_response=-1;
	my_response=-1;
	matched_origin=data_json.origin;
	matched_destination=data_json.destination;
	if(type==0){
		$('#match-details').text("Duration : "+data_json.duration+"   "+"Origin : "+data_json.origin_name+"   "+"Destination : "+data_json.destination_name+"   "+"Cost : "+data_json.cost);
	}else{
		$('#match-details').text("Origin : "+data_json.origin_name+"   "+"Destination : "+data_json.destination_name+"   "+"Cost : "+data_json.cost);
	}

	$.ajax({
		type: "POST",
		url: "/get-user-details",
		data: {            
			username: data_json.username
		},
		success: function(result) {
			user_data_json=JSON.parse(result.toString());
			$('#user-details').text("Age : "+user_data_json.age+"   "+"Job : "+user_data_json.job+"   "+"Living Area : "+user_data_json.living);
		},
		error: function(result) {
			alert('error:'+result);
		}
	}); 
});
//When response of the matched partner arrive
socket.on('match-response', function(data){	
	match_response=data;
	if(data==0){
		alert("Other user rejected the match");
		document.getElementById('match-panel').style.visibility = "hidden"; 
	}else if(data==1){
		if(my_response==1){
			alert("Rides matched");
			if(type==1){removeRide();}
			showrouteM();
		}
	}
});
//onclick of ADD RIDE button
$("#sub-add").click(function(e) {
        	e.preventDefault();
        	type=1;
        	addRide();
        	showroute();
		});

//onclick of REQUSET RIDE button
$("#sub-req").click(function(e) {
    e.preventDefault();
    $.ajax({
		type: "POST",
		url: "/check-ride",				
		success: function(result) {
			if(result=='1'){
				alert('Already exists a ride for user');
			}else{
				type=0;				
				matchRide(); 
				showroute();      	
			}
		},
		error: function(result) {
			alert('error:'+result);
		}
	});
});
//onclick of REMOVE RIDE button
$("#rmv").click(function(e) {
    e.preventDefault();
    removeRide();
});
//onclick of ACCEPT button
$("#sub-accept").click(function(e) {
    document.getElementById('match-panel').style.visibility = "hidden";
    my_response=1;
    sendResponse(1);
    if(match_response==1){
    	alert("Rides matched");
    	if(type==1){removeRide();}
    	showrouteM();
    } 
});
//onclick of REJECT RIDE button
$("#sub-reject").click(function(e) {
    document.getElementById('match-panel').style.visibility = "hidden"; 
    my_response=0;
    sendResponse(0);
});

function initMap(){

	var options = {
        zoom:8,
        center:{lat:6.9271,lng:79.8612},disableDefaultUI: false
    }

    map = new google.maps.Map(document.getElementById('map'), options);    
    services = new google.maps.DirectionsService();

	$('#origin').val("");
	$('#destination').val("");

    // add input listeners
    google.maps.event.addDomListener(window, 'load', function () {
	    var origin = new google.maps.places.Autocomplete(document.getElementById('origin'));
	    var destination = new google.maps.places.Autocomplete(document.getElementById('destination'));

	    google.maps.event.addListener(origin, 'place_changed', function () {
	        from_place = origin.getPlace();
	        var from_address = from_place.formatted_address;
	        $('#origin').val(from_address);
	        if($('#destination').val()!=''){
	                getWaypoints();
	       }                
	    });

	    google.maps.event.addListener(destination, 'place_changed', function () {
	        to_place = destination.getPlace();
	        var to_address = to_place.formatted_address;
	        $('#destination').val(to_address);
	        if($('#origin').val()!=''){
	            getWaypoints();
	        } 
	    });
    });    	        		
}

function matchRide(){
	var origin_c=from_place.geometry.location.lat()+", "+from_place.geometry.location.lng();
    var destination_c=to_place.geometry.location.lat()+", "+to_place.geometry.location.lng();
	
	$.ajax({
		type: "POST",
		url: "/match-ride",
		data: {            
			deviceid: io_id,
			origin_name: $('#origin').val(),
			destination_name: $('#destination').val(),
			origin: origin_c,
			destination: destination_c,
			waypoints: pointsArray.toString()
		},
		success: function(result) {
			alert(result);
		},
		error: function(result) {
			//alert('error:'+result);
		}
	});	
}

function addRide(){
	var origin_c=from_place.geometry.location.lat()+", "+from_place.geometry.location.lng();
    var destination_c=to_place.geometry.location.lat()+", "+to_place.geometry.location.lng();
	
	$.ajax({
		type: "POST",
		url: "/add-ride",
		data: {            
			deviceid: io_id,
			origin_name: $('#origin').val(),
			destination_name: $('#destination').val(),
			origin: origin_c,
			destination: destination_c,
			waypoints: pointsArray.toString()
		},
		success: function(result) {
			if(result=='0'){
			    alert('Error in Adding');
			}else{            	
			    alert("Added successfully");       	
			}
		},
		error: function(result) {
			alert('error:'+result);
		}
	});	
}

function addRideRequest(){
	var origin_c=from_place.geometry.location.lat()+", "+from_place.geometry.location.lng();
    var destination_c=to_place.geometry.location.lat()+", "+to_place.geometry.location.lng();
	
	$.ajax({
		type: "POST",
		url: "/add-ride-request",
		data: {            
			deviceid: io_id,
			origin_name: $('#origin').val(),
			destination_name: $('#destination').val(),
			origin: origin_c,
			destination: destination_c,
			waypoints: pointsArray.toString()
		},
		success: function(result) {
			if(result=='0'){
			    alert('Error in Adding');
			}else{            	
			    //alert("Added successfully");       	
			}
		},
		error: function(result) {
			alert('error:'+result);
		}
	});	
}

function removeRide(){
	$.ajax({
		type: "POST",
		url: "/remove-ride",
		success: function(result) {
			console.log(result);
		},
		error: function(result) {
			console.log('error:'+result);
		}
	});	
}

function getWaypoints(){
	var origin_lat=from_place.geometry.location.lat();
	var origin_lng=from_place.geometry.location.lng();
	var destination_lat=to_place.geometry.location.lat();
	var destination_lng=to_place.geometry.location.lng();	

	var services = new google.maps.DirectionsService();

	var request ={
		origin : new google.maps.LatLng(origin_lat,origin_lng),
		destination : new google.maps.LatLng(destination_lat,destination_lng),
		travelMode: 'DRIVING'
	};

	services.route(request,function(result,status){
		if(status =='OK'){
			pointsArray = result.routes[0].overview_path;
			$('#route-det').text("Origin : "+origin_lat+" , "+origin_lng+"   Destination : "+destination_lat+" , "+destination_lng+"  "+pointsArray.length);		
		}		
	});		
}

function sendResponse(reponse){
	$.ajax({
		type: "POST",
		url: "/respond-match",
		data: {            
			deviceid: match_deviceid,
			response: reponse
		},		
		error: function(result) {
			console.log('error:'+result);
		}
	});
}

function showroute(){
	var options = {
        zoom:12,
        center:{lat:from_place.geometry.location.lat(),lng:from_place.geometry.location.lng()},disableDefaultUI: false
    }

    map = new google.maps.Map(document.getElementById('map'), options);

	display = new google.maps.DirectionsRenderer({preserveViewport: true});
    display.setOptions( { suppressMarkers: true,polylineOptions: {
            strokeWeight: 5,
            strokeOpacity: 1,
            strokeColor:  'red' 
        }});
	display.setMap(map);

	var request ={
		origin : new google.maps.LatLng(from_place.geometry.location.lat(),from_place.geometry.location.lng()),
		destination:new google.maps.LatLng(to_place.geometry.location.lat(),to_place.geometry.location.lng()),
		travelMode: 'DRIVING'
	};
	
	services.route(request,function(result,status){
		if(status =='OK'){
			display.setDirections(result);	
		}
	});	
}

function showrouteM(){
	var display_m = new google.maps.DirectionsRenderer({preserveViewport: true});
    display_m.setOptions( { suppressMarkers: true,polylineOptions: {
            strokeWeight: 4,
            strokeOpacity: 1,
            strokeColor:  'blue' 
        }});
	display_m.setMap(map);

	var request_m ={
		origin : new google.maps.LatLng(matched_origin.split(',')[0],matched_origin.split(',')[1]),
		destination:new google.maps.LatLng(matched_destination.split(',')[0],matched_destination.split(',')[1]),
		travelMode: 'DRIVING'
	};
	
	services.route(request_m,function(result,status){
		if(status =='OK'){
			display_m.setDirections(result);	
		}
	});	

}
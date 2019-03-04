var from_place;
var to_place;
var pointsArray=[];
var fcm_token='';

var config = {
	    apiKey: "AIzaSyAZR5WH00Z6BF26JeIoy3I6ycPtlkliFn4",
	    authDomain: "rideshare-81bd5.firebaseapp.com",
	    databaseURL: "https://rideshare-81bd5.firebaseio.com",
	    projectId: "rideshare-81bd5",
	    storageBucket: "rideshare-81bd5.appspot.com",
	    messagingSenderId: "957354436658"
	  };

firebase.initializeApp(config);

const messaging = firebase.messaging();
	  
      messaging.requestPermission()
                .then(function () {
                    console.log("Got notification permission");
                    return messaging.getToken();
                })
                .then(function (token) {
                    fcm_token=token;
                    console.log(fcm_token);
                })
                .catch(function (err) {
                    console.log("Didn't get notification permission", err);
                });
        
        messaging.onMessage(function (payload) {
            console.log("Message received. ", JSON.stringify(payload));
        });

        messaging.onTokenRefresh(function () {
            messaging.getToken()
                .then(function (refreshedToken) {
                    fcm_token=refreshedToken;
                }).catch(function (err) {
                    console.log('Unable to retrieve refreshed token ', err);
                });
        });

function initMap(){
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
					    matchRide();       	
					}
				},
				error: function(result) {
					alert('error:'+result);
				}
			});
		});

		$("#sub-add").click(function(e) {
        	e.preventDefault();
        	addRide();
		});

		$("#rmv").click(function(e) {
        	e.preventDefault();
        	removeRide();
		});
    }

function matchRide(){
	var origin_c=from_place.geometry.location.lat()+", "+from_place.geometry.location.lng();
    var destination_c=to_place.geometry.location.lat()+", "+to_place.geometry.location.lng();
	
	$.ajax({
		type: "POST",
		url: "/match-ride",
		data: {            
			deviceid: fcm_token,
			origin_name: $('#origin').val(),
			destination_name: $('#destination').val(),
			origin: origin_c,
			destination: destination_c,
			waypoints: pointsArray.toString(),
			riders_no: 1 
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
			deviceid: fcm_token,
			origin_name: $('#origin').val(),
			destination_name: $('#destination').val(),
			origin: origin_c,
			destination: destination_c,
			waypoints: pointsArray.toString(),
			riders_no: 1
		},
		success: function(result) {
			if(result=='0'){
			    alert('Already exists a ride for user');
			}else{            	
			    alert("Added successfully");       	
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
			alert(result);
		},
		error: function(result) {
			alert('error:'+result);
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
		destination:new google.maps.LatLng(destination_lat,destination_lng),
		travelMode: 'DRIVING'
	};

	services.route(request,function(result,status){
		if(status =='OK'){
			pointsArray = result.routes[0].overview_path;
			$('#route-det').text("Origin : "+origin_lat+" , "+origin_lng+"   Destination : "+destination_lat+" , "+destination_lng+"  "+pointsArray.length);		
		}		
	});		
}
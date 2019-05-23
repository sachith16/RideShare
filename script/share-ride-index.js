var from_place;
var to_place;
var pointsArray=[];

function initMap(){
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

        $("#sub").click(function(e) {
        	e.preventDefault();
        	addRide();
		});

		$("#rmv").click(function(e) {
        	e.preventDefault();
        	removeRide();
		});
    
    }

function addRide(){
	var origin_c=from_place.geometry.location.lat()+", "+from_place.geometry.location.lng();
    var destination_c=to_place.geometry.location.lat()+", "+to_place.geometry.location.lng();
	
	$.ajax({
		type: "POST",
		url: "/add-ride",
		data: {            
			deviceid: 'test',
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
		}		
	});		
}
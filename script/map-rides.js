var map;
var services;

function initMap(){
    var options = {
        zoom:8,
        center:{lat:6.9271,lng:79.8612},disableDefaultUI: false
    }

    map = new google.maps.Map(document.getElementById('map'), options);    
    services = new google.maps.DirectionsService();

    $.ajax({
        type: "POST",
        url: "/get-all-rides",
        success: function(result) {
        	var rides=JSON.parse(result);
        	for(var i=0; i<rides.length; i++){
				calculateroute(rides[i][2],rides[i][3]);
        	}   
        },
        error: function(result) {
            alert('error:'+result);
        }
    });
}

function initMap2(){

	services = new google.maps.DirectionsService();  

    $.ajax({
        type: "POST",
        url: "/get-all-rides",
        success: function(result) {
        	var rides=JSON.parse(result);
        	for(var i=0; i<rides.length; i++){
				calculateroute(rides[i][2],rides[i][3]);
        	}   
        },
        error: function(result) {
            alert('error:'+result);
        }
    });
}

function calculateroute(origin,destination){
	var display = new google.maps.DirectionsRenderer({preserveViewport: true});
    display.setOptions( { suppressMarkers: true,polylineOptions: {
            strokeWeight: 4,
            strokeOpacity: 1,
            strokeColor:  'red' 
        }});
	display.setMap(map);

	var request ={
		origin : new google.maps.LatLng(origin.split(',')[0],origin.split(',')[1]),
		destination:new google.maps.LatLng(destination.split(',')[0],destination.split(',')[1]),
		travelMode: 'DRIVING'
	};
	
	services.route(request,function(result,status){
		if(status =='OK'){
			display.setDirections(result);	
		}
	});		

}

	
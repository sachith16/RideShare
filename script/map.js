function initMap(){

	var totalDistanceA = 0;
	var totalDistanceB = 0;
	var pointsArrayA = [];
	var pointsArrayB = [];
	console.log('This was logged in the callback!');

      var options = {
        zoom:15,
        center:{lat:6.9271,lng:79.8612},disableDefaultUI: true
      }

      var map = new google.maps.Map(document.getElementById('map'), options);


      google.maps.event.addListener(map, 'click', function(event){
        addMarker({coords:event.latLng});
      });

	//var taxi = new google.maps.Marker({position:{lat:6.9271,lng:79.8635},map:map,draggable: true,icon:'icons/taxi.png'});
    var origin_a = new google.maps.Marker({position:{lat:6.9271,lng:79.8612},map:map,draggable: true,icon:'icons/origin_a.png'});
    var dest_a = new google.maps.Marker({position:{lat:6.9271,lng:79.8620},map:map,draggable: true,icon:'icons/dest_a.png'});

    google.maps.event.addListener(origin_a, "mouseup", function(evt){
    	calculateroute();
    });

    google.maps.event.addListener(dest_a, "mouseup", function(evt){
    	calculateroute();
    });

    var origin_b = new google.maps.Marker({position:{lat:6.9275,lng:79.8612},map:map,draggable: true,icon:'icons/origin_b.png'});
    var dest_b = new google.maps.Marker({position:{lat:6.9278,lng:79.8612},map:map,draggable: true,icon:'icons/dest_b.png'});

    google.maps.event.addListener(origin_b, "mouseup", function(evt){
    	calculateroute2();
    });

    google.maps.event.addListener(dest_b, "mouseup", function(evt){
    	calculateroute2();
    });


    var display = new google.maps.DirectionsRenderer({preserveViewport: true});
	var services = new google.maps.DirectionsService();
	display.setOptions( { suppressMarkers: true,polylineOptions: {
            strokeWeight: 6,
            strokeOpacity: 1,
            strokeColor:  'red' 
        }});
	display.setMap(map);

	function calculateroute(){
		var request ={
		origin : new google.maps.LatLng(origin_a.getPosition().lat(),origin_a.getPosition().lng()),
		destination:new google.maps.LatLng(dest_a.getPosition().lat(),dest_a.getPosition().lng()),
		travelMode: 'DRIVING'
		};
		services.route(request,function(result,status){
			if(status =='OK'){
				display.setDirections(result);	
				pointsArrayA = result.routes[0].overview_path;				
				totalDistanceA = 0;
				var legs = result.routes[0].legs;
				for(var i=0; i<legs.length; ++i) {
				    totalDistanceA += legs[i].distance.value;
				}
				document.getElementById("distanceA").innerHTML = "Distance A : "+totalDistanceA+"m";
				matchPoints();
			}
		});					
	}

	var display_b = new google.maps.DirectionsRenderer({preserveViewport: true});
	var services_b = new google.maps.DirectionsService();
	display_b.setOptions( { suppressMarkers: true,polylineOptions: {
            strokeWeight: 4,
            strokeOpacity: 1,
            strokeColor:  'blue' 
        }});
	display_b.setMap(map);	

	function calculateroute2(){
		var request ={
		origin : new google.maps.LatLng(origin_b.getPosition().lat(),origin_b.getPosition().lng()),
		destination:new google.maps.LatLng(dest_b.getPosition().lat(),dest_b.getPosition().lng()),
		travelMode: 'DRIVING'
		};
		services_b.route(request,function(result,status){
			if(status =='OK'){
				display_b.setDirections(result);	
				pointsArrayB = result.routes[0].overview_path;				
				totalDistanceB = 0;
				var legs = result.routes[0].legs;
				for(var i=0; i<legs.length; ++i) {
				    totalDistanceB += legs[i].distance.value;
				}
				document.getElementById("distanceB").innerHTML = "Distance B : "+totalDistanceB+"m";
				matchPoints();
			}
		});					
	}	

	var displayC = new google.maps.DirectionsRenderer({preserveViewport: true});
	var servicesC = new google.maps.DirectionsService();
	var servicesC2 = new google.maps.DirectionsService();

	displayC.setOptions( { suppressMarkers: true,polylineOptions: {
	            strokeWeight: 15,
	            strokeOpacity: 1,
	            strokeColor:  'green' 
	        }});

	function matchPoints(){
		var matchPointsArray = [];
		
		for(var i=0; i<pointsArrayA.length;i++){
			for(var j=0; j<pointsArrayB.length;j++){
				if((pointsArrayA[i].lat()==pointsArrayB[j].lat())&&(pointsArrayA[i].lng()==pointsArrayB[j].lng())){
					matchPointsArray.push(pointsArrayA[i]);
				}
			}
		}		

		console.log(matchPointsArray.length);
		

		if(matchPointsArray.length>0){		
		
		displayC.setMap(map);


		var request ={
		origin : new google.maps.LatLng(matchPointsArray[0].lat(),matchPointsArray[0].lng()),
		destination:new google.maps.LatLng(matchPointsArray[matchPointsArray.length-1].lat(),matchPointsArray[matchPointsArray.length-1].lng()),
		travelMode: 'DRIVING'
		};
		servicesC.route(request,function(result,status){
			if(status =='OK'){
				displayC.setDirections(result);
				var totalDistanceO = 0;
				var legs = result.routes[0].legs;
				for(var i=0; i<legs.length; ++i) {
				    totalDistanceO += legs[i].distance.value;
				}
				document.getElementById("distanceO").innerHTML = "Distance Overlap : "+totalDistanceO+"m A("+Math.round((totalDistanceO/totalDistanceA)*100)+"%)    B("+Math.round((totalDistanceO/totalDistanceB)*100)+"%)";				
			}
		});
		////////////return route//////////////////

		}else{
			displayC.setMap(null);
			document.getElementById("distanceO").innerHTML = "Distance Overlap : 0m";
		}
	}	

	////////////////////////Route 3///////////////////////////////////
	/*var displayT = new google.maps.DirectionsRenderer({preserveViewport: true});
	var displayT2 = new google.maps.DirectionsRenderer({preserveViewport: true});
	var servicesT = new google.maps.DirectionsService();
	displayT.setOptions( { suppressMarkers: true,polylineOptions: {
            strokeWeight: 14,
            strokeOpacity: 1,
            strokeColor:  'black' 
        }});
	displayT.setMap(map);
	displayT2.setOptions( { suppressMarkers: true,polylineOptions: {
            strokeWeight: 14,
            strokeOpacity: 1,
            strokeColor:  'black' 
        }});
	displayT2.setMap(map);

	function calculateroute3(){
		var request ={
		origin : new google.maps.LatLng(taxi.getPosition().lat(),taxi.getPosition().lng()),
		destination:new google.maps.LatLng(origin_b.getPosition().lat(),origin_b.getPosition().lng()),
		travelMode: 'DRIVING'
		};
		servicesT.route(request,function(result,status){
			if(status =='OK'){
				displayT.setDirections(result);					
			}
		});	

		var request2 ={
		origin : new google.maps.LatLng(origin_b.getPosition().lat(),origin_b.getPosition().lng()),
		destination:new google.maps.LatLng(taxi.getPosition().lat(),taxi.getPosition().lng()),
		travelMode: 'DRIVING'
		};
		servicesT.route(request2,function(result,status){
			if(status =='OK'){
				displayT2.setDirections(result);					
			}
		});				
	}*/
}
function initMap() {
	// Create a map object and specify the DOM element for display.
	var map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 42.36, lng: -71.08},
		scrollwheel: false,
		zoom: 14
	});

	// Set markers
	//var myLatlng = new google.maps.LatLng([42.355137, -71.065604]);
	var myLatlng = {lat: 42.355137, lng: -71.065604};
	var marker = new google.maps.Marker({
		position: myLatlng,
		map: map,
		title:"Bos Com"
	});
	//marker.setMap(map);

	//var myLatlng2 = new google.maps.LatLng([42.360139, -71.094192]);
	var myLatlng2 = {lat: 42.360139, lng: -71.094192};
	var marker2 = new google.maps.Marker({
		position: myLatlng2,
		map: map,
		title:"Made In Taiwan"
	});
	//marker2.setMap(map);

	var vm = $root.ko.dataFor(document.body);

	console.log(vm.locations[0].label())
}

// Class to represent location (point-of-interest)
function Location(label, latLng, visible) {
	var self = this;
	self.label = ko.observable(label);
	self.latLong = ko.observableArray(latLng);
	self.visible = ko.observable(visible);
}

// Overall viewmodel for this screen, along with initial state
function MyViewModel() {
	var self = this;

	// Data
	self.locations = ko.observableArray([
		new Location("Boston Common", [42.355137, -71.065604], true),
		new Location("MIT", [42.360139, -71.094192], true),
		new Location("TD Garden", [42.366190, -71.062114], true)
	]);

	// Filter function
	self.filter = function() {
		var filterSubstr = $("#filter-form").val();
		console.log(filterSubstr);

		// Loop through all locations, find locations that match filter substring
		for (var i = 0; i < self.locations().length; i++) {
			var label = self.locations()[i].label();

			// If form input matches filter, location is visible. Else, invisible.
			self.locations()[i].visible( (label.indexOf(filterSubstr) > -1) ? true : false );
			/*if (label.indexOf(filterSubstr) > -1) {
				self.locations()[i].visible = true;
			}
			else {
				self.locations()[i].visible = false;
			}*/
		}
	}
}

// Bind
ko.applyBindings(new MyViewModel());

// Add Google Map
initMap();

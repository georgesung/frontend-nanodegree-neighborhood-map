// Class to represent location (point-of-interest)
function Location(label, latLng, visible) {
	var self = this;
	self.label = ko.observable(label);
	self.latLng = ko.observable(latLng);
	self.visible = ko.observable(visible);
}

// Overall viewmodel for this screen, along with initial state
function MyViewModel() {
	var self = this;

	// Data
	self.locations = ko.observableArray([
		new Location("Boston Common", {lat: 42.355137, lng: -71.065604}, true),
		new Location("MIT", {lat: 42.360139, lng: -71.094192}, true),
		new Location("TD Garden", {lat: 42.366190, lng: -71.062114}, true)
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
		}
	}
}

// Bind
ko.applyBindings(new MyViewModel());

// Initialize Google Map
var map = new google.maps.Map(document.getElementById('map'), {
	center: {lat: 42.36, lng: -71.08},
	scrollwheel: false,
	zoom: 14
});

// Initialize map markers
var vm = ko.dataFor(document.body);
for (var i = 0; i < vm.locations().length; i++) {
	var latLng = vm.locations()[i].latLng();
	var label = vm.locations()[i].label();

	// Create marker
	var marker = new google.maps.Marker({
		map: map,
		position: latLng,
		title: label
	});
}
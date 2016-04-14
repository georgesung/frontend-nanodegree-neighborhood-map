//(function() {

/////////////////////////////////////
// Knockout JS code
/////////////////////////////////////

// Class to represent location (point-of-interest)
function Location(label, id, latLng, visible) {
	var self = this;
	self.label = ko.observable(label);
	self.id = ko.observable(id);  // setting id as observable may be overkill
	self.latLng = ko.observable(latLng);
	self.visible = ko.observable(visible);
}

// Knockout: Overall viewmodel for this screen, along with initial state
function MyViewModel() {
	var self = this;

	// Data
	self.locations = ko.observableArray([
		new Location("Boston Common", "boston-common", {lat: 42.355137, lng: -71.065604}, true),
		new Location("MIT", "mit", {lat: 42.360139, lng: -71.094192}, true),
		new Location("TD Garden", "td-garden", {lat: 42.366190, lng: -71.062114}, true)
	]);

	// Filter function
	self.filter = function() {
		var filterSubstr = $("#filter-input").val();

		// Loop through all locations, find locations that match filter substring
		for (var i = 0; i < self.locations().length; i++) {
			var label = self.locations()[i].label();

			// If form input matches filter, location is visible. Else, invisible.
			self.locations()[i].visible( (label.indexOf(filterSubstr) > -1) ? true : false );
		}
	}

	// On-click listener for list item, to bounce corresponding marker
	self.listClick = function(location) {
		var label = location.label();

		// Loop through all markers to find corresponding marker
		for (var i = 0; i < markers.length; i++) {
			if (markers[i].title == label) {
				markers[i].setAnimation(4);
			}
		}
	}
}

// Knockout bind
ko.applyBindings(new MyViewModel());

/////////////////////////////////////
// Non-Knockout JS code
/////////////////////////////////////

// "Global" variables
var vm = ko.dataFor(document.body);
var markers = [];

// Function to remove marker for Google Maps
function removeMarker() {
	var filterSubstr = $("#filter-input").val();

	// Loop through all markers
	for (var i = 0; i < markers.length; i++) {
		var label = markers[i].title;

		// If filter sub-string matches, then add marker. Else, remove marker.
		if (label.indexOf(filterSubstr) > -1) {
			markers[i].setMap(map);
		}
		else {
			markers[i].setMap(null);
		}
	}
}

// Function to bounce the Google Maps marker
function bounceMarker() {
	this.setAnimation(4);  // setAnimation(4) bounces the marker for a short time
}

// Initialize Google Map
var map = new google.maps.Map(document.getElementById('map'), {
	center: {lat: 42.36, lng: -71.08},
	scrollwheel: false,
	zoom: 14
});

// Initialize map markers
for (var i = 0; i < vm.locations().length; i++) {
	var latLng = vm.locations()[i].latLng();
	var label = vm.locations()[i].label();

	// Create marker
	var marker = new google.maps.Marker({
		map: map,
		position: latLng,
		title: label
	});

	// Animate marker when marker is selected
	marker.addListener('click', bounceMarker);

	markers.push(marker);
}

// Bind removeMarker() to click event of filter button & pressing enter on input form
$("#filter-btn").click(removeMarker);
$("#filter-input").keypress(function(event) {
    if (event.which == 13) {
        //event.preventDefault();  // prevent default is handled by Knockout
        removeMarker();
    }
});

//})();
//(function() {

// FIXME: Confirm if id attribute is needed at all for the locations. Remove id stuff if not.

/////////////////////////////////////
// Knockout JS code
/////////////////////////////////////

// Class to represent location (point-of-interest)
function Location(label, id, latLng, wikiTitle, visible) {
	var self = this;
	self.label = ko.observable(label);
	self.id = ko.observable(id);  // setting id as observable may be overkill
	self.latLng = ko.observable(latLng);
	self.wikiTitle = ko.observable(wikiTitle)
	self.visible = ko.observable(visible);
}

// Knockout: Overall viewmodel for this screen, along with initial state
function MyViewModel() {
	var self = this;

	// Model (data)
	self.locations = ko.observableArray([
		new Location(
			"Boston Common",
			"boston-common",
			{lat: 42.355137, lng: -71.065604},
			"Boston_Common",
			true),
		new Location(
			"MIT",
			"mit",
			{lat: 42.360139, lng: -71.094192},
			"Massachusetts_Institute_of_Technology",
			true),
		new Location(
			"TD Garden",
			"td-garden",
			{lat: 42.366190, lng: -71.062114},
			"TD_Garden",
			true)
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
function onClickMarker() {
	var self = this;

	// Bounce the marker
	self.setAnimation(4);  // setAnimation(4) bounces the marker for a short time

	// Pop-up info window with Wikipedia summary of the location of interest
	// Wikipedia summary text obtained through AJAX request using Wikipedia API
	console.log(self.locationObject);

	$.getJSON("https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=Lu_Yen-hsun", function(data) {
		var pages = data.query.pages;

		// pages is an object (hash) with only 1 key, so get that 1 key
		for (var firstKey in pages) break;

		// extract will be the first intro paragraph in the Wikipedia entry
		var extract = pages[firstKey].extract;

		// Display extract on info window on top of corresponding marker
		infoWindow.setContent("<h3>blah blah</h3>" + extract);
		infoWindow.open(map, self);
	});

}

// Initialize info window
var infoWindow = new google.maps.InfoWindow({
	content: "placeholder"
});

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
		title: label,
		locationObject: vm.locations()[i]
	});

	// Animate marker when marker is selected
	marker.addListener('click', onClickMarker);

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
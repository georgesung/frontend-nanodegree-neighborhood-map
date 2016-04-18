/*
* Main javascript file for the web app.
* Separated into 2 sections:
* (1) Knockout JS code
* (2) JQuery and Google Maps API code
*/

'use strict';

/////////////////////////////////////
// Knockout JS code
/////////////////////////////////////

// Class to represent location (point-of-interest)
function Location(label, latLng, wikiTitle, visible) {
	var self = this;
	self.label = ko.observable(label);
	self.latLng = ko.observable(latLng);
	self.wikiTitle = ko.observable(wikiTitle);
	self.visible = ko.observable(visible);

	// Google Maps marker object reference will be determined after Location construction
	self.markerObject = null;
}

// Knockout: Overall viewmodel for this screen, along with initial state
function MyViewModel() {
	var self = this;

	// Model (data)
	self.locations = ko.observableArray([
		new Location(
			"Boston Common",
			{lat: 42.355137, lng: -71.065604},
			"Boston_Common",
			true),
		new Location(
			"MIT",
			{lat: 42.360139, lng: -71.094192},
			"Massachusetts_Institute_of_Technology",
			true),
		new Location(
			"TD Garden",
			{lat: 42.366190, lng: -71.062114},
			"TD_Garden",
			true),
		new Location(
			"Fenway Park",
			{lat: 42.346795, lng: -71.097229},
			"Fenway_Park",
			true),
		new Location(
			"Harvard University",
			{lat: 42.377003, lng: -71.116628},
			"Harvard_University",
			true)
	]);

	self.filterSubstr = ko.observable("");

	// Filter function: Make items in the list invisible/visible, depending on filter string
	self.filter = function() {
		var filterSubstr = self.filterSubstr();

		// Loop through all locations, find locations that match filter substring
		for (var i = 0; i < self.locations().length; i++) {
			var label = self.locations()[i].label();

			// If form input matches filter, location is visible. Else, invisible.
			self.locations()[i].visible( (label.indexOf(filterSubstr) > -1) ? true : false );
		}

		removeMarker();
	};

	// Also perform filter function when user presses Enter in the input field
	self.onEnterFilter = function(d, e) {
		if (e.keyCode == 13) {
			self.filter();
		}
	};

	// On-click listener for list item, to bounce corresponding marker and pop up info window
	self.listClick = function(location) {
		// Loop through all markers to find corresponding marker
		for (var i = 0; i < markers.length; i++) {
			if (markers[i].locationObject == location) {
				// Bounce the marker
				markers[i].setAnimation(4);

				// Pop up info window
				popUpInfoWindow(location);
			}
		}
	};
}

// Knockout bind
ko.applyBindings(new MyViewModel());

/////////////////////////////////////
// Non-Knockout JS code
/////////////////////////////////////

// "Global" variables
var vm = ko.dataFor(document.body);
var markers = [];
var infoWindow = null;
var map = null;

// Function to remove marker for Google Maps based in filter string
function removeMarker() {
	var filterSubstr = $("#filter-input").val();

	// Loop through all markers
	for (var i = 0; i < markers.length; i++) {
		var label = markers[i].locationObject.label();

		// If filter sub-string matches, then add marker. Else, remove marker.
		if (label.indexOf(filterSubstr) > -1) {
			markers[i].setVisible(true);
		}
		else {
			markers[i].setVisible(false);
		}
	}
}

// Function to pop up info window with Wikipedia summary of the location of interest
// Wikipedia summary text obtained through AJAX request using Wikipedia API
function popUpInfoWindow(locationObject) {
	var title = locationObject.label();
	var wikiTitle = locationObject.wikiTitle();

	infoWindow.close();

	// Timeout function to handle errors
	var wikiRequestTimeout = setTimeout(function() {
		// Display error message in info window on top of corresponding marker
		infoWindow.setContent("<p><b>Error:</b> Could not load Wikipedia excerpt</p>");
		infoWindow.open(map, locationObject.markerObject);
	}, 5000);

	// AJAX request to Wikipedia
	$.ajax({
		dataType: "jsonp",
		url: "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=" + wikiTitle,
		success: function(data) {
			var pages = data.query.pages;

			// pages is an object (hash) with only 1 key, so get that 1 key
			for (var firstKey in pages) {break;}

			// extract will be the first intro paragraph in the Wikipedia entry
			var extract = pages[firstKey].extract;

			// Display extract in info window on top of corresponding marker
			infoWindow.setContent("<h3>" + title + "</h3>" +
				"<p><small>Wikipedia excerpt below obtained via Wikipedia API (https://www.mediawiki.org/wiki/API:Main_page)</small></p>" +
				extract);
			infoWindow.open(map, locationObject.markerObject);

			clearTimeout(wikiRequestTimeout);
		}
	});
}

// Function to handle clicks on Google Maps marker
function onClickMarker() {
	var self = this;

	// Bounce the marker
	self.setAnimation(4);  // setAnimation(4) bounces the marker for a short time

	// Pop up info window
	popUpInfoWindow(self.locationObject);
}

// Google Maps API callback function to initialize map
function initMap() {
	// Initialize info window
	infoWindow = new google.maps.InfoWindow({
		content: "placeholder"
	});

	// Initialize Google Map
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 42.360139, lng: -71.094192},
		scrollwheel: false,
		zoom: 13
	});

	// Initialize map markers
	for (var i = 0; i < vm.locations().length; i++) {
		var locationObject = vm.locations()[i];

		// Create marker
		var marker = new google.maps.Marker({
			map: map,
			position: locationObject.latLng(),
			locationObject: locationObject
		});

		// Update locationObject's marker pointer/reference
		locationObject.markerObject = marker;

		// Animate marker when marker is selected
		marker.addListener('click', onClickMarker);

		// Add marker to global marker array
		markers.push(marker);
	}
}

// Error function to handle Google Maps API error
function errorMap() {
	alert("Error: Google Maps failed to load");
}

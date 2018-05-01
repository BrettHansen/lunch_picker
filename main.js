var content_container = $("#content");
var suggest_box = $("#suggest-box");
var login_modal = $("#login-modal");
var handle_input = $("#handle-input");
var handle_submit = $("#handle-submit");
var socket = io();
var restaurants;
var bounds = new google.maps.LatLngBounds(
  new google.maps.LatLng(47.602606, -122.217306),
  new google.maps.LatLng(47.623310, -122.189199));


function initialize() {
	var searchBoxInput = suggest_box[0];
	var searchBox = new google.maps.places.SearchBox(searchBoxInput, {
	  bounds: bounds
	});

	searchBox.addListener("places_changed", function() {
		var places = searchBox.getPlaces();

		if (places.length == 0) {
			return;
		}

		socket.emit("suggestion", places[0]);
		suggest_box.val("");
	});

	handle_submit.click(function() {
		socket.on("update", function(places_data, vote) {
			updateUI(places_data, vote);
		});
		socket.emit("establish", handle_input.val(), function(success) {
			if(success) {
				login_modal.modal("hide");
			} else {
				handle_input.val("");
			}
		});

	});

	login_modal.modal("show");
}

function updateUI(places_data, vote) {
	restaurants = places_data;

	var row = $("<div>", { "class" : "row" });

	for(var place_id in restaurants) {
		var place = restaurants[place_id];
		var container = $("<div>", { "id" : place.place_id, "class" : "vote-card col-md-3" });
		var title = $("<h3>").text(place.name);
		var votes = $("<h3>").text(place.votes);

		if(vote == place.place_id) {
			container.addClass("selected");
		}

		container.append(title).append(votes);
		row.append(container);

		container.click(function() {
			socket.emit("vote", $(this).attr("id"));
		});
	}

	content_container.empty();
	content_container.append(row);
}

$(initialize);
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
	var searchOptions = {
		bounds: bounds,
		strictBounds: true,
		types: ["establishment"]
	}
	var autocomplete = new google.maps.places.Autocomplete(searchBoxInput, searchOptions);

	autocomplete.addListener("place_changed", function() {
		var place = autocomplete.getPlace();

		socket.emit("suggestion", place);
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
	console.log(places_data);

	var place_ids = Object.keys(restaurants);

	place_ids.sort(function(a, b) {
		return restaurants[b].votes - restaurants[a].votes;
	});

	var row = $("<div>", { "class" : "row" });
	for(var i = 0; i < place_ids.length; i++) {
		var place = restaurants[place_ids[i]];
		var container = $("<div>", { "id" : place.place_id, "class" : "vote-card col-lg-3" });
		var header = $("<div>");
		var title = $("<h3>", { "class" : "place-title" }).text(place.name);
		var votes = $("<h3>").text(place.votes);
		var link = $("<a>", { "target" : "_blank", "href" : place.meta.url });
		var link_icon = $("<span>", { "class" : "link-icon fa fa-external-link" });
		var button_toolbar = $("<div>", { "class" : "btn-toolbar float-right" });
		var vote_button = $("<button>", { "class" : "btn btn-primary" }).text("Vote");

		if(vote == place.place_id) {
			container.addClass("selected");
		}

		link.append(link_icon);
		button_toolbar.append(vote_button);
		header.append(title).append(link);
		container.append(header).append(button_toolbar).append(votes);
		row.append(container);

		vote_button.click(function() {
			socket.emit("vote", $(this).parent().parent().attr("id"));
		});
	}

	content_container.empty();
	content_container.append(row);
}

$(initialize);
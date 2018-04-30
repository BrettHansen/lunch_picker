var content_container = $("#content");
var suggest_box = $("#suggest-box");
var suggest_button = $("#suggest-button");
var socket = io();
var restaurants;

function initialize() {
	socket.on("update", function(data) {
		updateUI(data);
	});
	socket.emit("establish");

	suggest_button.click(function() {
		var name = suggest_box.val();
		socket.emit("suggestion", name);
		suggest_box.val("");
	});
}

function updateUI(data) {
	restaurants = data;

	var row = $("<div>", { "class" : "row" });

	for(var i = 0; i < restaurants.length; i++) {
		var item = restaurants[i];
		var container = $("<div>", { "id" : item.id, "class" : "vote-card col-md-3" });
		var title = $("<h3>").text(item.title);
		var votes = $("<h3>").text(item.votes);

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
var content_container = $("#content");
var suggest_box = $("#suggest-box");
var suggest_button = $("#suggest-button");
var login_modal = $("#login-modal");
var handle_input = $("#handle-input");
var handle_submit = $("#handle-submit");
var socket = io();
var restaurants;

function initialize() {
	handle_submit.click(function() {
		socket.on("update", function(data, vote) {
			updateUI(data, vote);
		});
		socket.emit("establish", handle_input.val(), function(success) {
			if(success) {
				suggest_button.click(function() {
					var name = suggest_box.val();
					socket.emit("suggestion", name);
					suggest_box.val("");
				});

				login_modal.modal("hide");
			} else {
				handle_input.val("");
			}
		});

	});

	login_modal.modal("show");
}

function updateUI(data, vote) {
	restaurants = data;

	var row = $("<div>", { "class" : "row" });

	for(var i = 0; i < restaurants.length; i++) {
		var item = restaurants[i];
		var container = $("<div>", { "id" : item.place_id, "class" : "vote-card col-md-3" });
		var title = $("<h3>").text(item.title);
		var votes = $("<h3>").text(item.votes);

		if(vote == item.place_id) {
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
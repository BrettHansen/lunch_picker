var http = require("http").createServer(handler);
var url = require("url");
var path = require("path");
var fs = require("fs");
var mime = require("mime");
var io = require("socket.io")(http);
var port = 10083;
var whitelist = require("./whitelist.json");

var active = {};
var voters = {};

var data = [];

http.listen(port);

io.on("connection", function(socket) {
  socket.on("establish", function(handle, callback) {
    if(whitelist.indexOf(handle) > -1) {
      if(is_user_active(handle)) {
        callback(false);
        console.log(handle + " rejected; already connected!");
      } else {
        callback(true);
        activate_user(handle, socket.id);
        console.log(handle + " established connection");
        updateClients();
      }
    } else {
        callback(false);
        console.log(handle + " rejected; not in whitelist!");      
    }
  });

  socket.on("suggestion", function(name) {
    data.push({ "title" : name, "votes" : 0 });
    console.log(active[socket.id] + " suggested " + name);
    updateClients();
  });

  socket.on("vote", function(place_id) {
    register_user_vote(socket.id, place_id);
    console.log(active[socket.id] + " voted for " + place_id);
    updateClients();
  });

  socket.on("disconnect", function() {
    console.log(active[socket.id] + " disconnected");
    deactivate_user(socket.id);
  });
});

function activate_user(handle, socket_id) {
  active[socket_id] = handle;
}

function deactivate_user(socket_id) {
  delete active[socket_id];
}

function is_user_active(handle) {
  for(var socket_id in active)
    if(active[socket_id] == handle)
      return true;
  
  return false;
}

function register_user_vote(socket_id, place_id) {
  if(!(socket_id in active))
    return;

  var handle = active[socket_id];
  var decrement_place = "";
  if(handle in voters)
    decrement_place = voters[handle];

  var increment_place = place_id;

  for(var i = 0; i < data.length; i++) {
    if(increment_place == data[i].place_id) {
      data[i].votes++;
    }
    if(decrement_place == data[i].place_id) {
      data[i].votes--;
    }
  }

  voters[handle] = place_id;
}

function updateClients() {
  for(var i = 0; i < data.length; i++)
    if(!("place_id" in data[i]))
      data[i]["place_id"] = "element-" + i;

  for(var socket_id in active) {
    var handle = active[socket_id];
    io.to(socket_id).emit("update", data, voters[handle]);
  }
}


function handler(request, response) {
  var uri = url.parse(request.url).pathname;
  var filename = path.join(process.cwd(), uri);

  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += "/index.html";

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      response.writeHead(200, {"Content-Type" : mime.getType(filename)});
      response.write(file, "binary");
      response.end();
    });
  });
}
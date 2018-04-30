var http = require("http").createServer(handler);
var url = require("url");
var path = require("path");
var fs = require("fs");
var mime = require("mime");
var io = require("socket.io")(http);
var port = 10083;

var data = [
  {
    "title" : "Cherry Street Cafe",
    "votes" : 0
  },
  {
    "title" : "Espresso Vivace",
    "votes" : 0
  },
  {
    "title" : "Victrola",
    "votes" : 0
  },
  {
    "title" : "Le Caviste",
    "votes" : 0
  }
];

http.listen(port);

io.on("connection", function(socket) {
  socket.on("establish", function() {
    updateClients();
  });

  socket.on("suggestion", function(name) {
    data.push({ "title" : name, "votes" : 0 });
    updateClients();
  });

  socket.on("vote", function(id) {
    for(var i = 0; i < data.length; i++) {
     if(id == data[i].id) {
      data[i].votes++;
      updateClients();
      break;
     } 
    }
  });
});

function updateClients() {
  for(var i = 0; i < data.length; i++)
    data[i]["id"] = "element-" + i;

  io.emit("update", data);
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
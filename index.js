var staticServer = require('node-static');

var server = new staticServer.Server('./dist');
var path = require('path');
const PORT = process.env.PORT || 5000;
console.log(`Listening to port ${PORT}`);
require('http').createServer(function(req, resp) {
  req.addListener('end', function() {
    server.serve(req, resp);
  }).resume();
}).listen(PORT);

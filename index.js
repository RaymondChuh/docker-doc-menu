var staticServer = require('node-static');

var server = new staticServer.Server('./');
var path = require('path');
console.log(path.resolve('./'));
console.log(__dirname);
require('http').createServer(function(req, resp) {
  req.addListener('end', function() {
    server.serve(req, resp);

  })
}).listen(process.env.PORT || 5000);

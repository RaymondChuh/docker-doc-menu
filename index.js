var staticServer = require('node-static');

var server = new static.Server('./');

require('http').createServer(function(req, resp) {
  request.addListener('end', function() {
    server.serve(req, resp);
  })
}).listen(80);

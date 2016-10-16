var staticServer = require('node-static');

var server = new staticServer.Server('./');

require('http').createServer(function(req, resp) {
  request.addListener('end', function() {
    server.serve(req, resp);
  })
}).listen(process.env.PORT || 5000);

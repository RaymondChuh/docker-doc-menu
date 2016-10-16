var page = require('webpage').create();
var fs = require('fs');
var config = null;

if (fs.exists('package.json')) {
  var config = fs.read('package.json');
  config = JSON.parse(config);
}

const DOCKER_DOC_URL = config
  ? "https://" + config.docker_doc_menu.docker_host
  :'https://docs.docker.com';
const HOME_PAGE_NAME = config
  ? config.docker_doc_menu.home_page_name
  :'docker-doc-home.html';

page.onError = function (msg, trace) {
    console.log(msg);
    trace.forEach(function(item) {
        console.log('  ', item.file, ':', item.line);
    });
};
// page.onResourceRequested = function (request) {
//     console.log('Request ' + JSON.stringify(request, undefined, 4));
// };

if (fs.exists(HOME_PAGE_NAME)) {
  fs.remove(HOME_PAGE_NAME);
}

page.open(DOCKER_DOC_URL, function(status) {
  console.log('Page load status:' + status);
  if (status === 'success') {
    var content = page.content;
    fs.write(HOME_PAGE_NAME, content, 'w');
    phantom.exit();
  } else {
    console.error('Page open failed');
    phantom.exit();
  }
});

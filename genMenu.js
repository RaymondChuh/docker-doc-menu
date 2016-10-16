// var exec = require('child_process').exec;
var execFile = require('child_process').execFile;
var phantomjs = require('phantomjs');
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');
const pug = require('pug');
const config = require('./package.json');

const HOME_PAGE_NAME = config
  ? config.docker_doc_menu.home_page_name
  : 'docker-doc-home.html';
const MENU_TEMPLATE = config
  ? config.docker_doc_menu.menu_template
  : 'docker-menu.pug';
const MENU_FILE = config
  ? config.docker_doc_menu.menu_file
  : 'docker-menu.html';
const DOCKER_DOC_URL = config
  ? 'https://' + config.docker_doc_menu.docker_host
  : 'https://docs.docker.com';

const binPath = phantomjs.path
const childArgs = [
  '--debug=true',
  path.join(__dirname, 'getMenu.js')
];
const compileFn = pug.compileFile(MENU_TEMPLATE, {pretty: true});

console.log(`check if ${HOME_PAGE_NAME} exists: ${fs.existsSync(HOME_PAGE_NAME)}`);
console.log(`check if ${MENU_FILE} exists: ${fs.existsSync(MENU_FILE)}`);

if (fs.existsSync(MENU_FILE)) {
  fs.unlinkSync(MENU_FILE);
}

function parseMenu(menuRoot) {
    let menu = {},
        children = menuRoot.children(),
        index = 0;

    menu = Array.prototype.slice.apply(menuRoot.children())
      .reduce(function(map, menuItem){
        /*
          children() return array-like object.
        */
        let item = parseMenuItem(menuRoot.children().eq(index));
        map[item.key] = item;
        index++;
        return map;
      }, menu);
    return menu;
}

function parseMenuItem(menuItem) {
    let link = menuItem.children('a');
    let subMenu = menuItem.children('ul');
    let item = {};

    if (link.length === 1 && subMenu.length === 1) {
      item.key = link.text().replace(/\s/g, '-');
      item.content = parseMenu(subMenu);
      item.url = DOCKER_DOC_URL + link.attr('href');
    } else if (link.length === 1 && subMenu.length === 0){
      item.key = link.text().replace(/\s/g, '-');
      item.content = link.text();
      item.url = DOCKER_DOC_URL + link.attr('href');
    } else {
      item.key = '';
      item.content = '';
      item.url = '#';
    }
    return item;
}

var getMenuProc = execFile(binPath, childArgs);
getMenuProc.stderr.on('data', function (data) {
  console.log('stderr: ' + data.toString());
});
getMenuProc.on('exit', function (code, signal) {
  console.log(`Exit code: ${code}`);
  console.log(`Exit signal: ${signal}`);
  if (code !== 0) {
    throw new Error('getMenuProc failed.');
  }
  if (fs.existsSync(HOME_PAGE_NAME)) {
    let content = fs.readFileSync(HOME_PAGE_NAME);
    console.log(`Content loaded ${content ? content.length : 0}`);
    let $ = cheerio.load(content);
    let menuRoot = $('.docsidebarnav_section')
      .children().first()
      .children().first();
    let menu = parseMenu(menuRoot);
    let locals = {
      menu: menu
    }
    let menuContent = compileFn(locals);
    fs.writeFileSync(MENU_FILE, menuContent);
  } else {
    console.error(`Can't find file ${HOME_PAGE_NAME}`);
  }
});

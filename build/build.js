
var path = require('path');
var utils = require('./misc/utils');


var targetFile = '../build.test/index.html';

var flowData = {
  buildFile: targetFile,
  baseURI: path.dirname(path.resolve(targetFile)),
  buildDir: path.resolve(targetFile, 'build')
};

var flow = [
  require('./misc/console'),
  require('./misc/options'),
  require('./misc/files'),

  require('./js/init'),
  require('./css/init'),

  require('./html/parse'),
  require('./html/fetchFiles'),

  //require('./js/realignHtml'),
  require('./js/parse'),

  require('./tmpl/parse'),

  require('./css/prepareOutput'),
  require('./css/parse'),

  require('./html/assembly')
];

flow.forEach(function(handler){
  var title = handler.handlerName;

  if (title)
    console.log('\n' + title + '\n' + ('='.repeat(title.length)) + '\n');

  handler(flowData);
});

/*var map = {};
flowData.files.queue.forEach(function(file){
  if (!map[file.type])
    map[file.type] = [];

  map[file.type].push(file.filename);
})

console.log(map);*/
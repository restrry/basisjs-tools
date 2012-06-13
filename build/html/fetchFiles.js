
var path = require('path');

module.exports = function(flowData){
  var files = flowData.files;
  var owner = flowData.buildFile;
  var baseURI = flowData.baseURI;
  var processPoint = [];

  walkHtml(flowData.htmlTokens, flowData);

  flowData.htmlProcessPoint = processPoint;


  //
  // main part
  //

  function getText(node){
    return (node.children && node.children[0] && node.children[0].data) || '';
  }

  function getAttrs(node){
    return node.attribs || {};
  }

  function walkHtml(nodes){

    for (var i = 0, node; node = nodes[i]; i++)
    {
      var file = null;

      switch (node.type)
      {
        case 'script':
          var attrs = getAttrs(node);

          // ignore script with type other than text/javscript
          if (attrs.type && attrs.type != 'text/javascript')
            return;

          // external script
          if (attrs.src)
          {
            var filename = path.resolve(baseURI, attrs.src);
            var fileBaseURI = path.dirname(filename);

            if(attrs['basis-config'])
              flowData.js.base.basis = fileBaseURI;

            console.log('[JS] ' + filename);
            file = {
              source: 'html:script',
              type: 'script',
              filename: filename,
              baseURI: fileBaseURI
            };
          }
          else
          {
            console.log('[JS] inline');
            file = {
              source: 'html:script',
              type: 'script',
              inline: true,
              baseURI: baseURI,
              content: getText(node)
            };
          }

          break;

        case 'tag':
          var attrs = getAttrs(node);
          if (node.name == 'link' && attrs.rel == 'stylesheet')
          {
            var filename = path.resolve(baseURI, attrs.href);

            console.log('[CSS] ' + filename);
            file = {
              source: 'html:link',
              type: 'style',
              filename: filename,
              baseURI: path.dirname(filename),
              owner: filename,
              media: attrs.media || 'all'
            };
          }

          break;

        case 'style':
          console.log('[CSS] inline');
          file = {
            source: 'html:style',
            type: 'style',
            baseURI: baseURI,
            owner: '__inline__',
            inline: true,
            media: attrs.media || 'all',
            content: getText(node)
          };

          break;
      }

      if (file)
      {
        files.add(file);

        processPoint.push({
          node: node,
          file: file
        });
      }

      if (node.children)
        walkHtml(node.children);
    }
  }
}

module.exports.handlerName = 'Walk through html tokens and collect files';



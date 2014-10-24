var tmplAt = require('../../ast').tmpl;
var path = require('path');

module.exports = function(flow){

  if (!flow.l10n.module)
  {
    flow.console.log('Skiped.');
    flow.console.log('basis.l10n not found');
    return;
  }

  var fconsole = flow.console;
  var queue = flow.files.queue;

  var cultureList = flow.l10n.cultureList;
  var defList = flow.l10n.defList;
  var getTokenList = flow.l10n.getTokenList;

  var dictionaries = {};
  var nameFile = {};
  var l10nKeys = {};

  // Todo: remove

  basis.require('basis.l10n');

  //
  // Collect template l10n pathes
  //
  var l10nPrefix = /^l10n:/;
  var tmplRefs = [];

  fconsole.start('# Collect keys in templates (v2)');
  flow.files.queue.forEach(function(file){
    if (file.type == 'template')
    {
      fconsole.start(file.relpath);

      tmplAt.walk(file.ast, {
        text: function(token){
          var bindName = token[1];
          if (l10nPrefix.test(bindName))
          {
            var l10nTokenRef = bindName.substr(5);
            var l10nToken = flow.l10n.getToken(l10nTokenRef);
            var name = l10nToken.name;
            var dictionary = l10nToken.dictionary;

            fconsole.log(name + ' @ ' + dictionary.file.relpath);

            var tmplRef = {
              file: this.file,
              name: name,
              dictionary: dictionary,
              key: l10nTokenRef,
              host: token,
              idx: 1
            };

            dictionary.file.jsRefCount++;
            dictionary.addRef(this.file);
            this.file.link(dictionary.file);
            l10nToken.addRef(this.file, tmplRef);

            tmplRefs.push(tmplRef);
          }
        },
        attr: function(token){
          var attrName = this.tokenName(token);
          if (token[1] && token[0] == 2 && attrName != 'class' && attrName != 'style')
            for (var i = 0, bindings = token[1][0], bindName; bindName = bindings[i]; i++)
              if (l10nPrefix.test(bindName))
              {
                var l10nTokenRef = bindName.substr(5);
                var l10nToken = flow.l10n.getToken(l10nTokenRef);
                var name = l10nToken.name;
                var dictionary = l10nToken.dictionary;

                fconsole.log(name + ' @ ' + dictionary.file.relpath);

                var tmplRef = {
                  file: this.file,
                  name: name,
                  dictionary: dictionary,
                  key: l10nTokenRef,
                  host: bindings,
                  idx: i
                };

                dictionary.file.jsRefCount++;
                dictionary.addRef(this.file);
                this.file.link(dictionary.file);
                l10nToken.addRef(this.file, tmplRef);

                tmplRefs.push(tmplRef);
              }
        }
      }, { file: file });

      fconsole.endl();
    }
  });
  fconsole.endl();

  // extend l10n
  flow.l10n.tmplRefs = tmplRefs;
};
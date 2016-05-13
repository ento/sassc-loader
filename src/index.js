var fs = require('fs');
var childProcess = require('child_process');
var loaderUtils = require('loader-utils');
var async = require('async');

module.exports = function(content) {
  this.cacheable();

  if (!this.resource.match(/\.s(c|a)ss$/)) {
    return content;
  }

  var callback = this.async();
  var addDependency = this.addDependency.bind(this);
  var query = loaderUtils.parseQuery(this.query);

  /* defaults */
  var options = {
    compilerBin: query.compilerBin ? query.compilerBin : 'sassc',
    useCompass: query.useCompass ? '--compass' : '',
    workDir: query.workDir ? query.workDir : null,
    outputStyle: query.outputStyle ? '-t ' + query.outputStyle : '-t expanded',
    includePaths: query.includePaths ? query.includePaths : [],
    extraArgs: query.extraArgs ? query.extraArgs : '',
    skipComment: '-M',
    outputPath: null,
    outputMapPath: null,
    webpackContext: null
  }

  options.inputSource = this.resource;
  options.outputPath = path.join(options.workDir, 'output.scss')
  options.outputMapPath = path.join(options.workDir, 'output.scss.map')

  sassCmdBin = options.compilerBin

  sassCmdOpts = {
    cwd: options.webpackContext
  }

  sassCmdArgs = [
    options.useCompass,
    options.outputStyle,
    options.extraArgs,
    options.inputSource,
    options.outputPath
  ]

  childProcess.execFile(sassCmd, sassCmdArgs, sassCmdOpts, function(err, stdout, stderr) {
    if (err) {
      callback(err);
    } else {
      fs.readFile(options.outputPath, 'utf8', function(err, outputCss) {
        if (err) {
          callback(err);
        } else {
          fs.readFile(options.outputMapPath, 'utf8', function(err, outputMapCss) {
            if (err) {
              callback(err);
            } else {
              depSources = JSON.parse(mapData).sources

              JSON.parse(mapData).sources.map(addDependency);
            }
          });
        }
      });
    }
  });
}

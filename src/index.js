var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var loaderUtils = require('loader-utils');
var temp = require("temp").track();
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
    useCompass: query.useCompass ? '--compass' : null,
    workDir: query.workDir ? query.workDir : null,
    outputStyle: query.outputStyle ? query.outputStyle : 'expanded',
    includePaths: query.includePaths ? query.includePaths : [],
    extraArgs: query.extraArgs ? query.extraArgs : null,
    skipComment: '-M',
    inputPath: this.resourcePath,
    outputPath: null,
    outputMapPath: null,
    webpackContext: this.context
  }

  temp.mkdir('sassc-loader', function(err, dirPath) {
    if (err) {
      callback(err);
      return;
    }
    options.outputPath = path.join(dirPath, 'output.scss')
    options.outputMapPath = path.join(dirPath, 'output.scss.map')

    var sassCmdBin = options.compilerBin

    var sassCmdOpts = {
      cwd: options.webpackContext
    }

    var sassCmdArgs = [
      '-t',
      options.outputStyle,
      '-m',
      options.skipComment
    ];

    if (options.useCompass) {
      sassCmdArgs.push(options.useCompass);
    }

    if (options.extraArgs) {
      sassCmdArgs.push(options.extraArgs);
    }

    options.includePaths.forEach(function(includePath) {
      sassCmdArgs.push('-I');
      sassCmdArgs.push(includePath);
    });

    sassCmdArgs.push(options.inputPath);
    sassCmdArgs.push(options.outputPath);

    childProcess.execFile(sassCmdBin, sassCmdArgs, sassCmdOpts, function(err, stdout, stderr) {
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
                var depSources = JSON.parse(outputMapCss).sources
                depSources.map(addDependency);
                callback(null, outputCss, outputMapCss);
              }
            });
          }
        });
      }
    });
  });
}

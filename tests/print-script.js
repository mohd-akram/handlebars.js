/* eslint-disable no-console, no-var */
// Util script for debugging source code generation issues

var script = process.argv[2].replace(/\\n/g, '\n'),
  verbose = process.argv[3] === '-v';

var Handlebars = require('..'),
  SourceMap = require('source-map'),
  SourceMapConsumer = SourceMap.SourceMapConsumer;

var template = Handlebars.precompile(script, {
  srcName: 'input.hbs',
  destName: 'output.js',

  assumeObjects: true,
  compat: false,
  strict: true,
  trackIds: true,
  knownHelpersOnly: false,
});

if (!verbose) {
  console.log(template);
} else {
  var consumer = new SourceMapConsumer(template.map),
    lines = template.code.split('\n'),
    srcLines = script.split('\n');

  console.log();
  console.log('Source:');
  srcLines.forEach(function (source, index) {
    console.log(index + 1, source);
  });
  console.log();
  console.log('Generated:');
  console.log(template.code);
  lines.forEach(function (source, index) {
    console.log(index + 1, source);
  });
  console.log();
  console.log('Map:');
  console.log(template.map);
  console.log();

  // eslint-disable-next-line no-inner-declarations
  function collectSource(lines, lineName, colName, order) {
    var ret = {},
      ordered = [],
      last;

    function collect(current) {
      if (last) {
        var mapLines = lines.slice(
          last[lineName] - 1,
          current && current[lineName]
        );
        if (mapLines.length) {
          if (current) {
            mapLines[mapLines.length - 1] = mapLines[mapLines.length - 1].slice(
              0,
              current[colName]
            );
          }
          mapLines[0] = mapLines[0].slice(last[colName]);
        }
        ret[last[lineName] + ':' + last[colName]] = mapLines.join('\n');
        ordered.push({
          startLine: last[lineName],
          startCol: last[colName],
          endLine: current && current[lineName],
        });
      }
      last = current;
    }

    consumer.eachMapping(collect, undefined, order);
    collect();

    return ret;
  }

  srcLines = collectSource(
    srcLines,
    'originalLine',
    'originalColumn',
    SourceMapConsumer.ORIGINAL_ORDER
  );
  lines = collectSource(lines, 'generatedLine', 'generatedColumn');

  consumer.eachMapping(function (mapping) {
    var originalSrc =
        srcLines[mapping.originalLine + ':' + mapping.originalColumn],
      generatedSrc =
        lines[mapping.generatedLine + ':' + mapping.generatedColumn];

    if (!mapping.originalLine) {
      console.log(
        'generated',
        mapping.generatedLine + ':' + mapping.generatedColumn,
        generatedSrc
      );
    } else {
      console.log(
        'map',
        mapping.source,
        mapping.originalLine + ':' + mapping.originalColumn,
        originalSrc,
        '->',
        mapping.generatedLine + ':' + mapping.generatedColumn,
        generatedSrc
      );
    }
  });
}

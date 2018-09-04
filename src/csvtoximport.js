var sprintf = require('sprintf-js').sprintf;
var moment = require('moment');

var ximportFormat = '%05u%2.2s%8.8s%8.8s%12.12s%-11.11s%-25.25s%013.2f%1.1s%12.12s%6.6s%34.34s';

export function seemValidContent(contentLines) {
  if(contentLines.length <= 1) {
    return [false, 'Votre fichier ne semble pas contenir de données'];
  }

  let booleanMarker = false;
  contentLines.slice(1).map((line) => {
    if(line.length !== 12 && (line.length !== 1 && line[1] !== '')) {
      booleanMarker = true;
    }
  });

  if(booleanMarker) {
    return [false, 'La structure de votre fichier semble incorrecte'];
  }

  return [true, ''];
}


var csvLineToInternalLine = function(csvLine) {
  // Should be parsed to an adequat representation here, and add errors
  // if need be.
  var internalLine = csvLine.slice();

  var maybeDate = moment(internalLine[2].trim(), ['DD/MM/YY', 'DD/MM/YYYY'], true);
  internalLine[2] = maybeDate;

  return internalLine;
}


export function csvToInternal(contentLines) {
  var internal = [];

  // Remove first line
  var trueContentLines = contentLines.slice(1);
  trueContentLines = trueContentLines.filter(function(line) {return line.length !== 1});

  trueContentLines.map(function(line) {
    internal.push(csvLineToInternalLine(line))
  });

  return internal;
}


var internalLineToXimportLine = function(internalLine) {
  var ximportLine = internalLine.slice();

  ximportLine[0] = Number.parseInt(ximportLine[0]);

  if(moment.isMoment(ximportLine[2])) {
    ximportLine[2] = ximportLine[2].format('YYYYMMDD');
  }

  if(moment.isMoment(ximportLine[3])) {
    ximportLine[3] = ximportLine[3].format('YYYYMMDD');
  }

  ximportLine[7] = Number.parseFloat(ximportLine[7].replace(',', '.'));

  if(ximportLine[8]==='Credit') {
    ximportLine[8]='C';
  } else {
    ximportLine[8]='D';
  }

  var sprintfArgs = ximportLine.slice();
  sprintfArgs.unshift(ximportFormat);

  return sprintf.apply(this, sprintfArgs);
}


export function internalToXimport(internalLines) {
  var ximportLines = internalLines.map(internalLineToXimportLine);
  ximportLines.push('');

  return ximportLines.join('\r\n');
}

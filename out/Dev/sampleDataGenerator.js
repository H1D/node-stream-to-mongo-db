'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const writeFile = (0, _util.promisify)(_fs2.default.writeFile);

const generateSampleData = count => {
  console.log('Generation sample data...');
  return Array(count).fill({ someKey: Math.random().toString(2) });
};

const writeDataFile = async (data, outputFileLocation) => {
  try {
    await writeFile(outputFileLocation, JSON.stringify(data));
    console.log('-> DONE');
  } catch (error) {
    console.log(error);
  }
};

const insertSampleData = async (count, outputFileLocation) => {
  try {
    await writeDataFile(generateSampleData(count), outputFileLocation);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  insertSampleData
};
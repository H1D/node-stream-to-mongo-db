'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _JSONStream = require('JSONStream');

var _JSONStream2 = _interopRequireDefault(_JSONStream);

var _index = require('../index');

var _sampleDataGenerator = require('./sampleDataGenerator');

var _sampleDataGenerator2 = _interopRequireDefault(_sampleDataGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// feel free to change these
const numberOfDataItems = 100;
const sampleDataOutputFile = 'src/Dev/testDataDev.json';
const config = {
  dbURL: 'mongodb://localhost:27017/streamToMongoDB',
  collection: 'dev',
  batchSize: 1
};

const runTester = async () => {
  try {
    await clearDB();
    await _sampleDataGenerator2.default.insertSampleData(numberOfDataItems, sampleDataOutputFile);
    const inputDataStream = _fs2.default.createReadStream(sampleDataOutputFile).pipe(_JSONStream2.default.parse('*'));
    const streamer = await (0, _index.streamToMongoDB)(config);

    console.log(`Streaming data to MongoDB [ count: ${numberOfDataItems} | batchSize : ${config.batchSize} ]`);
    inputDataStream.pipe(streamer);
    inputDataStream.on('end', () => console.log('-> DONE'));
  } catch (error) {
    console.log(error);
  }
};

const clearDB = async () => {
  try {
    const dbConnection = await _mongodb2.default.MongoClient.connect(config.dbURL);
    await dbConnection.dropDatabase();
    await dbConnection.close();
  } catch (error) {
    console.log(error);
  }
};

runTester();
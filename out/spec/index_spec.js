'use strict';

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _JSONStream = require('JSONStream');

var _JSONStream2 = _interopRequireDefault(_JSONStream);

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DATA_FILE_LOCATION = _path2.default.resolve('src/spec/support/data.json'); /* global beforeEach, afterAll, expect, it, describe */

const testDB = 'streamToMongoDB';
const config = { dbURL: `mongodb://localhost:27017/${testDB}`, collection: 'test' };

const expectedNumberOfRecords = require('./support/data.json').length;

describe('.streamToMongoDB', () => {
  beforeEach(async done => {
    await clearDB();
    done();
  });

  afterAll(async done => {
    await clearDB();
    done();
  });

  describe('with no given options', () => {
    it('it uses the default config to stream the expected number of documents to MongoDB', async done => {
      runStreamTest(config, done);
    });
  });

  describe('with given options', () => {
    describe('with batchSize same as the number of documents to be streamed', () => {
      it('it streams the expected number of documents to MongoDB', done => {
        config.batchSize = expectedNumberOfRecords;
        runStreamTest(config, done);
      });
    });

    describe('with batchSize less than number of documents to be streamed', () => {
      it('it streams the expected number of documents to MongoDB', done => {
        config.batchSize = expectedNumberOfRecords - 3;
        runStreamTest(config, done);
      });
    });

    describe('with batchSize more than the number of documents to be streamed', () => {
      it('it streams the expected number of documents to MongoDB', done => {
        config.batchSize = expectedNumberOfRecords * 100;
        runStreamTest(config, done);
      });
    });

    describe('with caller provided connection', () => {
      it('it keeps the connection open', done => {
        config.batchSize = expectedNumberOfRecords * 100;
        connect().then(async client => {
          const dbConnection = await client.db();
          let closed = false;

          config.dbConnection = dbConnection;

          dbConnection.on('close', () => {
            closed = true;
          });
          runStreamTest(config, () => {
            expect(closed).toEqual(false);
            client.close().finally(done);
          });
        }).catch(() => {
          done();
        });
      });
    });
  });
});

const connect = () => _mongodb2.default.MongoClient.connect(config.dbURL, { useNewUrlParser: true });

const runStreamTest = (options, done) => {
  _fs2.default.createReadStream(DATA_FILE_LOCATION).pipe(_JSONStream2.default.parse('*')).pipe(_index2.default.streamToMongoDB(options)).on('error', () => {
    done();
  }).on('close', () => {
    ensureAllDocumentsInserted(done);
  });
};

const ensureAllDocumentsInserted = async done => {
  const client = await connect();
  const db = await client.db();
  const count = await db.collection(config.collection).countDocuments();

  await client.close();

  expect(count).toEqual(expectedNumberOfRecords);
  done();
};

const clearDB = async () => {
  const client = await connect();
  const dbConnection = await client.db();

  await dbConnection.dropDatabase();
  await client.close();
};
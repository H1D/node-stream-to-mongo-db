'use strict';

var _stream = require('stream');

var _mongodb = require('mongodb');

module.exports = {
  streamToMongoDB: options => {
    const config = Object.assign(
    // default config
    {
      batchSize: 1,
      insertOptions: { w: 1 }
    },
    // overrided options
    options);

    // those variables can't be initialized without Promises, so we wait first drain
    let client;
    let dbConnection;
    let bulk;
    let records = [];

    // this function is usefull to insert records and reset the records array
    const insert = async () => {
      await bulk.execute();
      records = [];
    };

    const close = async () => {
      if (!config.dbConnection && client) {
        await client.close();
      }
    };

    // stream
    const writable = new _stream.Writable({
      objectMode: true,
      write: async (record, encoding, next) => {
        try {
          // connection
          if (!dbConnection) {
            if (config.dbConnection) {
              dbConnection = config.dbConnection; // eslint-disable-line prefer-destructuring
            } else {
              client = await _mongodb.MongoClient.connect(config.dbURL, { useNewUrlParser: true });
              dbConnection = await client.db();
              bulk = db.collection.initializeOrderedBulkOp();
            }
          }

          if (!bulk) {
            const collection = await dbConnection.collection(config.collection);
            bulk = collection.initializeOrderedBulkOp();
          }

          // add to bulk operations
          if (record._id !== undefined) {
            bulk.find({ _id: record._id }).upsert().update({ $set: record });
          } else {
            bulk.insert(record);
          }

          // insert and reset batch recors
          if (bulk.length >= config.batchSize) await insert();

          // next stream
          next();
        } catch (error) {
          await close();
          writable.emit('error', error);
        }
      }
    });

    writable.on('finish', async () => {
      try {
        if (bulk.length > 0) await insert();
        await close();

        writable.emit('close');
      } catch (error) {
        await close();

        writable.emit('error', error);
      }
    });

    return writable;
  }
};
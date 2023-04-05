const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb://127.0.0.1/SmartVan')
    .then(client => {
        console.log('DB connected')
        _db = client.db();
        callback(client);
    })
    .catch(err => {
        console.log(err);
        throw err;
    })
};

const getdb = () => {
    if(_db) {
        return _db
    } 
    throw 'No Database'
};

exports.mongoConnect = mongoConnect;
exports.getdb = getdb;
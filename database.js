const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;
const url = 'mongodb+srv://tahamuhsinyilmaz:AqxRd5bu4he2mTAM@cluster0.hctcq8w.mongodb.net/SmartVan';

const mongoConnect = (callback) => {
    MongoClient.connect(url)
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
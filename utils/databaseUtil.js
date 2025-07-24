const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

const MongoUrl = process.env.MONGODB_URI;

let _db;

const mongoConnect = (callback)=>{
  MongoClient.connect(MongoUrl).then((client =>{
    _db = client.db('HomeHive');
   callback();
  })).catch((err)=>{
    console.log(err);
  })
}
const getDB = () =>{
  if(!_db){
    throw new Error('Mongo not connected');
  }
  return _db;
}
exports.mongoConnect = mongoConnect;
exports.getDB = getDB;

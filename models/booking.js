const { getDB } = require('../utils/databaseUtil');
const { ObjectId } = require('mongodb');

module.exports = class booking{ 
  constructor(houseId) {
    this.houseId = houseId;
  }
  save(){
    const db =getDB();
    return db.collection('bookings').findOne({houseId : this.houseId}).then(existingFavourite=>{
      if(!existingFavourite){
        return db.collection('bookings').insertOne(this);
      }
      return Promise.resolve();
    }

    );
  }
  static getbookings(){
      const db = getDB();
      return db.collection('bookings').find().toArray();
  }
 static deleteById(homeId){
        const db = getDB();
      return db.collection('bookings').deleteOne({houseId: homeId});  
}
}
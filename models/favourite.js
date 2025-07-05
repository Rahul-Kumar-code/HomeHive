const { getDB } = require('../utils/databaseUtil');
const { ObjectId } = require('mongodb');

module.exports = class favourite{ 
  constructor(houseId) {
    this.houseId = houseId;
  }
  save(){
    const db =getDB();
    return db.collection('favourites').findOne({houseId : this.houseId}).then(existingFavourite=>{
      if(!existingFavourite){
        return db.collection('favourites').insertOne(this);
      }
      return Promise.resolve();
    }

    );
  }
  static getfavourite(){
      const db = getDB();
      return db.collection('favourites').find().toArray();
  }
 static deleteById(homeId){
        const db = getDB();
      return db.collection('favourites').deleteOne({houseId: homeId});  
}
}
const { ObjectId } = require('mongodb');
const { getDB } = require('../utils/databaseUtil');

module.exports = class Home {
  constructor(homename, homeImg, location, price, rating, description, _id) {
    this.homename = homename;
    this.homeImg = homeImg;
    this.price = price;
    this.location = location;
    this.rating = rating;
    this.description = description;
    if (_id) {
      this._id = _id;
    }
  }

  save() {
    const db = getDB();
    const updateFields = {
      homename: this.homename,
      homeImg: this.homeImg,
      price: this.price,
      location: this.location,
      rating: this.rating,
      description: this.description,
    };
    if (this._id) {
      return db.collection('homes').updateOne({ _id: new ObjectId(String(this._id)) }, { $set: updateFields });
    } else {
      return db.collection('homes').insertOne(this);
    }
  }

  static fetchAll() {
    const db = getDB();
    return db.collection('homes').find().toArray();
  }

  static findById(homeId) {
    console.log(homeId);
    const db = getDB();
    return db.collection('homes').find({ _id: new ObjectId(String(homeId)) }).next();
  }

  static deleteById(homeId) {
    const db = getDB();
    return db.collection('homes').deleteOne({ _id: new ObjectId(String(homeId)) });
  }
};
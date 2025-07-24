const { ObjectId } = require('mongodb');
const { getDB } = require('../utils/databaseUtil');

module.exports = class User {
  constructor(firstName, lastName, email, password, userType, favouriteHomes = [], bookedHomes = [], _id) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.userType = userType;
    
    // Fix: Handle favouriteHomes safely
    this.favouriteHomes = Array.isArray(favouriteHomes) 
      ? favouriteHomes.map(id => typeof id === 'string' ? new ObjectId(id) : id)
      : [];
    
    // Fix: Handle bookedHomes safely
    this.bookedHomes = Array.isArray(bookedHomes) 
      ? bookedHomes.map(id => typeof id === 'string' ? new ObjectId(id) : id)
      : [];
    
    if (_id) {
      this._id = typeof _id === 'string' ? new ObjectId(_id) : _id;
    }
  }

  save() {
    const db = getDB();
    if (this._id) {
      // Fix: Define updateFields for update operation
      const updateFields = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        userType: this.userType,
        favouriteHomes: this.favouriteHomes,
        bookedHomes: this.bookedHomes, // Add bookedHomes to update
        updatedAt: new Date()
      };
              return db.collection('user').updateOne(
        { _id: new ObjectId(String(this._id)) }, 
        { $set: updateFields }
      );
    } else {
      // Fix: Add createdAt timestamp for new user
      const userDoc = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        userType: this.userType,
        favouriteHomes: this.favouriteHomes,
        bookedHomes: this.bookedHomes, // Add bookedHomes for new user
        createdAt: new Date()
      };
      return db.collection('user').insertOne(userDoc);
    }
  }

  static fetchAll() {
    const db = getDB();
    return db.collection('user').find().toArray();
  }

  static findById(_id) {
    console.log('Finding user by ID:', _id);
    const db = getDB();
    return db.collection('user').findOne({ _id: new ObjectId(String(_id)) });
  }

  static findOneByEmail(email) {
    const db = getDB();
    return db.collection('user').findOne({ email });
  }

  static deleteById(_id) {
    const db = getDB();
    return db.collection('user').deleteOne({ _id: new ObjectId(String(_id)) });
  }

  // Additional helpful methods
  static async findByUserType(userType) {
    const db = getDB();
    return db.collection('user').find({ userType }).toArray();
  }

  // Favourite Homes Methods
  async addFavouriteHome(homeId) {
    const db = getDB();
    const homeObjectId = new ObjectId(String(homeId));
    
    return db.collection('user').updateOne(
      { _id: this._id },
      { $addToSet: { favouriteHomes: homeObjectId } }
    );
  }

  async removeFavouriteHome(homeId) {
    const db = getDB();
    const homeObjectId = new ObjectId(String(homeId));
    
    return db.collection('user').updateOne(
      { _id: this._id },
      { $pull: { favouriteHomes: homeObjectId } }
    );
  }

  // Booked Homes Methods
  async addBookedHome(homeId) {
    const db = getDB();
    const homeObjectId = new ObjectId(String(homeId));
    
    return db.collection('user').updateOne(
      { _id: this._id },
      { $addToSet: { bookedHomes: homeObjectId } }
    );
  }

  async removeBookedHome(homeId) {
    const db = getDB();
    const homeObjectId = new ObjectId(String(homeId));
    
    return db.collection('user').updateOne(
      { _id: this._id },
      { $pull: { bookedHomes: homeObjectId } }
    );
  }

  // Static method to add booking for a user
  static async addBooking(userId, homeId) {
    const db = getDB();
    const homeObjectId = new ObjectId(String(homeId));
    const userObjectId = new ObjectId(String(userId));
    
    return db.collection('user').updateOne(
      { _id: userObjectId },
      { $addToSet: { bookedHomes: homeObjectId } }
    );
  }

  // Static method to remove booking for a user
  static async removeBooking(userId, homeId) {
    const db = getDB();
    const homeObjectId = new ObjectId(String(homeId));
    const userObjectId = new ObjectId(String(userId));
    
    return db.collection('user').updateOne(
      { _id: userObjectId },
      { $pull: { bookedHomes: homeObjectId } }
    );
  }

  // Get user's booked homes with full home details
  static async getUserBookedHomes(userId) {
    const db = getDB();
    
    const [userWithBookings] = await db.collection('user').aggregate([
      { $match: { _id: new ObjectId(userId) } },
      {
        $lookup: {
          from: 'homes',
          localField: 'bookedHomes',
          foreignField: '_id',
          as: 'bookedHomesDetails'
        }
      },
      {
        $project: {
          bookedHomesDetails: 1
        }
      }
    ]).toArray();

    return userWithBookings?.bookedHomesDetails || [];
  }

  // Get user's favourite homes with full home details
  static async getUserFavouriteHomes(userId) {
    const db = getDB();
    
    const [userWithFavourites] = await db.collection('user').aggregate([
      { $match: { _id: new ObjectId(userId) } },
      {
        $lookup: {
          from: 'homes',
          localField: 'favouriteHomes',
          foreignField: '_id',
          as: 'favouriteHomesDetails'
        }
      },
      {
        $project: {
          favouriteHomesDetails: 1
        }
      }
    ]).toArray();

    return userWithFavourites?.favouriteHomesDetails || [];
  }

  // Method to get user data without sensitive information
  toJSON() {
    return {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      userType: this.userType,
      favouriteHomes: this.favouriteHomes,
      bookedHomes: this.bookedHomes
      // Note: password is intentionally excluded
    };
  }
};
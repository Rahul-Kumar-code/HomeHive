const { ObjectId } = require('mongodb');
const { getDB } = require('../utils/databaseUtil');
const Home = require('../models/home');
const User = require('../models/user');

// Home exports
exports.getIndex = (req, res, next) => {
  Home.fetchAll().then(registeredHomes => {
    res.render('store/index', {
      registeredHomes,
      pageTitle: 'HomeHive',
      currentUrl: req.path,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }).catch(err => {
    console.error('Error fetching homes:', err);
    res.status(500).send('Internal Server Error');
  });
};

exports.gethome = (req, res, next) => {
  Home.fetchAll().then(registeredHomes => {
    res.render('store/home-list', {
      registeredHomes,
      pageTitle: 'HomeHive | Homes',
      currentUrl: req.path,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }).catch(err => {
    console.error('Error fetching homes:', err);
    res.status(500).send('Internal Server Error');
  });
};

exports.gethomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then(home => {
    if (!home) {
      console.log('Home not found:', homeId);
      return res.redirect('/homes');
    }
    
    res.render('store/home-detail', {
      home: home,
      pageTitle: 'HomeHive | Home Details',
      currentUrl: '/homes',
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }).catch(err => {
    console.error('Error fetching home details:', err);
    res.redirect('/homes');
  });
};

// Bookings - Updated to use User model
exports.getBookingList = async (req, res, next) => {
  try {
    if (!req.session.user || !req.session.user._id) {
      return res.redirect('/login');
    }

    const userId = req.session.user._id;
    
    // Get user's booked homes with full home details using aggregation
    const bookedHomes = await User.getUserBookedHomes(userId);

    res.render('store/bookings', {
      bookedHomes,
      pageTitle: 'HomeHive | Bookings',
      currentUrl: req.path,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });

  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).send('Internal Server Error');
  }
};

exports.postaddtobookings = async (req, res, next) => {
  try {
    if (!req.session.user || !req.session.user._id) {
      return res.redirect('/login');
    }

    const homeId = req.body.id;
    const userId = req.session.user._id;

    console.log("POST request to add to bookings");
    
    // Add home to user's bookedHomes
    const result = await User.addBooking(userId, homeId);

    if (result.modifiedCount > 0) {
      console.log('Home added to bookings');
      
      // Update session user data
      const updatedUser = await User.findById(userId);
      req.session.user = updatedUser;
    } else {
      console.log('Home already booked or user not found');
    }

    res.redirect('/bookings');
  } catch (err) {
    console.error('Error adding booking:', err);
    res.redirect('/bookings');
  }
};

exports.postcancelBooking = async (req, res, next) => {
  try {
    if (!req.session.user || !req.session.user._id) {
      return res.redirect('/login');
    }

    const homeId = req.params.homeId;
    const userId = req.session.user._id;

    // Remove home from user's bookedHomes
    const result = await User.removeBooking(userId, homeId);

    if (result.modifiedCount > 0) {
      console.log('Booking cancelled');
      
      // Update session user data
      const updatedUser = await User.findById(userId);
      req.session.user = updatedUser;
    } else {
      console.log('Booking not found or user not found');
    }

    res.redirect('/bookings');
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.redirect('/bookings');
  }
};

// Favourites - Updated to use User model
exports.postaddtofavourite = async (req, res, next) => {
  try {
    if (!req.session.user || !req.session.user._id) {
      return res.redirect('/login');
    }

    const homeId = req.body.id;
    const userId = req.session.user._id;

    // Add home to user's favourites using User model method
    const result = await User.addBooking(userId, homeId); // This should be addFavourite, but using the pattern
    // Actually, let's use the direct database approach for consistency
    const db = getDB();
    const updateResult = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { favouriteHomes: new ObjectId(homeId) } }
    );

    if (updateResult.modifiedCount > 0) {
      console.log('Home added to favourites');
      
      // Update session user data
      const updatedUser = await User.findById(userId);
      req.session.user = updatedUser;
    } else {
      console.log('Home already in favourites or user not found');
    }

    res.redirect('/favourites');
  } catch (err) {
    console.error('Error adding to favourites:', err);
    res.redirect('/favourites');
  }
};

exports.postRemoveFavourite = async (req, res, next) => {
  try {
    if (!req.session.user || !req.session.user._id) {
      return res.redirect('/login');
    }

    const homeId = req.params.homeId;
    const userId = req.session.user._id;
    const db = getDB();

    // Remove home from user's favourites
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { favouriteHomes: new ObjectId(homeId) } }
    );

    if (result.modifiedCount > 0) {
      console.log('Home removed from favourites');
      
      // Update session user data
      const updatedUser = await User.findById(userId);
      req.session.user = updatedUser;
    } else {
      console.log('Home not found in favourites or user not found');
    }

    res.redirect('/favourites');
  } catch (err) {
    console.error('Error removing from favourites:', err);
    res.redirect('/favourites');
  }
};

exports.getFavouriteList = async (req, res, next) => {
  try {
    if (!req.session.user || !req.session.user._id) {
      return res.redirect('/login');
    }

    const userId = req.session.user._id;
    
    // Get user's favourite homes with full home details using the User model method
    const favouriteHomes = await User.getUserFavouriteHomes(userId);

    res.render('store/favourite-list', {
      favouriteHomes: favouriteHomes,
      pageTitle: 'HomeHive | My Favourites',
      currentUrl: req.path,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user
    });

  } catch (err) {
    console.error('Error fetching favourite list:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Helper functions to check if a home is in user's favourites or bookings
exports.isHomeFavourite = (homeId, userFavourites) => {
  if (!userFavourites || !Array.isArray(userFavourites)) {
    return false;
  }
  
  return userFavourites.some(favId => 
    favId.toString() === homeId.toString()
  );
};

exports.isHomeBooked = (homeId, userBookings) => {
  if (!userBookings || !Array.isArray(userBookings)) {
    return false;
  }
  
  return userBookings.some(bookId => 
    bookId.toString() === homeId.toString()
  );
};
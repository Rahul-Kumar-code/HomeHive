const booking = require('../models/booking');
const favourite = require('../models/favourite');
const Home = require('../models/home');
// home
exports.getIndex = (req, res, next)=>{
  Home.fetchAll().then(registeredHomes=>{
    res.render('store/index',{registeredHomes,pageTitle:'HomeHive',currentUrl: req.path});
  })
}

exports.gethome = (req, res, next)=>{
  Home.fetchAll().then(registeredHomes=>{
    res.render('store/home-list',{registeredHomes,pageTitle:'HomeHive | Homes',currentUrl: req.path});
  })
}
exports.gethomeDetails = (req, res, next)=>{
    const homeId = req.params.homeId;
    Home.findById(homeId).then(home => {
     if(!home){
      console.log(home);
       res.redirect('/homes');
     }
     else{
       res.render('store/home-detail',{home: home,pageTitle:'HomeHive | home details',currentUrl: '/homes'});
     }
      
    })
  };

//Bookings
exports.getBookingList = (req, res, next)=>{
  booking.getbookings().then(booking =>{
   booking = booking.map(book=> book.houseId);
   Home.fetchAll().then(registeredHomes =>{
     const bookedHomes = registeredHomes.filter(home => booking.includes(home._id.toString()));
     console.log(req.url,req.method,bookedHomes);
     res.render('store/bookings',{bookedHomes,pageTitle:'HomeHive | favourites',currentUrl: req.path});
   } )
   });}
exports.postaddtobookings = (req, res, next)=>{
  const homeId = req.body.id;
  const booked = new booking(homeId);
  console.log("post rewuest to add in bookings")
  booked.save().then(result=>{
      console.log(result);
      res.redirect('/bookings');
    }).catch(err=>{
      console.log(err);
      res.redirect('/bookings');
    })
  };
  exports.postcancelBooking= (req, res, next)=>{
    const homeId = req.params.homeId;
    booking.deleteById(homeId).then(result=>{
     console.log(result);
    }).catch(err=>{
     console.log(err);
    }).finally(()=>{
     res.redirect('/bookings');
    })
   }
//Favourites
exports.postaddtofavourite = (req, res, next)=>{
  const homeId = req.body.id;
  const fav = new favourite(homeId);
  console.log(fav);
  fav.save().then(result=>{
      console.log(result);
      res.redirect('/favourites');
    }).catch(err=>{
      console.log(err);
      res.redirect('/favourites');
    })
  };

exports.postRemoveFavourite= (req, res, next)=>{
 const homeId = req.params.homeId;
 favourite.deleteById(homeId).then(result=>{
  console.log(result);
 }).catch(err=>{
  console.log(err);
 }).finally(()=>{
  res.redirect('/favourites');
 })
}
 
exports.getFavouriteList= (req, res, next)=>{
 favourite.getfavourite().then(favourite =>{
  favourite = favourite.map(fav=> fav.houseId);
  Home.fetchAll().then(registeredHomes =>{
    const favouriteHomes = registeredHomes.filter(home => favourite.includes(home._id.toString()));
    console.log(req.url,req.method,favouriteHomes);
    res.render('store/favourite-list',{favouriteHomes,pageTitle:'HomeHive | favourites',currentUrl: req.path});
  } )
  });
}

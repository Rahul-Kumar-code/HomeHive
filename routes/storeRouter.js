const express = require('express');
const storeRouter = express.Router();
const storeController = require('../controllers/storeController');

storeRouter.get("/",storeController.getIndex);
storeRouter.get("/homes",storeController.gethome);
storeRouter.get("/homes/:homeId",storeController.gethomeDetails);
storeRouter.get("/bookings",storeController.getBookingList);
storeRouter.post("/bookings",storeController.postaddtobookings);
storeRouter.post("/bookings/cancel/:homeId",storeController.postcancelBooking);
storeRouter.get("/favourites",storeController.getFavouriteList);
storeRouter.post("/favourites",storeController.postaddtofavourite);
storeRouter.post("/favourites/delete/:homeId",storeController.postRemoveFavourite);

module.exports = storeRouter;
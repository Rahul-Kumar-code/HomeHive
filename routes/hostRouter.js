const express = require("express");
const hostRouter = express.Router();
const hostController = require("../controllers/hostController");

hostRouter.get("/add-home", hostController.getAddHome);
hostRouter.post("/add-home", hostController.homeAdded);
hostRouter.get("/host-home-list", hostController.getHosthome);
hostRouter.get("/host/edit-home/:homeId", hostController.getEditHome);
hostRouter.post("/edit-home", hostController.postEditHome);
hostRouter.post("/host/delete-home/:homeId", hostController.postDeleteHome);
exports.hostRouter = hostRouter;
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");
const path = require("path");
require("dotenv").config();
const MongoUrl = process.env.MONGODB_URI;
const store = new MongoDBStore({
  uri: MongoUrl,
  collection: "sessions",
});
const storeRouter = require("./routes/storeRouter");
const { hostRouter } = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const rootDir = require("./utils/utils");
const errorsControllers = require("./controllers/errors");
const { mongoConnect } = require("./utils/databaseUtil");

app.use(express.static(path.join(rootDir, "public")));

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);

app.use(flash());
app.use((req, res, next) => {
  res.locals.successMessage = req.flash("success");
  res.locals.errorMessage = req.flash("error");
  next();
});

app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});
app.use(authRouter);
app.use(storeRouter);
app.use((req, res, next) => {
  if (req.isLoggedIn) next();
  else res.redirect("/login");
});
app.use(hostRouter);
app.use(errorsControllers.getError);

const port = process.env.PORT || 5000;
mongoConnect((client) => {
  console.log(client);
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});

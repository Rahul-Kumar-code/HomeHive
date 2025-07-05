const express = require('express');
const app = express();
app.set('view engine','ejs');
app.set('views','views');
const path = require('path');
require('dotenv').config(); 
const storeRouter = require('./routes/storeRouter');
const {hostRouter} = require('./routes/hostRouter');
const rootDir = require('./utils/utils');
const errorsControllers = require('./controllers/errors');
const {mongoConnect} = require('./utils/databaseUtil');

app.use(express.static(path.join(rootDir,'public')));

app.use((req, res, next)=>{
     console.log(req.url,req.method);
     next();
})
 
app.use(express.urlencoded({ extended: false }));
app.use(storeRouter);
app.use(hostRouter);
app.use(errorsControllers.getError);


const port = process.env.PORT || 5000;
mongoConnect(client => {
  console.log(client);
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
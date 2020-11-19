const express = require('express');
require('dotenv').config();
require('./db/mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const userRouter = require('./routers/userRouter');

const app = express();
const port = process.env.PORT || 3000;
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions'
});

store.on('error', error => {
  console.log(error);
});

app.set('trust proxy', 1);

app.use(session({
  name: 'mip',
  secret: process.env.SESSION_SECRET,
  store,
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.ENV === 'production'
  },
}))

app.use(express.json());

app.use(userRouter);

app.listen(port, () => {
  console.log(`Server is up on http://localhost:${port}`);
});

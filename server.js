const express = require('express');
require('dotenv').config();
require('./db/mongoose');
const session = require('express-session');
const cors = require('cors');
const MongoDBStore = require('connect-mongodb-session')(session);
const userRouter = require('./routers/userRouter');
const postRouter = require('./routers/postRouter');

const app = express();
const port = process.env.PORT || 5000;
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions'
});

app.set('trust proxy', 1);

store.on('error', error => {
  console.log(error);
});

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? /\.jeececab.com$/ : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'PATCH']
  })
);

const sessionConfig = {
  name: 'mip',
  secret: process.env.SESSION_SECRET,
  store,
  resave: true,
  saveUninitialized: false,
  cookie: {
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    domain: '.jeececab.com'
  }
};

app.use(session(sessionConfig));

app.use(express.json());

app.use(userRouter);
app.use(postRouter);

app.listen(port, () => {
  console.log(`Server is up on http://localhost:${port}`);
});

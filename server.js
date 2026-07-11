require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');

const connectDB = require('./config/db');
const seed = require('./utils/seedData');
const { attachUser } = require('./middleware/auth');

const app = express();

connectDB().then(seed).catch((err) => console.error('Seed error:', err.message));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(
  helmet({
    contentSecurityPolicy: false // relax CSP for now; tighten once external assets are finalized
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true
    }
  })
);

app.use(attachUser);

// Cache-busting version string for CSS/JS, available in all views as `assetV`
app.use((req, res, next) => {
  res.locals.assetV = process.env.ASSET_VERSION || '20260711a';
  next();
});

app.use('/', require('./routes/index'));
app.use('/', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/booking', require('./routes/booking'));
app.use('/admin', require('./routes/admin'));

app.use((req, res) => {
  res.status(404).render('error', { title: 'Not Found', message: 'Page not found.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Server Error', message: 'Something went wrong. Please try again.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`EnrgyAstro running on port ${PORT}`));

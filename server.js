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
const { toolIcons, serviceIcons } = require('./utils/icons');

// Fail fast with a clear message rather than letting a missing env var
// surface as a cryptic assertion from a dependency deep in the stack
// (e.g. connect-mongo crashing with "You must provide either mongoUrl...").
const REQUIRED_ENV = ['MONGO_URI', 'SESSION_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(
    `Missing required environment variable(s): ${missing.join(', ')}.\n` +
    'Set these in your hosting provider\'s environment/dashboard (or in .env locally) before starting the app. ' +
    'See .env.example for the full list.'
  );
  process.exit(1);
}

const app = express();

// Hostinger (and most Node hosts) sit behind a reverse proxy that terminates
// SSL and forwards plain HTTP internally. Without trust proxy, Express never
// sees the connection as secure, so express-session silently refuses to set
// cookie.secure=true cookies — sessions never persist, and login/register
// appear to "do nothing" even though the account is created successfully.
app.set('trust proxy', 1);

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
  res.locals.assetV = process.env.ASSET_VERSION || '20260713a';
  res.locals.toolIcons = toolIcons;
  res.locals.serviceIcons = serviceIcons;
  next();
});

app.use('/', require('./routes/index'));
app.use('/', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/booking', require('./routes/booking'));
app.use('/blog', require('./routes/blog'));
app.use('/admin', require('./routes/admin'));

app.use((req, res) => {
  res.status(404).render('error', { title: 'Not Found', message: 'Page not found.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Server Error', message: 'Something went wrong. Please try again.' });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`EnrgyAstro running on port ${PORT}`));

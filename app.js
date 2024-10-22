const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors')

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanatize = require('express-mongo-sanitize');
const xssClear = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

// import the router object 
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

// const { title } = require('process');
const app = express();

app.use(cors({
  origin: 'https://another-domain.com',
  credentials: true, // Allow cookies to be sent
}));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) Global MIDDLEWARES
// serving static files
app.use(express.static('./public'));

app.use(express.static(path.join(__dirname, 'public')));

//set security http headers
app.use(helmet(
  {
    contentSecurityPolicy: false
  }
));

//Development logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('dev'));
}

//Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, please try again in an hour!'
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.urlencoded({ extended: true })); 
app.use(express.json({ limit: '2Mb' }));

app.use(cookieParser());

// Data sanitizations against NoSQl query injection
app.use(mongoSanatize())

// Data Sanitinations against xss
app.use(xssClear());

// prevent parameter pollutions
app.use(hpp({
  whitelist: [
    'price',
    'maxGroupSize'
  ]
}
));



// Test middleware
app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
//API's
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//render data of frontend
app.use('/', viewRouter);

module.exports = app;
const express = require('express');
const morgan = require('morgan');

const AppError = require('./appError');

const globalErrorHandler = require('./controllers/errorControl');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers)
  next();
});
// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', function (req, res, next) {
  next(new AppError(`this ${req.originalUrl} is not found`, 404));
});
app.use(globalErrorHandler);
module.exports = app;

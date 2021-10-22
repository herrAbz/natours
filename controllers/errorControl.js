const AppError = require('./../appError');

const handelCastErrorDB = err => {
    const message = `invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};
const handelDublicateDB = err => {
    const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)
    const message = `dublicate value fields : ${value}`

};
const handelJWTError = () => new AppError('please login again', 401);
const handelJWTExpiredError = () => new AppError('your token has expiered', 401);
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};
const sendErrorPro = (err, res) => {
    ///operatinal trusted error :send message to client
    if (err.isOprational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        console.error(err);
        res.status(500).json({
            status: 'error',
            message: 'something going wrong'
        });
    }
};



module.exports = (err, req, res, next) => {
    console.log(err.statusCode, err.status);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        if (error.name === 'CastError') error = handelCastErrorDB(error);
        if (error.code === 11000) error = handelDublicateDB(error);
        if (error.name === 'JsonWebTokenError') error = handelJWTError();
        if (error.name === 'TokenExpiredError') error = handelJWTExpiredError();
        sendErrorPro(error, res);
    }
};

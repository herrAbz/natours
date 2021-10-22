const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('./../appError');

const User = require('./../models/userModel');

const catchAsync = require('./../catchAsync');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_secret, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};
exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangeAt: req.body.passwordChangeAt
    });
    const token = signToken(newUser._id);
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
});
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    //1)check if email is already exists
    if (!email || !password) {
        return next(new AppError('please provide a email and password', 400));
    }
    //2) check if user exist and password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password)))
        return next(new AppError('incorrct email or password', 401));

    //3)if every things is ok and send token to cleint
    const token = signToken(user._id);
    res.status(200).json({ status: 'success', token });
});

exports.protect = catchAsync(async (req, res, next) => {
    //1 get token and chek
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(
            new AppError('you are not logged in .please loged in to get access')
        );
    }
    //2 varifcation token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_secret);
    //3 check user is still exist
    const freshUser = await User.findById(decoded.id);
    if (!freshUser)
        return next(new AppError('the user not exist by this token', 401));
    //4  if check  user change the pass after the token was issued
    if (freshUser.ChangedPasswordAfter(decoded.iat)) {
        return next(new AppError('user recently changed password', 401));
    }

    ///grant acces to protected data for
    req.user = freshUser;
    next();
});

exports.restrictTO = catchAsync(async (req, res, next) => {

})

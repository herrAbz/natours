const crypto = require('crypto');
const mongoose = require('mongoose');

const validator = require('validator');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    passwordChangeAt: Date,
    name: {
        type: String,
        required: [true, 'a user must have a name'],
        trim: true
    },
    email: {
        type: String,
        require: [true, 'a user must have a email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'plese insert a valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        require: [true, 'a user must have a password'],
        minLength: [8, 'must above 8'],
        select: false
    },
    passwordConfirm: {
        type: String,
        require: [true, 'please confirm your pass'],
        validate: {
            //////this only works on save and create
            validator: function (el) {
                return el === this.password;
            },
            message: 'password are not the same'
        }
    },
    passwordRestTokens: String,
    passwordResetExpires: Date
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.ChangedPasswordAfter = function (JWTTimesStamp) {
    if (this.passwordChangeAt) {
        const changeTimeStamp = parseInt(
            this.passwordChangeAt.getTime() / 1000,
            10
        );
        return JWTTimesStamp < changeTimeStamp;
    }
    return false;
};
userSchema.methods.creatPasswordRestToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordRestTokens = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    console.log({ resetToken }, this.passwordRestTokens);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;

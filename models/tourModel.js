const mongoose = require('mongoose');

const slugy = require('slugify');

const validator = require('validator');


const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'a tour must have a name'],
            unique: true,
            trim: true,
            maxLength: [40, 'a tour muust have 40'],
            minLength: [10, 'a tour muust have 10'],
            validate: [validator.isAlpha, 'wwwwwww only carector']
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'a tour must have a duration']
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'a tour must have a max group size']
        },
        difficulty: {
            type: String,
            required: [true, 'a tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'difficulty is either: easy, medium,difficult'
            },
            trim: true
        },
        ratingsAvrage: {
            type: Number,
            default: 4.5,
            min: [1, 'rating must be above 1.0'],
            max: [5, 'rating must be belowe 5.0']
        },
        ratingQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, 'a tour must have a price']
        },
        priceDiscount: {
            type: Number,
            validate: {
                /// not working by update you can only use for create because of this
                validator: function (val) {
                    return val < this.price;
                },
                message: 'discount price should be belowe regular price'
            }
        },
        summery: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            required: [true, 'a tour must have a description']
        },
        secretTour: {
            type: Boolean,
            default: false
        },
        imageCover: {
            type: String,
            required: [true, 'a tour must have a image']
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        startDates: [Date]
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);
tourSchema.virtual('durationWeak').get(function () {
    return this.duration / 7;
});
////document middel ware  runs before save(),create()
tourSchema.pre('save', function (next) {
    this.slug = slugy(this.name, { lower: true });
    next();
});
///query middel ware
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});
tourSchema.post(/^find/, function (docs, next) {
    console.log(`query tooks ${Date.now() - this.start}`);
    next();
});
/////////aggregate middleware

tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    console.log(this.pipeline());
    next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

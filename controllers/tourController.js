const Tour = require('./../models/tourModel');

const catchAsync = require('./../catchAsync');

const AppError = require('./../appError');

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObject = { ...this.queryString };
    const excludedFildes = ['page', 'sort', 'limit', 'fields'];
    excludedFildes.forEach(el => delete queryObject[el]);
    //1)advance filtering
    let quryStr = JSON.stringify(queryObject);
    quryStr = quryStr.replace(/\b(gte|lte|lt|gt)\b/g, match => `$${match}`);
    this.query.find(JSON.parse(quryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFieldes() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    ///page=1=>0-10,page=2=>11-20,page=3=>21-30,....
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAvrage,price';
  req.query.fields = 'name,price,ratingsAvrage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  ///execute query
  const features = new APIfeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFieldes()
    .paginate();
  const tours = await features.query;
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // const id = req.params.id * 1;
  // const tour = tours.find(el => el.id === id);

  const tour = await Tour.findById(req.params.id);
  // const tour = Tour.findOne({ _id: req.params.id });
  if (!tour) {
    return next(new AppError('no tour found whith that id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!tour) {
    return next(new AppError('no tour found whith that id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('no tour found whith that id', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getToursStat = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAvrage: { $gte: 4.5 } }
    },
    {
      $group: {
        //groh bandi amari ba id anjam mishvad
        _id: '$difficulty',
        numTour: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgprice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numtourStarts: -1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});

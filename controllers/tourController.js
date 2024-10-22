const fs = require('fs');
const stringify = require('stringify');
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures')
const { json } = require('express')
// const client = require('../redis');


exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'ratingAverage,price'
  req.query.fields = "name,price,summary,ratingsQuantity,ratingAverage"
  next();
}

// using APIFeatures
exports.getAllTours = async (req, res) => {
  try {
    let tours;
    // let tours = await client.get('AllTours');
    // if (tours) {
    //   // const r = await client.del('AllTours');
    //   console.log("redis data");
    //   tours = JSON.parse(tours); // Convert from JSON string
    //   return res.status(200).json({
    //     status: 'success',
    //     requestedAt: req.requestTime,
    //     length: tours.length,
    //     data: {
    //       tour: { tours }
    //     }
    //   });
    // }
 
    const featuresresult = new APIFeatures(Tour.find().limit(6), req.query)
      .filters()
      .sort()
      .fieldsLimit()
      .paginations()

    tours = await featuresresult.query;
  //   await client.set('AllTours', JSON.stringify(tours), {
  //     EX: 3600 * 24 // 3600sec - 1hr 
  // });

    // send response
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      length: tours.length,
      data: {
        tour: { tours }
      };
    });

  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: "fail",
      Message: "Not Found"
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    // let tour = await client.get(`tour.${req.params.id}`);
    // if (tour) {
    //   console.log("redis Tour data");
    //   tour = JSON.parse(tour); 
    //   return res.status(200).json({
    //     status: 'success',
    //     data: {
    //       tour: { tour }
    //     }
    //   });
    // }

    // data are not present redis, insert the data in redis
    let tour = await Tour.findById(req.params.id).populate('reviews');
    // await client.set(`tour.${req.params.id}`, JSON.stringify(tour), {
    //   EX: 3600 * 1 // 3600sec - 1hr 
    //  });

 
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    console.log(error)
    res.status(404).json({
      status: 'fail',
      error
    });
  }
};


exports.createTour = async (req, res) => {
  // console.log(req.body)
  try {
    const newTour = await Tour.create(req.body);

    await newTour.save();

    res.status(201).json({
      status: 'success',
      data: {
        tour: { newTour }
      }
    });
  } catch (err) {

    res.status(400).json({
      status: "fail",
      ERROR: "Invalid Data Send" + err.message
    });
  }
};

exports.updateTour = async (req, res) => {
  // console.log(req.body)
  try {
    // const updatedTour = await Tour.findByIdAndUpdate(req.body.id, req.body, {
    //   new: true,
    //   runValidators: true} );

    const updatedTour = await Tour.updateMany({ _id: req.params.id }, { $set: req.body }, { $set: { new: true } });


    res.status(200).json({
      status: 'success',
      data: {
        tour: { updatedTour }
      }
    });

  } catch (err) {
    res.status(400).json({
      status: "fail",
      ERROR: "Invalid Data"
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const deleteTour = await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: {
        tour: { deleteTour }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      ERROR: "Invalid Data Send" + err
    });
  }
};


exports.getToursStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { price: { $gte: 500 } }
      },
      {
        $group: {
          _id: '$difficulty',    // group by difficulty
          sumTours: { $sum: 1 },
          ratingQuantity: { $avg: '$ratingQuantity' },
          avgprice: { $avg: '$price' },
          maxGroupSize: { $avg: '$maxGroupSize' },
          minprice: { $min: '$price' },
          maxprice: { $max: '$price' },
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: 'fail',
      error: err
    });
  }
};


exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const stats = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%m", date: "$startDates" } }, // Extracts month in MM format
          sumTours: { $sum: 1 },
          tours: { $push: '$name' },
          ratingQuantity: { $avg: '$ratingQuantity' },
          avgprice: { $avg: '$price' },
          maxGroupSize: { $avg: '$maxGroupSize' },
          minprice: { $min: '$price' },
          maxprice: { $max: '$price' },
        }
      },
      {
        $sort: { _id: 1, sumTours: 1 },

      }
    ]);

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: 'fail',
      message: 'Unable to retrieve monthly plan',
      error: err.message
    });
  }
};
























/*
// Without
exports.getAllTours = async (req, res) => {
  try {
    //////Build filtering
    //1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    ////// 2) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${(match)}`);

    ////// 4) Sorting
    let query = Tour.find(JSON.parse(queryStr));

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      console.log(sortBy)
      query = query.sort(sortBy);
    }


    //3) Fileds Limited
    if (req.query.fields) {
      const SortBy = req.query.fields.split(',').join(' ');
      query = query.select(SortBy);
    } else {
      query = query.select('-__v');
    }

    ///4) paginations
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const NumTours = await Tour.countDocuments();
      if (skip >= NumTours) {
        throw new Error("Page does not exits")
      }
    }

    //Execute Query
    //  let AllTour = await Tour.find(JSON.parse(queryStr));
     let AllTour = await query;


    // const AllTour = await Tour.find({
    //   difficulty: "medium",
    //   "price": 1497
    // });

    // const AllTour = await Tour.find()
    //   .where("difficulty")
    //   .equals("medium")
    //   .where("price")
    //   .equals(1497);


    // send response
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      length: AllTour.length,
      data: {
        tour: { AllTour }
      }
    });
  } catch (err) {
    console.log("we get a error" + err);
    res.status(404).json({
      status: "fail",
      Message: "Not Found" + err
    });
  }
};
*/

//////////////// used to json data
/*
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);
  
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours
    }
  });
};

exports.getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;

  const tour = tours.find(el => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
};

exports.createTour = (req, res) => {
  // console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null
  });
};

*/
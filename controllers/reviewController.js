const review = require('../models/reviewModel');

exports.createReview = async (req, res) => {
    try {
      const newReview = await review.create(req.body);
  
      await newReview.save();
  
      res.status(201).json({
        status: 'success',
        data: {
          tour: { newReview }
        }
      });
    } catch (err) {
  
      res.status(400).json({
        status: "fail",
        ERROR: "Invalid Data Send" + err.message
      });
    }
  };

  exports.getAllReview = async (req, res) => {
    console.log(req.body.id);
    try {
      console.log("Test-1")
      const view_review = await review.find({tour: req.body.id});
      console.log("Test-1")

      res.status(200).json({
        status: 'success',
        data: view_review
      });
    } catch (err) {
      res.status(400).json({
        status: "fail",
        error: "Invalid Data Send"
      });
    }
  };
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
    try {
      const to = Date.now();
      let view_review;
      // if (req.body.id){
      //    view_review = await review.find({tour: req.body.id});
      // }else{
      //   view_review = await review.find();
      // }
      const t1 = Date.now();
      console.log(t1 - to);
      res.status(200).json({
        status: 'success',
        time: t1 - to, 
        data: view_review
      });
    } catch (err) {
      res.status(400).json({
        status: "fail", 
        error: "Invalid Data Send"
      });
    }
  };
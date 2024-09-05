const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('./../controllers/authController')

const router = express.Router();
 
router
  .route('/create.reviews')
  .post(authController.protect, authController.restrictTo('user'), reviewController.createReview);

  router
  .route('/view.review')
  .post(authController.protect,  reviewController.getAllReview);

module.exports = router;

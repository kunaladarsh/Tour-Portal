const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController')

const router = express.Router();

// router.param('id', tourController.checkID);  // jsons data used (this time to check)
 
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours)

router
  .route('/getMonthlyPlan/:year')
  .get(tourController.getMonthlyPlan)

router
  .route('/getToursStats')
  .get(tourController.getToursStats)

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide'), 
    tourController.deleteTour
  );

// Export the router
module.exports = router;
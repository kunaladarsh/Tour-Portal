const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController')

const router = express.Router();

router.route('/signUp').post(authController.CreateUser);
router.route('/logIn').post(authController.login);
router.route('/logout').get(authController.logOut);

router.route('/reset.password/:token').post(authController.resetPassword);
router.route('/forget.password').post(authController.forgetPassword);

// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.isLoggedIn);

router.route('/update.password').patch(authController.updatePassword);
router.route('/updateMe').patch(userController.UpdateMe);
router.route('/deleteMe').delete(userController.deleteMe);
  

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(authController.protect, userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
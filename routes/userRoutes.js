const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController')

const router = express.Router();

router.route('/signUp').post(authController.CreateUser);
router.route('/logIn').post(authController.login);
router.route('/update.password').patch(authController.protect, authController.updatePassword);

router.route('/reset.password/:token').post(authController.resetPassword);
router.route('/forget.password').post(authController.forgetPassword);

router.route('/updateMe').patch(authController.protect, userController.UpdateMe);
router.route('/deleteMe').delete(authController.protect, userController.deleteMe);
  

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
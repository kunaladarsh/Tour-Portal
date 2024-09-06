const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.route('/').get(viewController.getOverview);
router.route('/login').get(viewController.login);
router.route('/about').get(authController.protect, viewController.getAccount);

module.exports = router;
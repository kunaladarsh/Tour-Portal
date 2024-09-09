const Tour = require('../models/tourModel');
const { format, parseISO } = require('date-fns');
const axios = require('axios');

exports.getOverview = async (req, res) => {
    try {
        // const data = await Tour.find();
        // console.log(req.user);
        const res1 = await axios({
            method: 'GET',
            url: 'https://tour-portal.onrender.com/api/v1/tours',
        });

        res.status(200).render('overview', {
            title: "Exciting tours for adventurous people",
            tour: {
                data: res1.data.data.tour.tours
            }
        });
    }
    catch (err) {
        res.status(400).json({
            "message": 'Not Found'
      })
    }
}

exports.login = async (req, res) => {
    res.status(200).render('login', {
        "message": "Login Screen Open"
    });
};

exports.getAccount = (req, res) => {
    // let user =  req.user;
    res.status(200).render('account',
        {  // user: user,
            title: 'About'
        });
};


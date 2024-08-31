const Tour = require('../models/tourModel');
const { format, parseISO } = require('date-fns');

exports.getOverview = async(req, res) => {
    const data = await Tour.find();    

    res.status(200).render('overview', {
        tour: {
            title: "Exciting tours for adventurous people",
            data: data
        }
    });
};

exports.login = async(req, res) => {
    res.status(200).render('login', {
        "message": "Login Screen Open"
    });
};
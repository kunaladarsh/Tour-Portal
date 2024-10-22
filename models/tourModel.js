const mongoose = require('mongoose');
const { types } = require('util');
// const User = require('./../models/userModel');
const { type } = require('os');
const path = require('path');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'A tour must have a name'],
    unique: true,
    trim: true
  },
  durations: {
    type: Number,
    require: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    require: [true, 'A tour must have a group size']
  },
  difficulty: {
    type: String,
    require: [true, 'A tour must have a difficulty']
  },
  ratingAverage: {
    type: Number,
    default: 4.5
  },
  ratingQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    require: [true, 'A tour must have price']
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    require: [true, 'A tour must have summery']
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    require: [true, 'A tour must have cover Image']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date],
  secretTour: {
    // geoJson
    type: Boolean,
    default: false
  },
  startLocation: {
    type: {
      type: String, 
      default: 'Point',
      enum: ['Point']
    },
    coordinates:[Number], 
  },
  locations:[
    {
      type: {
        type: String, 
        default: 'Point',
        enum: ['Point']
      },
      coordinates:[Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'user', 
    }
  ]
});

// Ensure virtual fields are included when converting documents to JSON
tourSchema.set('toJSON', { virtuals: true });
tourSchema.set('toObject', { virtuals: true });



// virtual populated
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

//populate of guides filled data
tourSchema.pre(/^find/, function(next){
   this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
   next();
})

// Modelling Tour Guides Embedding
// tourSchema.pre('save', async function(next){
//    const guidesPromise = this.guides.map(async el => await User.findById(el));
//    this.guides = await Promise.all(guidesPromise)
//    next();
// });

// Create and export the model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour; // export
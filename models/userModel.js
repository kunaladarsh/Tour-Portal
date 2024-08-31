const mongoose = require('mongoose');
const validator = require('validators')
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'please tell us name'],
        trim: true,
    },
    email: {
        type: String,
        require: [true, 'Please enter your emailId'],
        unique: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /@gmail\.com$/.test(v);
            },
            message: props => `${props.value} is not a valid Gmail address!`
        }
    },
    age: {
        type: Number,
        require: [true, 'Please enter your age'],
        min: [18, 'User must be 18 years old'],
        max: [120, 'User not grater than 120 years old'],
    },
    photo: {
        type: String,
        require: [true, 'Please enter your photo'],
    },

    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user'
    },
    password: {
        type: String,
        require: [true, 'User must have a password'],
        min: [8, 'Password must be at least 8 characters'],
        max: [32, 'Password must not be more than 32 characters'],
        select: false
    },
    passwordConfirm: {
        type: String,
        require: [true, 'User must confirm password'],
        validate: {
            // This only works on create and save()
            validator: function (el) {
                return el === this.password
            },
            message: 'Passwords are not the same'
        },
    },
    passwordChangedAt: Date,
    resettoken: String,
    passwordValidationTime: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('find', function(next){
  this.find({ active: {$ne: false}});
  next();
});

userSchema.pre('save', async function(next){
    // only run this function if password was actually modified
    if(!this.isModified('password')) return next();
    
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // delete passwordconfirm password field
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword); 
};

userSchema.methods.changedPasswordAfter = async function(JWTTimestap){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000, 10
        );        
        return (changedTimestamp > JWTTimestap) // 400 < 200
    }

    // false means not chnaged
    return false;
};

userSchema.methods.forgetpassword = async function() {

    // generete random token string of crypto
    const token = crypto.randomBytes(32).toString('hex');
    
    // generete crypto hash of generete token
    this.resettoken = crypto.createHash('sha256').update(token).digest('hex');
    
    //generete password validated token time
    this.passwordValidationTime = Date.now() + 10 * 60 * 1000;

    return token; 
}

const user = mongoose.model('user', userSchema);

module.exports = user;
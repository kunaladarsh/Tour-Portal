const mongoose = require('mongoose');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { sendEmail } = require('./../utils/emails');
const crypto = require('crypto');

// create JWT Token
const signToken = id => {
    return jwt.sign({ id: id }, process.env.jwt_SECRET, { expiresIn: '1h' });
}

// sending JWT Token to user
const createSendToken = (res, user, statuscode, message) => {
    const token = signToken(user.email);
    const cookies = {
        expires: new Date(
            Date.now() + parseInt(process.env.jwt_COOKIE_EXPIRES) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Automatically set secure based on environment
    };

    res.cookie('jwt', token, cookies);

    // Remove password from output
    user.password = undefined;

    res.status(statuscode).json({
        token,
        status: 'Success',
        message: message,
        data: user
    });
};

// getting err or something wrong
const sendErrorMessage = (res, statuscode, message) => {
    res.status(statuscode).json({
        status: 'Fail',
        message: message,
    });
};

exports.CreateUser = async (req, res, next) => {
    try {
        const createUser = await User.create(req.body);

        // send JWT Token to client
        createSendToken(res, createUser, 200, 'Your account are created successfully');

    } catch (err) {
        sendErrorMessage(res, 404, "something worng")
    }
};

exports.login = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        // 1) check if email and password exit
        if (!email || !password) {
            return sendErrorMessage(res, 404, "Please enter email and password");
        };

        // 2) check if user exits and password is correct
        const user_data = await User.findOne({ email: email }).select('+password');

        if (!user_data || !await user_data.correctPassword(password, user_data.password)) {
            return sendErrorMessage(res, 401, "Incorrect email or password");
        }

        createSendToken(res, user_data, 200, 'you are login successfully');

    } catch (err) {
        console.log(err);
        return sendErrorMessage(res, 404, "Login Unsuccessfully");
    }
};

exports.protect = async (req, res, next) => {
    console.log("check protect middleware");
    let token;
    try {
        // 1) getting token and check of it's there
        if (req.headers.authorization && req.headers.authorization.includes('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return sendErrorMessage(res, 400, "you are not login please login to access..");
        }

        // 2) verification token
        // verify a token symmetric

        const decoded = await promisify(jwt.verify)(token, process.env.jwt_SECRET);

        // 3) check if user still exits
        const currentUser = await User.findOne({ email: decoded.id });
        if (!currentUser) {
            return sendErrorMessage(res, 401, "The user belonging to this token does no longer exits");
        }

        // 4)check if user changed password after the jwt was issused
        if (await currentUser.changedPasswordAfter(decoded.iat)) {
            return sendErrorMessage(res, 401, "user recently changed password! please login again");
        }

        // grant access to protected routes
        req.user = currentUser;

    } catch (err) {
        return sendErrorMessage(res, 401, "invalid token");
    }

    next();
};

exports.isLoggedIn = async (req, res, next) => {
    let decoded;
    try {
        if(req.cookies.jwt) {
            // 1) verification token
            decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.jwt_SECRET);
        };

        // 2) check if user still exits
        const currentUser = await User.findOne({ email: decoded.id });
        if (!currentUser) {
            return next();
        }

        // 4)check if user changed password after the jwt was issused
        if (await currentUser.changedPasswordAfter(decoded.iat)) {
            return next();
        }

        // There is logged in a user
        res.locals.user = currentUser;
        return next();

    } catch (err) {
        return next();
    }
};


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'lead-guide'], role='user'

        if (!roles.includes(req.user.role)) {
            return sendErrorMessage(res, 403, "you are not permission to access");
        }

        next();
    };
};


exports.forgetPassword = async (req, res) => {
    try {
        // 1) get user based on posted email
        const user = await User.findOne({ email: req.body.email });
        //if user does't exits

        if (!user) {
            return sendErrorMessage(res, 404, "user does't exits");
        }

        // 2) Generete the random reset token
        const resetToken = await user.forgetpassword();
        await user.save();

        // 3) send it to user's email
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/reset.password/${resetToken};`

        const message = `
        You have requested a password reset. Please click on the link below to reset your password:
        ${resetURL}`;

        const html = `
        <h1>Password Reset Request</h1>
        <p>Hello,</p>
        <p>You have requested a password reset. Please click on the link below to reset your password:</p>
        <a href="${resetURL}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thank you,<br>Your Company</p>
        `;

        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message: message,
            html: html
        });

        return res.status(200).json({ "status": "success", "message": "password sucessfully Forget.. Token will be send your email" });

    } catch (err) {
        return sendErrorMessage(res, 404, "get something wrong");
    }
};


exports.resetPassword = async (req, res) => {
    // get user based on token
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({ resettoken: hashedToken, passwordValidationTime: { $gte: Date.now() } });

        if (!user) {
            return sendErrorMessage(res, 404, "Token is invalid or has expired");
        }

        // 2) if token not expired and there is user, set the now new password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.resettoken = undefined;
        user.passwordValidationTime = undefined;
        await user.save();

        // 3) updated changepasswordAt property for the user
        await user.changedPasswordAfter(Date);

        // login the user in, send jwt
        createSendToken(res, user, 200, 'password sucessfully changed');

    } catch (err) {
        return sendErrorMessage(res, 404, "get something wrong");
    }
};


exports.updatePassword = async (req, res, next) => {
    try {
        // 1) get user from collections
        const user = await User.findOne({ email: req.user.email }).select('+password');

        // check if Posted current password is incorrect
        if (!user || !await user.correctPassword(req.body.password, user.password)) {
            return sendErrorMessage(res, 404, "Incorrect old password");
        }

        // if so, password upadate.
        user.password = req.body.newPassword;
        user.passwordConfirm = req.body.newPasswordConfirm;
        user.changedPasswordAfter = Date;
        await user.save();
        //User.findByIdAndUpdate will not work as intended!

        // login user in, send JWT
        createSendToken(res, user, 200, 'password sucessfully changed');

    } catch (err) {
        console.log(err);
        return sendErrorMessage(res, 404, "get something wrong");
    }
};

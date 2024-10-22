const mongoose = require('mongoose');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { sendEmail } = require('./../utils/emails');
const crypto = require('crypto');
const client = require('../redis');

const { UUIDV4 } = require('sequelize');
const { Domain } = require('domain');
const fs = require('fs');



// create access JWT Token
const signToken = id => {
   
    // create asymentic token 
    // const privateKey = fs.readFileSync('../private.key', 'utf8');
    // console.log(privateKey);
    // return jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '1h' });

    //  // Verify the JWT
    // const publicKey = fs.readFileSync('../public.key', 'utf8');
    // jwt.verify(req.cookies.jwt, publicKey, (err, decoded) => {
    //     if (err) {
    //         console.error('Token verification failed:', err);
    //     } else {
    //         console.log('Decoded payload:', decoded);
    //     }
    // });

    return jwt.sign({ id: id }, process.env.jwt_SECRET, { expiresIn: '15m' });


}
// create refresh JWT Token
const refreshToken = (id, sid) => {

    return jwt.sign({ id: id, sid: sid }, process.env.jwt_REFRESH_SECRET, { expiresIn: '7d' });
}

// sending JWT Token to user
const createSendToken = (res, user, sid, statuscode, message) => {
    const token = signToken(user.email);
    const refToken = refreshToken(user.email, sid);
    // JWT Access-Token
    const cookies = {
        expires: new Date(
            Date.now() + parseInt(process.env.jwt_COOKIE_EXPIRES) * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Automatically set secure based on environment
    };

    // JWT Refresh-Token
    const cookies_refresh = {
        expires: new Date(
            Date.now() + parseInt(process.env.jwt_REFRESH_COOKIE_EXPIRES) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Automatically set secure based on environment
    };

    // send througth cookies of Refresh-Token and Access-Token
    res.cookie('jwt', token, cookies);
    res.cookie('refreshJwt', refToken, cookies_refresh);

    // Remove password from output
    user.password = undefined;

    // send data when login the user
    if (message === "you are login successfully") {
        res.status(statuscode).json({
            token,
            status: 'Success',
            message: message,
            data: user
        });
    }
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

        // created session_id of every refreshToken
        const uuid = crypto.randomUUID()
        const sid = uuid.replace(/-/g, '');

        // store sid in redis servers
        // const result = await client.set(`sid.${email}`, sid, {
        //     EX: 3600 * 24 * 7 // 3600sec - 1hr 
        // });

        createSendToken(res, user_data, sid, 200, 'you are login successfully');

    } catch (err) {
        console.log(err);
        return sendErrorMessage(res, 404, "Login Unsuccessfully");
    }
};

exports.logOut = async (req, res, next) => {
    try {
        // delete the refresh-sessionid in redis
        if (req.cookies.refreshJwt) {
            //verification the refresh token 
            decoded = await promisify(jwt.verify)(req.cookies.refreshJwt, process.env.jwt_REFRESH_SECRET);

            // await client.del(`sid.${decoded.id}`);
        }

        // send token to client at token-validation-time is 4 sec
        const cookies = {
            expires: new Date(
                Date.now() + 5000
            ),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Automatically set secure based on environment
        };

        res.cookie('jwt', 'logout', cookies);
        res.cookie('refreshJwt', 'logout', cookies);


        res.status(200).json({
            status: 'Success',
            message: 'Successfully logged out.'
        });

    } catch (err) {
        // console.log(err);
        return sendErrorMessage(res, 400, "Logout failed.");
    }
};

exports.protect = async (req, res, next) => {
    console.log("check protect middleware");
    let token, refToken;

    // const publicKey = fs.readFileSync('../public.key', 'utf8');
    // jwt.verify(req.cookies.jwt, publicKey, (err, decoded) => {
    //     if (err) {
    //         console.error('Token verification failed:', err);
    //     } else {
    //         console.log('Decoded payload:', decoded);
    //     }
    // });
    
    try {
        // 1) getting token and check of it's there
        if (req.headers.authorization && req.headers.authorization.includes('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        } else if (req.cookies.refreshJwt) {
            refToken = req.cookies.refreshJwt;
        }

        if (!token & !refToken) {
            return sendErrorMessage(res, 400, "you are not login. please login");
        }

        // 2) verification token
        let decoded;
        if (token) {
            //verification the access token (when token are present)
            decoded = await promisify(jwt.verify)(token, process.env.jwt_SECRET);
        } else {
            //verification the refresh token 
            decoded = await promisify(jwt.verify)(refToken, process.env.jwt_REFRESH_SECRET);

            // check the refresh Token are vaild (using sessionid store in redis) 
            let refSessionid;
            // const refSessionid = await client.get(`sid.${decoded.id}`);

            if (!refSessionid || refSessionid !== decoded.sid) {
                return sendErrorMessage(res, 401, "Your session has expired. Please log in again.");
            }
        }

        // 3) check if user still exits
        const currentUser = await User.findOne({ email: decoded.id });
        if (!currentUser) {
            return sendErrorMessage(res, 401, "Your session has expired. Please log in again.");
        }

        // 4) check if user changed password after the jwt was issused
        if (await currentUser.changedPasswordAfter(decoded.iat)) {
            return sendErrorMessage(res, 401, "user recently changed password! please login again");
        }

        // send the new access-token and refresh-token
        if (refToken) {
            createSendToken(res, currentUser, 200, 'send access token');
        }

        // grant access to protected routes
        req.user = currentUser;
        // res.locals.user = currentUser;

    } catch (err) {
        console.log(err);
        return sendErrorMessage(res, 401, "invalid token");
    }

    next();
};


// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
    let decoded;
    try {
        if (req.cookies.jwt) {
            // 1) verification access token
            decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.jwt_SECRET);
        }
        else if (req.cookies.refreshJwt) {
            decoded = await promisify(jwt.verify)(req.cookies.refreshJwt, process.env.jwt_REFRESH_SECRET);
            const refSessionid = await client.get(`sid.${decoded.id}`);
            if (!refSessionid || refSessionid !== decoded.sid) {
                return next();
            }
        }

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
        createSendToken(res, user, 200, 'Password updated successfully');

    } catch (err) {
        console.log(err);
        return sendErrorMessage(res, 404, "get something wrong");
    }
};


const funSetData = async()=>{
        const email = 'aks@gmail.com';
        const sid = 7020022;
        //   store sid in redis servers
        // await client.set(`sid.${email}`, sid, {
        //     EX: 3600 * 24 * 7 // 3600sec - 1hr 
        // });
        console.log("set Data");
        const t1 = Date.now();
        console.log(t1);
        for (let i = 545; i<= 100550; i++) {
            const userDetails = { username: `sid:5000${i}`, role: 'student', semsester: '5', phone: `${i+ 9282928280}` };
            // Set user data in Redis using the username as the key
            await client.set(`Student:5000${i}`, JSON.stringify(userDetails), {
                EX: 30000  
            });

            // get Data
            // await client.get(`Student:5000${i}`);

            if(i === 10550){
                console.log(Date.now());
            }
           
        };

        const t2 = Date.now();
        console.log(t2);

};
funSetData();

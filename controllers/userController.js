const User = require('./../models/userModel');

// getting err or something wrong
const sendErrorMessage = (res, statuscode, message) => {
  res.status(statuscode).json({
      status: 'Fail',
      message: message,
  });
};

exports.UpdateMe = async (req, res, next) => {
  try {
    if (req.body.newPassword || req.body.newPasswordConfirm) {
      return sendErrorMessage(
          res, 400, 'This route is not for password updates. Please use /update.Password.'
        )
      };

    // user updated documents
    //build later(me)
    // filter the body req that confirm that user can't update like password, role and sentative info
    
   // if user Updating-email are same as current email address.
   if(req.user.email === req.body.email){
     return sendErrorMessage(res, 404, "Email Already in Use");
   }
   
   // if Updating-email are alredy registered
   const alreadyRegistered = await User.findOne({email: req.body.email});
   if(alreadyRegistered){
    return sendErrorMessage(res, 404, "Email address is already registered. Please enter a different email address");
   }

    // update user Name and email
    const user = req.user
    user.name = req.body.name;
    user.email = req.body.email;
    await user.save();

    res.status(200).json({
      status: 'Success',
      message: 'Updated successfully!',
    });

  } catch (err) {
    res.status(404).json({
      status: 'error',
      message: 'Updated Failed!'
    });
  }
};


exports.deleteMe = async (req, res) => {
  try {
    // Perform the update
    const result = await User.updateOne({ email: req.user.email }, {$set: {active: false} });

    // Successful update
    return res.status(204).json({
      status: 'success',
      message: 'User updated successfully'
    });
  } catch (error) {
    return res.status(404).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};


exports.getAllUsers = async(req, res) => {
try{
  const data = await User.find();

  res.status(200).json({
    status: 'success',
    message: 'okay!',
    data
  });
}catch(err){
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
}
};


exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
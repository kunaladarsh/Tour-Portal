const User = require('./../models/userModel');


exports.UpdateMe = async (req, res, next) => {
 console.log("welecome to updated me")
  try {
    // create error if user want to updated password
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(401).json({
        status: 'error',
        message: 'not permission to update password!'
      });
    };

    // user updated documents
    //build later(me)
    // filter the body req that confirm that user can't update like password, role and sentative info
        
    await User.updateOne({ email: req.user.email }, { $set: req.body });

    res.status(200).json({
      status: 'success',
      message: 'Updated successfull!'
    });

  } catch (err) {
    console.log(err)
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
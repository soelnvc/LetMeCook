const userService = require('../services/user.service');

const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateProfile(req.user.userId, req.body);
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

const getPublicProfile = async (req, res, next) => {
  try {
    const requesterId = req.user ? req.user.userId : null;
    const profile = await userService.getPublicProfile(req.params.username, requesterId);
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  getPublicProfile
};

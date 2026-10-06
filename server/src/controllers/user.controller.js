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

const exportUserData = async (req, res, next) => {
  try {
    const data = await userService.exportUserData(req.user.userId);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="letmecook-archive-${req.user.username || 'user'}-${Date.now()}.json"`
    );
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const deactivateAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const result = await userService.deactivateAccount(req.user.userId, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getSafetyLists = async (req, res, next) => {
  try {
    const data = await userService.getSafetyLists(req.user.userId);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const { username } = req.body;
    const blockedUsers = await userService.blockUser(req.user.userId, username);
    res.status(200).json({
      success: true,
      data: blockedUsers
    });
  } catch (error) {
    next(error);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const blockedUsers = await userService.unblockUser(req.user.userId, username);
    res.status(200).json({
      success: true,
      data: blockedUsers
    });
  } catch (error) {
    next(error);
  }
};

const restrictUser = async (req, res, next) => {
  try {
    const { username } = req.body;
    const restrictedUsers = await userService.restrictUser(req.user.userId, username);
    res.status(200).json({
      success: true,
      data: restrictedUsers
    });
  } catch (error) {
    next(error);
  }
};

const unrestrictUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const restrictedUsers = await userService.unrestrictUser(req.user.userId, username);
    res.status(200).json({
      success: true,
      data: restrictedUsers
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  getPublicProfile,
  exportUserData,
  deactivateAccount,
  getSafetyLists,
  blockUser,
  unblockUser,
  restrictUser,
  unrestrictUser
};

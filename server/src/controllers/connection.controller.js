const connectionService = require('../services/connection.service');

const sendRequest = async (req, res, next) => {
  try {
    const connection = await connectionService.sendConnectionRequest(req.user.userId, req.params.userId);
    res.status(201).json({
      success: true,
      data: connection
    });
  } catch (error) {
    next(error);
  }
};

const getConnections = async (req, res, next) => {
  try {
    const connections = await connectionService.getConnections(req.user.userId);
    res.status(200).json({
      success: true,
      data: connections
    });
  } catch (error) {
    next(error);
  }
};

const respond = async (req, res, next) => {
  try {
    const { status } = req.body;
    const connection = await connectionService.respondToConnection(req.params.id, req.user.userId, status);
    res.status(200).json({
      success: true,
      data: connection
    });
  } catch (error) {
    next(error);
  }
};

const block = async (req, res, next) => {
  try {
    const result = await connectionService.blockUser(req.user.userId, req.params.userId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendRequest,
  getConnections,
  respond,
  block
};

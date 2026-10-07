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

const getRequests = async (req, res, next) => {
  try {
    const requests = await connectionService.getConnectionRequests(req.user.userId);
    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

const respond = async (req, res, next) => {
  try {
    const status = req.body.status || req.body.action;
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

const getSentRequests = async (req, res, next) => {
  try {
    const requests = await connectionService.getSentConnectionRequests(req.user.userId);
    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

const removeConnection = async (req, res, next) => {
  try {
    await connectionService.removeConnection(req.user.userId, req.params.userId);
    res.status(200).json({
      success: true,
      message: 'Connection removed'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendRequest,
  getRequests,
  getSentRequests,
  getConnections,
  respond,
  removeConnection,
  block
};

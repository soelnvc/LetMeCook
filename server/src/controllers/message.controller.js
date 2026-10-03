const messageService = require('../services/message.service');

const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const message = await messageService.sendMessage(req.user.userId, receiverId, content);
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const conversations = await messageService.getConversations(req.user.userId);
    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const messages = await messageService.getMessages(req.user.userId, req.params.conversationId);
    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

const respondToRequest = async (req, res, next) => {
  try {
    const { status } = req.body;
    const result = await messageService.respondToMessageRequest(req.user.userId, req.params.conversationId, status);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  respondToRequest
};

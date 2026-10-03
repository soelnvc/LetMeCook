const Message = require('../models/Message');
const Connection = require('../models/Connection');

const getConversationId = (user1, user2) => {
  return [user1.toString(), user2.toString()].sort().join('_');
};

const sendMessage = async (senderId, receiverId, content) => {
  if (senderId.toString() === receiverId.toString()) {
    throw new Error('You cannot message yourself');
  }

  // Check blocking
  const connection = await Connection.findOne({
    $or: [
      { requester: senderId, recipient: receiverId },
      { requester: receiverId, recipient: senderId }
    ]
  });

  if (connection && connection.status === 'blocked') {
    throw new Error('Unable to send message to this user');
  }

  const conversationId = getConversationId(senderId, receiverId);

  // Check if there are existing messages in this conversation
  const previousMessage = await Message.findOne({ conversationId });

  let isRequest = false;
  let requestStatus = 'none';

  if (!previousMessage) {
    // If not already connected, treat first message as Message Request
    if (!connection || connection.status !== 'accepted') {
      isRequest = true;
      requestStatus = 'pending';
    }
  } else if (previousMessage.isRequest && previousMessage.requestStatus === 'rejected') {
    // If previous request was rejected, sender cannot repeatedly contact
    if (previousMessage.sender.toString() === senderId.toString()) {
      throw new Error('Your previous message request was declined by this user');
    }
  }

  const message = await Message.create({
    sender: senderId,
    receiver: receiverId,
    conversationId,
    content,
    isRequest,
    requestStatus
  });

  return message;
};

const getConversations = async (userId) => {
  const messages = await Message.find({
    $or: [{ sender: userId }, { receiver: userId }]
  })
    .sort({ createdAt: -1 })
    .populate('sender', 'username name avatar')
    .populate('receiver', 'username name avatar');

  const conversationMap = new Map();

  for (const msg of messages) {
    if (!conversationMap.has(msg.conversationId)) {
      const otherUser =
        msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
      conversationMap.set(msg.conversationId, {
        conversationId: msg.conversationId,
        user: otherUser,
        lastMessage: msg.content,
        updatedAt: msg.createdAt,
        isRequest: msg.isRequest && msg.requestStatus === 'pending',
        needsResponse:
          msg.isRequest &&
          msg.requestStatus === 'pending' &&
          msg.receiver._id.toString() === userId.toString()
      });
    }
  }

  return Array.from(conversationMap.values());
};

const getMessages = async (userId, conversationId) => {
  // Authorization: user must belong to conversationId
  const participants = conversationId.split('_');
  if (!participants.includes(userId.toString())) {
    throw new Error('Not authorized to access this conversation');
  }

  const messages = await Message.find({ conversationId })
    .populate('sender', 'username name avatar')
    .sort({ createdAt: 1 });

  return messages;
};

const respondToMessageRequest = async (userId, conversationId, status) => {
  if (!['accepted', 'rejected'].includes(status)) {
    throw new Error('Status must be either accepted or rejected');
  }

  const message = await Message.findOne({
    conversationId,
    receiver: userId,
    isRequest: true,
    requestStatus: 'pending'
  });

  if (!message) {
    throw new Error('No pending message request found for this conversation');
  }

  message.requestStatus = status;
  if (status === 'accepted') {
    message.isRequest = false;
  }
  await message.save();

  return { conversationId, requestStatus: status };
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  respondToMessageRequest
};

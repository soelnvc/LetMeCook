const mongoose = require('mongoose');
const Message = require('../models/Message');
const Connection = require('../models/Connection');
const User = require('../models/User');

const getConversationId = (user1, user2) => {
  return [user1.toString(), user2.toString()].sort().join('_');
};

const resolveReceiver = async (receiverIdOrUsername) => {
  if (!receiverIdOrUsername) return null;
  const isObjectId = mongoose.Types.ObjectId.isValid(receiverIdOrUsername);
  let user = null;
  if (isObjectId) {
    user = await User.findById(receiverIdOrUsername);
  }
  if (!user) {
    user = await User.findOne({ username: String(receiverIdOrUsername).toLowerCase() });
  }
  return user;
};

const sendMessage = async (senderId, receiverInput, content) => {
  const receiverUser = await resolveReceiver(receiverInput);
  if (!receiverUser) {
    throw new Error('Recipient user not found');
  }

  const receiverId = receiverUser._id;

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
  const existingMessages = await Message.find({ conversationId }).sort({ createdAt: 1 });
  const previousMessage = existingMessages[0];

  let isRequest = false;
  let requestStatus = 'none';

  if (!previousMessage) {
    // If not already connected, treat first message as Message Request
    if (!connection || connection.status !== 'accepted') {
      isRequest = true;
      requestStatus = 'pending';
    }
  } else {
    // Inherit the existing requestStatus
    requestStatus = previousMessage.requestStatus;
    isRequest = previousMessage.isRequest;

    if (requestStatus === 'rejected') {
      if (previousMessage.sender.toString() === senderId.toString()) {
        throw new Error('Your previous message request was declined by this user');
      }
    } else if (requestStatus === 'pending') {
      // Instagram Rule: Sender is strictly limited to 1 message until the recipient accepts
      const senderMessagesCount = existingMessages.filter(
        (m) => m.sender.toString() === senderId.toString()
      ).length;

      if (senderMessagesCount >= 1) {
        throw new Error(`Please wait for @${receiverUser.username} to accept your message request`);
      }
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

  return await message.populate('sender', 'username name avatar bio pronouns institute');
};

const getConversations = async (userId) => {
  const messages = await Message.find({
    $or: [{ sender: userId }, { receiver: userId }]
  })
    .sort({ createdAt: -1 })
    .populate('sender', 'username name avatar bio pronouns institute')
    .populate('receiver', 'username name avatar bio pronouns institute');

  const conversationMap = new Map();

  for (const msg of messages) {
    if (!conversationMap.has(msg.conversationId)) {
      const isSender = msg.sender._id.toString() === userId.toString();
      const otherUser = isSender ? msg.receiver : msg.sender;

      // Instagram Rule: Message requests ONLY appear in the "Requests" tab for the recipient!
      // For the sender, it appears in their primary Messages inbox with pending status.
      const isRecipientRequest =
        msg.isRequest && msg.requestStatus === 'pending' && !isSender;

      conversationMap.set(msg.conversationId, {
        conversationId: msg.conversationId,
        user: otherUser,
        lastMessage: { content: msg.content, createdAt: msg.createdAt },
        updatedAt: msg.createdAt,
        isRequest: isRecipientRequest,
        requestStatus: msg.requestStatus,
        requestSender: msg.sender?.username,
        needsResponse: isRecipientRequest
      });
    }
  }

  return Array.from(conversationMap.values());
};

const getMessages = async (userId, conversationId) => {
  // Authorization: user must belong to conversationId
  const participants = conversationId.split('_');
  if (participants.length === 2 && !participants.includes(userId.toString())) {
    throw new Error('Not authorized to access this conversation');
  }

  const messages = await Message.find({ conversationId })
    .populate('sender', 'username name avatar bio pronouns institute')
    .populate('receiver', 'username name avatar bio pronouns institute')
    .sort({ createdAt: 1 });

  return messages;
};

const respondToMessageRequest = async (userId, conversationId, status) => {
  if (!['accepted', 'rejected', 'blocked'].includes(status)) {
    throw new Error('Status must be accepted, rejected, or blocked');
  }

  const pendingMsg = await Message.findOne({
    conversationId,
    receiver: userId,
    requestStatus: 'pending'
  });

  if (!pendingMsg) {
    throw new Error('No pending message request found for this conversation');
  }

  if (status === 'accepted') {
    await Message.updateMany(
      { conversationId },
      { $set: { requestStatus: 'accepted', isRequest: false } }
    );
  } else if (status === 'rejected') {
    await Message.updateMany(
      { conversationId },
      { $set: { requestStatus: 'rejected' } }
    );
  } else if (status === 'blocked') {
    await Message.updateMany(
      { conversationId },
      { $set: { requestStatus: 'rejected' } }
    );
    // Block connection
    await Connection.findOneAndUpdate(
      {
        $or: [
          { requester: userId, recipient: pendingMsg.sender },
          { requester: pendingMsg.sender, recipient: userId }
        ]
      },
      { requester: userId, recipient: pendingMsg.sender, status: 'blocked' },
      { upsert: true }
    );
  }

  return { conversationId, requestStatus: status };
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  respondToMessageRequest,
  getConversationId
};

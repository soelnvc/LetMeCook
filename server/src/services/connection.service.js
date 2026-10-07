const Connection = require('../models/Connection');
const User = require('../models/User');

const sendConnectionRequest = async (requesterId, recipientId) => {
  if (requesterId.toString() === recipientId.toString()) {
    throw new Error('You cannot connect with yourself');
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new Error('Recipient user not found');
  }

  // Check if connection already exists
  let connection = await Connection.findOne({
    $or: [
      { requester: requesterId, recipient: recipientId },
      { requester: recipientId, recipient: requesterId }
    ]
  });

  if (connection) {
    if (connection.status === 'blocked') {
      throw new Error('Unable to send connection request');
    }
    if (connection.status === 'accepted') {
      throw new Error('Already connected with this user');
    }
    if (connection.status === 'pending') {
      throw new Error('Connection request already pending');
    }
    // If previously rejected or other status, reactivate as pending request
    connection.requester = requesterId;
    connection.recipient = recipientId;
    connection.status = 'pending';
    await connection.save();
  } else {
    connection = await Connection.create({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending'
    });
  }

  try {
    const Notification = require('../models/Notification');
    await Notification.create({
      recipient: recipientId,
      type: 'connection_request',
      actor: requesterId,
      reference: connection._id,
      metadata: { connectionId: connection._id }
    });
  } catch (notifErr) {
    console.error('Failed to create connection_request notification:', notifErr);
  }

  return connection;
};

const getConnectionRequests = async (userId) => {
  const requests = await Connection.find({
    recipient: userId,
    status: 'pending'
  })
    .populate('requester', 'username name avatar institute')
    .sort({ createdAt: -1 });

  return requests;
};

const getConnections = async (userId) => {
  const connections = await Connection.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: 'accepted'
  })
    .populate('requester', 'username name avatar institute')
    .populate('recipient', 'username name avatar institute');

  return connections.map((conn) => {
    const isRequester = conn.requester._id.toString() === userId.toString();
    return {
      connectionId: conn._id,
      user: isRequester ? conn.recipient : conn.requester,
      connectedAt: conn.updatedAt
    };
  });
};

const respondToConnection = async (connectionId, userId, responseStatus) => {
  const connection = await Connection.findById(connectionId);
  if (!connection) {
    throw new Error('Connection request not found');
  }

  if (connection.recipient.toString() !== userId.toString()) {
    throw new Error('Not authorized to respond to this connection request');
  }

  if (!['accepted', 'rejected'].includes(responseStatus)) {
    throw new Error('Invalid response status');
  }

  connection.status = responseStatus;
  await connection.save();

  if (responseStatus === 'accepted') {
    try {
      const Notification = require('../models/Notification');
      // "Pankaj has accepted your Connection request"
      await Notification.create({
        recipient: connection.requester,
        type: 'connection_accepted',
        actor: userId,
        reference: connection._id,
        metadata: { connectionId: connection._id }
      });
      // "Priya Gupta was added as your connection"
      await Notification.create({
        recipient: userId,
        type: 'connection_added',
        actor: connection.requester,
        reference: connection._id,
        metadata: { connectionId: connection._id }
      });
    } catch (notifErr) {
      console.error('Failed to create accepted notifications:', notifErr);
    }
  }

  return connection;
};

const blockUser = async (userId, targetUserId) => {
  if (userId.toString() === targetUserId.toString()) {
    throw new Error('You cannot block yourself');
  }

  let connection = await Connection.findOne({
    $or: [
      { requester: userId, recipient: targetUserId },
      { requester: targetUserId, recipient: userId }
    ]
  });

  if (connection) {
    connection.status = 'blocked';
    await connection.save();
  } else {
    connection = await Connection.create({
      requester: userId,
      recipient: targetUserId,
      status: 'blocked'
    });
  }

  return { blocked: true };
};

const getSentConnectionRequests = async (userId) => {
  const requests = await Connection.find({
    requester: userId,
    status: 'pending'
  })
    .populate('recipient', 'username name avatar institute')
    .sort({ createdAt: -1 });

  return requests;
};

const removeConnection = async (userId, targetUserId) => {
  const connection = await Connection.findOneAndDelete({
    $or: [
      { requester: userId, recipient: targetUserId },
      { requester: targetUserId, recipient: userId }
    ]
  });
  return { success: true };
};

module.exports = {
  sendConnectionRequest,
  getConnectionRequests,
  getSentConnectionRequests,
  getConnections,
  respondToConnection,
  removeConnection,
  blockUser
};

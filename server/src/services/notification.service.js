const Notification = require('../models/Notification');

const createNotification = async ({ recipient, type, actor, reference, metadata }) => {
  const notification = await Notification.create({
    recipient,
    type,
    actor: actor || null,
    reference: reference || null,
    metadata: metadata || {}
  });
  return notification;
};

const getNotifications = async (userId) => {
  const notifications = await Notification.find({ recipient: userId })
    .populate('actor', 'username name avatar')
    .sort({ createdAt: -1 })
    .limit(50);
  return notifications;
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { $set: { read: true } },
    { new: true }
  );
  if (!notification) {
    throw new Error('Notification not found');
  }
  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ recipient: userId, read: false }, { $set: { read: true } });
  return { success: true };
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead
};

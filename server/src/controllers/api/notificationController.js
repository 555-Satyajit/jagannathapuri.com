const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const webpush = require('web-push');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.subscribeToPush = async (req, res) => {
  try {
    const subscription = req.body;
    
    // Check if subscription already exists by endpoint
    let pushSub = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint }
    });

    if (!pushSub) {
      pushSub = await prisma.pushSubscription.create({
        data: {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      });
    }

    res.status(201).json({ success: true, message: 'Subscribed to push notifications' });
  } catch (error) {
    console.error('Error subscribing to push:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.body;
    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.broadcastPushNotification = async (title, message, link) => {
  try {
    const subscriptions = await prisma.pushSubscription.findMany();
    
    // Fetch site config for favicon
    const config = await prisma.siteConfig.findUnique({ where: { key: 'seo' } });
    let iconUrl = '/window.svg';
    if (config && config.value && config.value.favicon) {
      iconUrl = process.env.API_URL ? `${process.env.API_URL}${config.value.favicon}` : `http://localhost:5000${config.value.favicon}`;
    }

    const payload = JSON.stringify({ 
      title, 
      message, 
      url: link,
      icon: iconUrl
    });
    
    const promises = subscriptions.map(sub => 
      webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      }, payload).catch(err => {
        // If subscription is gone, remove it
        if (err.statusCode === 410 || err.statusCode === 404) {
          return prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
        console.error('Error sending push:', err);
      })
    );
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Error broadcasting push:', error);
  }
};

// ============================================
// FIREBASE PUSH NOTIFICATIONS SETUP
// ============================================

// 1. Install dependencies
// npm install expo-notifications firebase

// 2. src/services/pushNotifications.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export async function registerForPushNotifications() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push Token:', token);

    // Save token to backend
    try {
      await api.post('/users/push-token', { pushToken: token });
    } catch (error) {
      console.error('Failed to save push token:', error);
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

// Listen to notifications
export function setupNotificationListeners(navigation) {
  // Handle notification when app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received:', notification);
    }
  );

  // Handle notification tap
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;
      
      // Navigate based on notification type
      if (data.type === 'order') {
        navigation.navigate('OrderTracking', { orderId: data.orderId });
      } else if (data.type === 'restaurant_order') {
        navigation.navigate('RestaurantOrders', { restaurantId: data.restaurantId });
      } else if (data.type === 'delivery') {
        navigation.navigate('DeliveryScreen', { orderId: data.orderId });
      }
    }
  );

  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}

// Send local notification (for testing)
export async function sendLocalNotification(title, body, data = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Send immediately
  });
}

// ============================================
// BACKEND - Send Push Notifications
// ============================================

// backend/utils/pushNotifications.js
const { Expo } = require('expo-server-sdk');
const User = require('../models/User');

const expo = new Expo();

// Add pushToken field to User model
// pushToken: { type: String, default: null }

async function sendPushNotification(userId, title, body, data = {}) {
  try {
    const user = await User.findById(userId);
    
    if (!user || !user.pushToken) {
      console.log('No push token for user:', userId);
      return;
    }

    if (!Expo.isExpoPushToken(user.pushToken)) {
      console.error('Invalid Expo push token:', user.pushToken);
      return;
    }

    const message = {
      to: user.pushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      badge: 1,
    };

    const ticket = await expo.sendPushNotificationsAsync([message]);
    console.log('Push notification sent:', ticket);
    
    return ticket;
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

// Send to multiple users
async function sendBulkPushNotifications(userIds, title, body, data = {}) {
  try {
    const users = await User.find({ _id: { $in: userIds }, pushToken: { $ne: null } });
    
    const messages = users
      .filter(user => Expo.isExpoPushToken(user.pushToken))
      .map(user => ({
        to: user.pushToken,
        sound: 'default',
        title,
        body,
        data,
      }));

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    console.log('Bulk notifications sent:', tickets.length);
    return tickets;
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
  }
}

module.exports = {
  sendPushNotification,
  sendBulkPushNotifications,
};

// ============================================
// USAGE EXAMPLES
// ============================================

// In orderController.js - When order is placed
const { sendPushNotification } = require('../utils/pushNotifications');

exports.createOrder = async (req, res) => {
  // ... create order logic
  
  // Send notification to restaurant
  const restaurant = await Restaurant.findById(restaurantId).populate('ownerId');
  await sendPushNotification(
    restaurant.ownerId._id,
    'New Order! 🎉',
    `Order #${order._id.slice(-6)} received`,
    { type: 'restaurant_order', orderId: order._id }
  );
  
  // ... rest of code
};

// When order status changes
await sendPushNotification(
  order.userId,
  'Order Update',
  `Your order is now ${order.status}`,
  { type: 'order', orderId: order._id }
);

// ============================================
// IN APP.JS - Initialize notifications
// ============================================

import { registerForPushNotifications, setupNotificationListeners } from './src/services/pushNotifications';

function App() {
  const navigationRef = useRef();

  useEffect(() => {
    registerForPushNotifications();
    
    const cleanup = setupNotificationListeners(navigationRef.current);
    return cleanup;
  }, []);

  return (
    // ... rest of app
  );
}
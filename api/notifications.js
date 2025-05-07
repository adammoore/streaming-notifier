/**
 * Web Push Notifications API Handler
 * 
 * This serverless function handles sending web push notifications to users.
 * It uses the web-push library and VAPID keys for authentication.
 * 
 * @see https://developers.google.com/web/fundamentals/push-notifications
 */
import webpush from 'web-push';

// Configure the web-push library with VAPID details
// VAPID (Voluntary Application Server Identification) is used to identify the sender
webpush.setVapidDetails(
  'mailto:moore.adam@gmail.com', // Contact email for the push service
  process.env.VAPID_PUBLIC_KEY,  // Public key used by the browser to authenticate the sender
  process.env.VAPID_PRIVATE_KEY  // Private key used to sign push messages
);

/**
 * API handler for sending push notifications
 * 
 * @param {Object} req - The HTTP request object
 * @param {Object} req.body - Request body containing subscription and notification data
 * @param {Object} req.body.subscription - The push subscription object from the browser
 * @param {Object} req.body.notification - The notification payload to send
 * @param {Object} res - The HTTP response object
 */
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { subscription, notification } = req.body;
    
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify(notification)
      );
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send notification' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:moore.adam@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

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

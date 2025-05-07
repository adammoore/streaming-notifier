/**
 * Dynamic Manifest.json API Route
 * 
 * This serverless function generates and serves the web app manifest dynamically.
 * It ensures the manifest is always served with the correct content type headers,
 * which solves issues with static file serving on some hosting platforms.
 * 
 * For more information on Web App Manifests, see:
 * @see https://developer.mozilla.org/en-US/docs/Web/Manifest
 * 
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 */
export default function handler(req, res) {
  // Set the correct content type for JSON to ensure browsers recognize it as a manifest
  res.setHeader('Content-Type', 'application/json');
  
  // Disable caching to ensure latest version is always served
  // This is important for PWA updates to be recognized quickly
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // Return the manifest content
  res.json({
    "name": "UK Streaming Notifier",
    "short_name": "StreamNotify",
    "description": "Get notified when new episodes and movies are available",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#4f46e5",
    "orientation": "portrait",
    "icons": [
      {
        "src": "/icons/icon-72x72.png",
        "sizes": "72x72",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-96x96.png",
        "sizes": "96x96",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-128x128.png",
        "sizes": "128x128",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-144x144.png",
        "sizes": "144x144",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-152x152.png",
        "sizes": "152x152",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-384x384.png",
        "sizes": "384x384",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ]
  });
}
/**
 * Dynamic Image Placeholder API
 * 
 * This serverless function generates SVG placeholders for missing images.
 * It's particularly useful when movie/TV show posters are not available from TMDB.
 * 
 * @param {Object} req - The HTTP request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.width - The desired width of the placeholder (default: 150)
 * @param {string} req.query.height - The desired height of the placeholder (default: 225)
 * @param {Object} res - The HTTP response object
 */
export default function handler(req, res) {
  // Extract dimensions from query parameters
  const { width, height } = req.query;
  
  // Set content type to SVG to ensure proper rendering
  res.setHeader('Content-Type', 'image/svg+xml');
  
  // Create a simple SVG placeholder
  const svg = `<svg width="${width || 150}" height="${height || 225}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#2d3748"/>
    <text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">No Image</text>
  </svg>`;
  
  res.status(200).send(svg);
}
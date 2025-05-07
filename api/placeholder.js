export default function handler(req, res) {
  const { width, height } = req.query;
  
  // Set content type to svg
  res.setHeader('Content-Type', 'image/svg+xml');
  
  // Create a simple SVG placeholder
  const svg = `<svg width="${width || 150}" height="${height || 225}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#2d3748"/>
    <text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">No Image</text>
  </svg>`;
  
  res.status(200).send(svg);
}
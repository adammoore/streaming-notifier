/**
 * TMDB API Proxy Handler
 * 
 * This serverless function acts as a proxy to The Movie Database (TMDB) API.
 * It securely forwards requests while keeping the API key on the server side.
 * 
 * @param {Object} req - The HTTP request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.endpoint - The TMDB API endpoint to call (e.g., 'movie/upcoming')
 * @param {Object} req.query.params - Additional parameters to pass to the TMDB API
 * @param {Object} res - The HTTP response object
 */
export default async function handler(req, res) {
  // Extract the endpoint and other params from the request query
  const { endpoint, ...params } = req.query;
  
  // Get the TMDB API key from environment variables
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  
  // Validate the API key is available
  if (!TMDB_API_KEY) {
    return res.status(500).json({ error: 'TMDB API key is not configured' });
  }
  
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('api_key', TMDB_API_KEY);
    
    // Handle nested params (like params[query])
    Object.entries(params).forEach(([key, value]) => {
      if (key.startsWith('params[') && key.endsWith(']')) {
        const paramName = key.slice(7, -1);
        queryParams.append(paramName, value);
      } else {
        queryParams.append(key, value);
      }
    });
    
    const response = await fetch(
      `https://api.themoviedb.org/3/${endpoint}?${queryParams.toString()}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('TMDB API error:', error);
    res.status(500).json({ error: 'Failed to fetch from TMDB', details: error.message });
  }
}

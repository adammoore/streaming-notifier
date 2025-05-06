export default async function handler(req, res) {
  const { endpoint, ...params } = req.query;
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  
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
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from TMDB' });
  }
}

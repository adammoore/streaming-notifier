// src/components/StreamingNotifier.js
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Trash2, Check, AlertCircle, Film, RefreshCw, Search, Video, Tv } from 'lucide-react';

// UK Streaming Services with TMDB Watch Provider IDs
const streamingServices = [
  { id: 'netflix', name: 'Netflix', color: 'bg-red-600', tmdbId: 8 },
  { id: 'prime', name: 'Amazon Prime Video', color: 'bg-indigo-600', tmdbId: 9 },
  { id: 'disney', name: 'Disney+', color: 'bg-blue-600', tmdbId: 337 },
  { id: 'apple', name: 'Apple TV+', color: 'bg-gray-900', tmdbId: 350 },
  { id: 'bbc', name: 'BBC iPlayer', color: 'bg-black', tmdbId: 38 },
  { id: 'paramount', name: 'Paramount+', color: 'bg-blue-500', tmdbId: 531 },
  { id: 'all', name: 'All Services', color: 'bg-gray-500', tmdbId: 'all' }
];

const StreamingNotifier = () => {
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [contentType, setContentType] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [pushSubscription, setPushSubscription] = useState(null);

  // Initialize push notifications
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          if (subscription) {
            setPushSubscription(subscription);
          }
        });
      });
    }
  }, []);

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        subscribeToNotifications();
      }
    }
  };

  // Subscribe to push notifications
  const subscribeToNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VAPID_PUBLIC_KEY || process.env.REACT_APP_VAPID_PUBLIC_KEY
      });
      
      setPushSubscription(subscription);
      
      // Send subscription to backend
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription,
          notification: {
            title: 'Notifications Enabled',
            body: 'You will now receive updates about your watchlist'
          }
        })
      });
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
    }
  };

  // Search TMDB via our API route
  const searchTMDB = async (query) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/tmdb?endpoint=search/multi&params[query]=${encodeURIComponent(query)}&params[region]=GB`);
      const data = await response.json();
      
      if (data.results) {
        const filteredResults = data.results
          .filter(item => 
            (item.media_type === 'tv' || item.media_type === 'movie') &&
            (contentType === 'all' || item.media_type === contentType)
          )
          .map(item => ({
            id: item.id,
            title: item.media_type === 'tv' ? item.name : item.title,
            mediaType: item.media_type,
            posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/api/placeholder/150/225',
            overview: item.overview,
            firstAirDate: item.first_air_date,
            releaseDate: item.release_date,
            status: item.status
          }));
        
        // Fetch providers for each result
        for (let result of filteredResults) {
          const providersResponse = await fetch(
            `/api/tmdb?endpoint=${result.mediaType}/${result.id}/watch/providers`
          );
          const providersData = await providersResponse.json();
          
          if (providersData.results?.GB?.flatrate) {
            result.providers = providersData.results.GB.flatrate
              .map(provider => {
                const service = streamingServices.find(s => s.tmdbId === provider.provider_id);
                return service ? service.id : null;
              })
              .filter(Boolean);
          } else {
            result.providers = [];
          }
        }
        
        setSearchResults(filteredResults);
      }
    } catch (err) {
      setError('Failed to search TMDB. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch upcoming movies
  const fetchUpcomingMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tmdb?endpoint=movie/upcoming&params[region]=GB');
      const data = await response.json();
      
      if (data.results) {
        const movies = data.results.map(movie => ({
          id: movie.id,
          title: movie.title,
          mediaType: 'movie',
          posterPath: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/api/placeholder/150/225',
          overview: movie.overview,
          releaseDate: movie.release_date,
          status: 'Upcoming'
        }));
        
        setUpcomingMovies(movies);
      }
    } catch (err) {
      setError('Failed to fetch upcoming movies');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchTMDB(searchQuery);
    }
  };

  const addToWatchlist = async (item) => {
    let nextEpisode = null;
    
    // Fetch next episode info for TV shows
    if (item.mediaType === 'tv') {
      try {
        const response = await fetch(`/api/tmdb?endpoint=tv/${item.id}`);
        const data = await response.json();
        
        if (data.next_episode_to_air) {
          nextEpisode = {
            airDate: data.next_episode_to_air.air_date,
            episodeNumber: data.next_episode_to_air.episode_number,
            seasonNumber: data.next_episode_to_air.season_number,
            name: data.next_episode_to_air.name
          };
        }
      } catch (err) {
        console.error('Failed to fetch next episode info:', err);
      }
    }
    
    const watchlistItem = {
      id: Date.now(),
      tmdbId: item.id,
      title: item.title,
      mediaType: item.mediaType,
      posterPath: item.posterPath,
      providers: item.providers || [],
      nextEpisode,
      releaseDate: item.releaseDate,
      status: item.status,
      notified: false,
      lastChecked: new Date().toISOString()
    };
    
    setWatchlist([...watchlist, watchlistItem]);
  };

  const removeFromWatchlist = (id) => {
    setWatchlist(watchlist.filter(item => item.id !== id));
  };

  // Using useCallback to fix the dependency issue
  const checkForUpdates = useCallback(async () => {
    setLoading(true);
    
    try {
      for (const item of watchlist) {
        if (item.mediaType === 'tv') {
          const response = await fetch(`/api/tmdb?endpoint=tv/${item.tmdbId}`);
          const data = await response.json();
          
          if (data.next_episode_to_air) {
            const nextEpisode = {
              airDate: data.next_episode_to_air.air_date,
              episodeNumber: data.next_episode_to_air.episode_number,
              seasonNumber: data.next_episode_to_air.season_number,
              name: data.next_episode_to_air.name
            };
            
            // Check if there's a new episode
            if (!item.nextEpisode || 
                (item.nextEpisode.airDate !== nextEpisode.airDate || 
                 item.nextEpisode.episodeNumber !== nextEpisode.episodeNumber)) {
              
              const today = new Date();
              const airDate = new Date(nextEpisode.airDate);
              
              if (airDate <= today && !item.notified) {
                const notification = {
                  title: 'New Episode Available',
                  body: `${item.title} S${nextEpisode.seasonNumber}E${nextEpisode.episodeNumber} is now available!`
                };
                
                setNotifications(prev => [...prev, {
                  id: Date.now(),
                  message: notification.body,
                  timestamp: new Date().toLocaleTimeString(),
                  item: item
                }]);
                
                // Send push notification
                if (pushSubscription) {
                  await fetch('/api/notifications', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      subscription: pushSubscription,
                      notification
                    })
                  });
                }
              }
            }
          }
        } else if (item.mediaType === 'movie' && !item.providers.length) {
          // Check if movie is now available on streaming
          const response = await fetch(`/api/tmdb?endpoint=movie/${item.tmdbId}/watch/providers`);
          const data = await response.json();
          
          if (data.results?.GB?.flatrate) {
            const providers = data.results.GB.flatrate
              .map(provider => {
                const service = streamingServices.find(s => s.tmdbId === provider.provider_id);
                return service ? service.id : null;
              })
              .filter(Boolean);
            
            if (providers.length > 0 && !item.notified) {
              const notification = {
                title: 'Movie Now Available',
                body: `${item.title} is now available on ${providers.map(p => streamingServices.find(s => s.id === p)?.name).join(', ')}!`
              };
              
              setNotifications(prev => [...prev, {
                id: Date.now(),
                message: notification.body,
                timestamp: new Date().toLocaleTimeString(),
                item: item
              }]);
              
              // Send push notification
              if (pushSubscription) {
                await fetch('/api/notifications', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    subscription: pushSubscription,
                    notification
                  })
                });
              }
            }
          }
        }
      }
    } catch (err) {
      setError('Failed to check for updates');
    } finally {
      setLoading(false);
    }
  }, [watchlist, pushSubscription, setNotifications, setError, setLoading]);

  useEffect(() => {
    if (activeTab === 'upcoming') {
      fetchUpcomingMovies();
    }
  }, [activeTab]);

  // Check for updates periodically - now with proper dependency
  useEffect(() => {
    const interval = setInterval(checkForUpdates, 60 * 60 * 1000); // Every hour
    return () => clearInterval(interval);
  }, [checkForUpdates]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Streaming Notifier</h1>
                <p className="text-sm text-gray-600">Powered by TMDB</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!pushSubscription && (
                <button
                  onClick={requestNotificationPermission}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <Bell className="w-5 h-5" />
                  Enable Notifications
                </button>
              )}
              <button
                onClick={checkForUpdates}
                disabled={loading}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Check Updates
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-5 h-5" />
                Add Content
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-4 border-b">
            <button
              onClick={() => setActiveTab('search')}
              className={`pb-2 px-4 ${activeTab === 'search' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
            >
              Search Content
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-2 px-4 ${activeTab === 'upcoming' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
            >
              Upcoming Movies
            </button>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-green-800 mb-3">New Updates</h2>
            <div className="space-y-2">
              {notifications.map(notification => (
                <div key={notification.id} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-800">{notification.message}</span>
                    <span className="text-sm text-gray-500">{notification.timestamp}</span>
                  </div>
                  <button
                    onClick={() => setNotifications(notifications.filter(n => n.id !== notification.id))}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Form */}
        {showForm && activeTab === 'search' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Search Content</h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Search for TV shows or movies..."
                  />
                </div>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Types</option>
                  <option value="tv">TV Shows</option>
                  <option value="movie">Movies</option>
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map(result => (
                  <div key={result.id} className="bg-gray-50 rounded-lg p-4 flex gap-4">
                    <img
                      src={result.posterPath}
                      alt={result.title}
                      className="w-24 h-36 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {result.mediaType === 'tv' ? (
                          <Tv className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Video className="w-4 h-4 text-gray-600" />
                        )}
                        <h4 className="font-semibold text-gray-900">{result.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{result.overview}</p>
                      <div className="mt-2 space-y-1">
                        {result.providers && result.providers.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {result.providers.map(providerId => {
                              const provider = streamingServices.find(s => s.id === providerId);
                              return (
                                <span
                                  key={providerId}
                                  className={`px-2 py-1 text-xs text-white rounded ${provider?.color}`}
                                >
                                  {provider?.name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {result.mediaType === 'tv' && result.nextEpisode && (
                          <p className="text-sm text-gray-600">
                            Next: S{result.nextEpisode.seasonNumber}E{result.nextEpisode.episodeNumber} 
                            ({new Date(result.nextEpisode.airDate).toLocaleDateString('en-GB')})
                          </p>
                        )}
                        {result.mediaType === 'movie' && result.releaseDate && (
                          <p className="text-sm text-gray-600">
                            Release: {new Date(result.releaseDate).toLocaleDateString('en-GB')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => addToWatchlist(result)}
                        className="mt-3 w-full bg-indigo-600 text-white py-1 px-3 rounded text-sm hover:bg-indigo-700 transition"
                        disabled={watchlist.some(item => item.tmdbId === result.id)}
                      >
                        {watchlist.some(item => item.tmdbId === result.id) ? 'Added' : 'Add to Watchlist'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upcoming Movies */}
        {activeTab === 'upcoming' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Movies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMovies.map(movie => (
                <div key={movie.id} className="bg-gray-50 rounded-lg p-4 flex gap-4">
                  <img
                    src={movie.posterPath}
                    alt={movie.title}
                    className="w-24 h-36 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{movie.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{movie.overview}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Release: {new Date(movie.releaseDate).toLocaleDateString('en-GB')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: {movie.status}
                    </p>
                    <button
                      onClick={() => addToWatchlist(movie)}
                      className="mt-3 w-full bg-indigo-600 text-white py-1 px-3 rounded text-sm hover:bg-indigo-700 transition"
                      disabled={watchlist.some(item => item.tmdbId === movie.id)}
                    >
                      {watchlist.some(item => item.tmdbId === movie.id) ? 'Watching' : 'Watch for Availability'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Watchlist */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Watchlist</h2>
          {watchlist.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Film className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Your watchlist is empty</p>
              <p className="text-sm">Add content to get notifications</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlist.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4 flex gap-4">
                  <img
                    src={item.posterPath}
                    alt={item.title}
                    className="w-24 h-36 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {item.mediaType === 'tv' ? (
                          <Tv className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Video className="w-4 h-4 text-gray-600" />
                        )}
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      </div>
                      <button
                        onClick={() => removeFromWatchlist(item.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="mt-2 space-y-2">
                      {item.providers && item.providers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.providers.map(providerId => {
                            const provider = streamingServices.find(s => s.id === providerId);
                            return (
                              <span
                                key={providerId}
                                className={`px-2 py-1 text-xs text-white rounded ${provider?.color}`}
                              >
                                {provider?.name}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {item.mediaType === 'tv' && item.nextEpisode && (
                        <p className="text-sm text-gray-600">
                          Next: S{item.nextEpisode.seasonNumber}E{item.nextEpisode.episodeNumber}
                          <br />
                          {new Date(item.nextEpisode.airDate).toLocaleDateString('en-GB')}
                        </p>
                      )}
                      {item.mediaType === 'movie' && (
                        <p className="text-sm text-gray-600">
                          {item.providers.length === 0 ? 'Watching for availability' : 'Available now'}
                          {item.releaseDate && <br />}
                          {item.releaseDate && `Release: ${new Date(item.releaseDate).toLocaleDateString('en-GB')}`}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Last checked: {new Date(item.lastChecked).toLocaleString('en-GB')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PWA Install Prompt */}
        <div className="mt-6 bg-indigo-50 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2 text-indigo-900">Install App</h2>
          <p className="text-indigo-800 mb-4">Install this app on your device for the best experience and notifications.</p>
          <div className="flex gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-indigo-900 mb-2">For iPhone:</h3>
              <ol className="text-sm text-indigo-800 list-decimal list-inside space-y-1">
                <li>Tap the Share button</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add"</li>
              </ol>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-indigo-900 mb-2">For Android:</h3>
              <ol className="text-sm text-indigo-800 list-decimal list-inside space-y-1">
                <li>Tap the menu (three dots)</li>
                <li>Tap "Add to Home screen"</li>
                <li>Tap "Add"</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingNotifier;

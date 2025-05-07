# UK Streaming Notifier

A Progressive Web App (PWA) that notifies you when new episodes of your favorite TV shows and movies become available on UK streaming services. Stay up-to-date with releases across multiple platforms in one convenient place.

## Features

- 🔍 **Search Content**: Find TV shows and movies across multiple streaming platforms
- 🔔 **Push Notifications**: Get alerts when new episodes or movies are available
- 📅 **Release Tracking**: Monitor upcoming movie releases
- 📱 **PWA Support**: Install as an app on mobile and desktop devices
- 🌐 **Offline Capability**: Basic functionality works without an internet connection
- 📊 **Multi-Platform**: Supports Netflix, Amazon Prime Video, Disney+, Apple TV+, BBC iPlayer, and Paramount+

## Live Demo

Visit the live application at: [https://streaming-notifier.vercel.app](https://streaming-notifier.vercel.app)

## Screenshots

![Application Screenshot](https://raw.githubusercontent.com/adammoore/streaming-notifier/main/public/icons/icon-512x512.png)

## Setup

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher
- TMDB API key (sign up at [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup))
- VAPID keys for push notifications (can be generated with the web-push library)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/adammoore/streaming-notifier.git
   cd streaming-notifier
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your API keys:
   ```
   REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key
   TMDB_API_KEY=your_tmdb_api_key
   VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   ```

4. Start the development server
   ```bash
   npm start
   ```

5. The application will be available at `http://localhost:3000`

## Deployment

The application is configured for easy deployment to Vercel:

1. Fork this repository
2. Connect your fork to Vercel
3. Set the following environment variables in the Vercel dashboard:
   - `TMDB_API_KEY`: Your TMDB API key
   - `VAPID_PUBLIC_KEY`: Your VAPID public key
   - `VAPID_PRIVATE_KEY`: Your VAPID private key
   - `REACT_APP_VAPID_PUBLIC_KEY`: Same as your VAPID public key

## Architecture

This project uses:

- **React**: Frontend UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Vercel API Routes**: Serverless functions for API endpoints
- **The Movie Database API**: Source of movie and TV show data
- **Web Push API**: For sending push notifications

## Project Structure

```
├── api/                  # Vercel API routes
│   ├── manifest.js       # API endpoint for manifest.json
│   ├── notifications.js  # API for push notifications
│   ├── placeholder.js    # Image placeholder generator
│   └── tmdb.js           # TMDB API proxy
├── public/               # Static assets
│   ├── icons/            # App icons for various sizes
│   ├── index.html        # HTML entry point
│   ├── manifest.json     # PWA manifest
│   └── service-worker.js # Service worker for offline support
└── src/                  # React application source
    ├── components/       # React components
    ├── App.js            # Main App component
    └── index.js          # React entry point
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for their comprehensive API
- [Lucide Icons](https://lucide.dev/) for the beautiful icon set
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

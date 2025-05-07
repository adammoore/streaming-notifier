// Redirect legacy service worker requests
if (navigator.serviceWorker) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed: ', error);

        // If the service worker fails to load the first time, try one more time
        // This helps if there's a caching issue
        setTimeout(() => {
          navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
              console.log('ServiceWorker retry successful with scope: ', registration.scope);
            })
            .catch(retryError => {
              console.error('ServiceWorker retry also failed: ', retryError);
            });
        }, 3000);
      });
  });
}
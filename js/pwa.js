// Registrasi Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('[PWA] SW registered, scope:', reg.scope))
      .catch((err) => console.warn('[PWA] SW registration failed:', err));
  });
}

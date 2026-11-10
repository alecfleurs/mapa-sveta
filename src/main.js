// ===== Pokretanje =====
show('home');
welcome();
if ('serviceWorker' in navigator && location.protocol === 'https:' && !window.NO_SW) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

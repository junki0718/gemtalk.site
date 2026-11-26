const firebaseConfig = {
  apiKey: 'AIzaSyBvUv_4-d7d-8BGfiGam4Y_AJjiGAucktU',
  projectId: 'gemtalksite',
  appId: '1:475864689095:web:d49f58f9b5597e7e4ad1e2',
  measurementId: 'G-ENXM5TXSE1',
};

if (window.location.hostname === 'jk0718.gemtalk.site') {
  try {
    const [{ initializeApp }, { getAnalytics, isSupported }] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/13.4.0/firebase-analytics.js'),
    ]);

    if (await isSupported()) {
      getAnalytics(initializeApp(firebaseConfig));
    }
  } catch (error) {
    console.warn('Firebase Analytics could not start.', error);
  }
}

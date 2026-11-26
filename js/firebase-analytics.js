const firebaseConfig = {
  apiKey: 'AIzaSyCnigbnykLGSouzKoI0RhSsDlH12NOHVOo',
  projectId: 'gemtalksite1',
  appId: '1:1039814011961:web:ef5ff70e8cb64fd914b1e8',
  measurementId: 'G-P2HM5J8QWB',
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

/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

let messaging = null;

const initMessaging = (config) => {
  if (!config || !config.apiKey) return;

  if (!firebase.apps.length) {
    firebase.initializeApp(config);
  }

  if (!messaging) {
    messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      const title = payload?.notification?.title || "SamarthAI Dispatch";
      const options = {
        body: payload?.notification?.body || "You have a new task update.",
        icon: "/favicon.ico",
        data: payload?.data || {},
      };

      self.registration.showNotification(title, options);
    });
  }
};

if (firebaseConfig.apiKey) {
  initMessaging(firebaseConfig);
}

self.addEventListener("message", (event) => {
  if (event?.data?.type === "FIREBASE_CONFIG") {
    initMessaging(event.data.payload);
  }
});

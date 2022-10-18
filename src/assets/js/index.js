// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdp2SUePA5MzXIk80CLOCX8RIqdUiw3sU",
  authDomain: "calltheday-oe.firebaseapp.com",
  databaseURL: "https://calltheday-oe.firebaseio.com",
  projectId: "calltheday-oe",
  storageBucket: "calltheday-oe.appspot.com",
  messagingSenderId: "678743608491",
  appId: "1:678743608491:web:8f7cfa8287ce105430bbee",
  measurementId: "G-39XDR0NHSS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

console.log("FireBase Loaded");

window.tipitGlobal = { ga: {} };
window.tipitGlobal.ga.event = ({ event, params }) => {
  params = { ...params, app_version: window.APP_VERSION };
  console.log({ event, params });
  logEvent(analytics, event, params);
};

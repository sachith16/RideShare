importScripts("https://www.gstatic.com/firebasejs/5.8.5/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/5.8.5/firebase-messaging.js");

var config = {
	    apiKey: "AIzaSyAZR5WH00Z6BF26JeIoy3I6ycPtlkliFn4",
	    authDomain: "rideshare-81bd5.firebaseapp.com",
	    databaseURL: "https://rideshare-81bd5.firebaseio.com",
	    projectId: "rideshare-81bd5",
	    storageBucket: "rideshare-81bd5.appspot.com",
	    messagingSenderId: "957354436658"
	  };
firebase.initializeApp(config);

const messaging = firebase.messaging();
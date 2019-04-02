import firebase from 'firebase/app';
import 'firebase/database';
const conferenceId = 'chi2019';
const version = 'v1';
const config = {
  apiKey: 'AIzaSyDsNgKL7EPmtc9l547p__f5n2xW4vQdse0',
  authDomain: 'conference-schedule-system.firebaseapp.com',
  databaseURL: 'https://conference-schedule-system.firebaseio.com',
  projectId: 'conference-schedule-system',
  storageBucket: 'conference-schedule-system.appspot.com',
  messagingSenderId: '827172655047'
};

firebase.initializeApp(config);
export { firebase, conferenceId, version };

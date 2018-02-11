import firebase from 'firebase/app';
import 'firebase/database';
const conferenceId = '-L51u_LgX5gCtsDRXWc-';
const version = 'v0';
const config = {
  apiKey: 'AIzaSyD9nU_bxcZQdAN0eGtbGqrZ099_wlbPAKY',
  authDomain: 'chi-conference-data.firebaseapp.com',
  databaseURL: 'https://chi-conference-data.firebaseio.com',
  projectId: 'chi-conference-data',
  storageBucket: 'chi-conference-data.appspot.com',
  messagingSenderId: '150866590334'
};

firebase.initializeApp(config);
export { firebase, conferenceId, version };

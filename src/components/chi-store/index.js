import { firebase, conferenceId, version } from 'firebase-obj';

const store = {
  schedule: {},
  timeslot: {},
  session: {},
  venueList: [],
  search: ''
};

const db = firebase.database();

const _scheduleRef = db
  .ref(`${version}/scheduleModel/schedule`)
  .equalTo(conferenceId)
  .orderByChild('conferenceId');

const _timeslotRef = db
  .ref(`${version}/timeslotModel/timeslot`)
  .equalTo(conferenceId)
  .orderByChild('conferenceId');

const _sessionRef = db
  .ref(`${version}/sessionModel/session`)
  .equalTo(conferenceId)
  .orderByChild('conferenceId');

_scheduleRef.on('value', snapshot => {
  const obj = snapshot.val();
  let keys = Object.keys(obj);

  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    store.schedule[key] = Object.assign({}, store.schedule[key] || {}, obj[key]);
    window.dispatchEvent(new window.CustomEvent(`chi-update-schedule-${key}`));
  }
  window.dispatchEvent(new window.CustomEvent('chi-update-schedule'));
});

_timeslotRef.on('value', snapshot => {
  const obj = snapshot.val();
  let keys = Object.keys(obj);

  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    store.timeslot[key] = Object.assign({}, store.timeslot[key] || {}, obj[key]);
    window.dispatchEvent(new window.CustomEvent(`chi-update-timeslot-${key}`));
  }
  window.dispatchEvent(new window.CustomEvent('chi-update-timeslot'));
});

_sessionRef.on('value', snapshot => {
  const obj = snapshot.val();
  let keys = Object.keys(obj);

  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    store.session[key] = Object.assign({}, store.session[key] || {}, obj[key]);
    const { venue } = store.session[key];
    if (store.venueList.indexOf(venue.toLowerCase()) < 0) store.venueList.push(venue.toLowerCase());
    window.dispatchEvent(new window.CustomEvent(`chi-update-session-${key}`));
  }
  window.dispatchEvent(new window.CustomEvent('chi-update-session'));
});

export { store };

// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { customElements } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { store } from 'chi-store';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import 'chi-session-2';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends LittleQStoreMixin(Element) {
  static get is () { return 'chi-timeslot'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      dateString: {
        type: String
      },
      dayString: {
        type: String
      },
      timeslot: {
        type: Object,
        observer: '_timeslotChange'
      },
      timeslotId: {
        type: String,
        observer: '_timeslotIdChange'
      },
      sessions: {
        type: Array,
        value: []
      },
      sessionsRef: {
        type: Array
      },
      scheduleIndex: {
        type: Number
      },
      hidden: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      showTimeslot: {
        type: Boolean,
        value: false
      },
      forceOpen: {
        type: Boolean,
        value: false
      },
      params: {
        type: Object,
        value: {},
        statePath: 'littleqQueryParams.params'
      }
    };
  }

  static get observers () {
    return [
      '_timeslotIdChange(timeslotId, params, params.*)',
      '_checkForceOpen(forceOpen)'
    ];
  }

  constructor () {
    super();
    this._boundTimeslotUpdate = this._timeslotIdChange.bind(this);
  }

  connectedCallback () {
    super.connectedCallback();
    window.addEventListener('chi-update-timeslot', this._boundTimeslotUpdate);
    window.addEventListener('chi-update-query', this._boundTimeslotUpdate);
  }

  disconnectedCallback () {
    super.disconnectedCallback();
    window.removeEventListener('chi-update-timeslot', this._boundTimeslotUpdate);
    window.removeEventListener('chi-update-query', this._boundTimeslotUpdate);
  }

  _timeslotIdChange () {
    const timeslotId = this.timeslotId;
    if (store.timeslot[timeslotId]) {
      this.timeslot = store.timeslot[timeslotId];
      this.hidden = store.timeslot[timeslotId].hidden;
      if (store.search) {
        this.showTimeslot = !this.hidden;
      } else if (this.params && (this.params.publicationId || this.params.sessionId)) {
        this.showTimeslot = true;
      }
    }
  }

  _toggleTimeslot () {
    this.showTimeslot = !this.showTimeslot;
  }

  _showAll () {
    this.showTimeslot = true;
    this.forceOpen = true;
  }

  _showSummary () {
    this.showTimeslot = true;
    this.forceOpen = false;
  }

  _collapseAll () {
    this.showTimeslot = false;
    this.forceOpen = false;
  }

  _changeTimeslot (time) {
    return time.split(' - ').map(item => item.split(':').splice(0, 2).join(':')).join(' - ');
  }

  _timeslotChange (timeslot) {
    // console.log(timeslot)
    if (!timeslot.sessions) return;
    const keys = Object.keys(timeslot.sessions);
    const { className } = timeslot;
    const sessions = [];
    const newSessions = [];
    const sessionsRef = [];
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i];
      const obj = { ...timeslot.sessions[key], $key: key };
      sessions.push(obj);
      sessionsRef.push(obj);
    }

    sessions.sort((a, b) => {
      const attr = className === 'workshops' ? 'title' : 'room';
      if (a[attr] < b[attr]) return -1;
      if (a[attr] > b[attr]) return 1;
      return 0;
    });
    sessionsRef.sort((a, b) => {
      const attr = className === 'workshops' ? 'title' : 'room';
      if (a[attr] < b[attr]) return -1;
      if (a[attr] > b[attr]) return 1;
      return 0;
    });

    for (let i in sessions) {
      if (this.sessions.findIndex(item => item.$key === sessions[i].$key) < 0) {
        newSessions.push(sessions[i]);
        continue;
      }
      for (let j in this.sessions) {
        if (this.sessions[i].$key === sessions[j].$key) {
          newSessions.push(Object.assign({}, this.sessions[j], sessions[i]));
        }
      }
    }

    this.sessions = newSessions;
    this.sessionsRef = sessionsRef;
  }

  _checkForceOpen (forceOpen) {
    if (this.sessions) {
      const array = [];
      for (let i = 0; i < this.sessions.length; i++) {
        array.push(Object.assign({}, this.sessions[i], { showPublications: forceOpen }));
      }
      this.sessions = array;
    }
  }

  _duplicate ({target: el}) {
    const { index, sessionId: $key } = el;
    const array = [];
    const close = [];
    const obj = {
      $key,
      forceClose: true
    };

    const v = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    let c = 6;
    if (v < 450) c = 1;
    else if (v < 600) c = 2;
    else if (v < 850) c = 3;
    else if (v <= 1200) c = 5;

    const indexRef = this.sessionsRef.findIndex(item => item.$key === $key);
    const rowRef = parseInt(indexRef / c);

    for (let i = 0; i < this.sessionsRef.length; i++) {
      if (rowRef === parseInt(i / c)) close.push(this.sessionsRef[i].$key);
    }

    for (let i = 0; i < this.sessions.length; i++) {
      if (i === index) {
        array.push(obj);
        array.push(Object.assign({}, this.sessions[i], { showPublications: true }));
      } else if (close.indexOf(this.sessions[i].$key) >= 0 && !this.sessions[i].forceClose) {
        array.push(Object.assign({}, this.sessions[i], { showPublications: false }));
      } else if (close.indexOf(this.sessions[i].$key) < 0) {
        array.push(this.sessions[i]);
      }
    }
    this.sessions = array;

    // if (index === 0) {
    //   this.unshift('sessions', obj);
    // } else {
    //   this.splice('sessions', el.index, 0, obj);
    // }
    // const newIndex = this.sessions.findIndex(item => item.forceClose !== true && item.showPublications !== true && item.$key === $key);
    // this.set(`sessions.${newIndex}.showPublications`, true);
    // this.shadowRoot.querySelectorAll('chi-session')[newIndex].showPublications = true;
  }

  _closeDuplicate ({target: el}) {
    const { sessionId: $key } = el;
    const array = [];
    for (let i = 0; i < this.sessions.length; i++) {
      if (this.sessions[i].$key === $key && !this.sessions[i].forceClose && this.sessions[i].showPublications) {
        array.push(Object.assign({}, this.sessions[i], { showPublications: false }));
      } else if (this.sessions[i].$key !== $key) {
        array.push(this.sessions[i]);
      }
    }
    this.sessions = array;

    // const duplicateIndex = this.sessions.findIndex(item => item.forceClose === true && item.$key === $key);
    // const index = this.sessions.findIndex(item => item.showPublications === true && item.$key === $key);
    // this.shadowRoot.querySelectorAll('chi-session')[index].showPublications = false;
    // this.splice('sessions', duplicateIndex, 1);
    // this.set(`sessions.${index}.showPublications`, false);
  }

  _timeslotColorClass (index) {
    switch (index) {
      case 0:
        return 'yellow';
      case 1:
        return 'grey';
      case 2:
        return 'blue';
      case 3:
        return 'green';
      case 4:
        return 'orange';
      case 5:
        return 'pink';
      default:
        return 'pink';
    }
  }

  _getTimeslotRealId (timeslot) {
    if (timeslot && timeslot.split('::').length === 2) {
      return timeslot.split('::')[1];
    }
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

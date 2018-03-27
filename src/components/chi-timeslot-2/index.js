// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { customElements } from 'global/window';
import { store } from 'chi-store';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import 'chi-session-2';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends Element {
  static get is () { return 'chi-timeslot'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      timeslot: {
        type: Object,
        observer: '_timeslotChange'
      },
      timeslotId: {
        type: String,
        observer: '_timeslotIdChange'
      },
      sessions: {
        type: Array
      },
      scheduleIndex: {
        type: Number
      }
    };
  }

  constructor () {
    super();
    this._boundTimeslotUpdate = this._timeslotIdChange.bind(this);
  }

  connectedCallback () {
    super.connectedCallback();
    window.addEventListener('chi-update-timeslot', this._boundTimeslotUpdate);
  }

  disconnectedCallback () {
    super.disconnectedCallback();
    window.removeEventListener('chi-update-timeslot', this._boundTimeslotUpdate);
  }

  _timeslotIdChange () {
    const timeslotId = this.timeslotId;
    if (store.timeslot[timeslotId]) {
      this.timeslot = store.timeslot[timeslotId];
    }
  }

  _timeslotChange (timeslot) {
    const keys = Object.keys(timeslot.sessions);
    const sessions = [];
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i];
      const obj = { ...timeslot.sessions[key], $key: key };
      sessions.push(obj);
    }
    sessions.sort((i, j) => (i.value - j.value));
    this.sessions = sessions;
  }

  _timeslotColorClass (index) {
    switch (index) {
      case 0:
        return 'blue';
      case 1:
        return 'grey';
      case 2:
        return 'green';
      case 3:
        return 'yellow';
      case 4:
        return 'orange';
      case 5:
        return 'pink';
      default:
        return 'pink';
    }
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { customElements, history, dispatchEvent, CustomEvent, requestAnimationFrame } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import '@polymer/polymer/lib/elements/dom-repeat';
import 'chi-timeslot-2';

// define style and template
import style from './style.styl';
import template from './template.html';

const monthNames = [
  'January', 'February', 'March',
  'April', 'May', 'June', 'July',
  'August', 'September', 'October',
  'November', 'December'
];
const formatDate = (date) => `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

class Component extends LittleQStoreMixin(Element) {
  static get is () { return 'chi-day'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      day: {
        type: Object,
        observer: '_dayChanged'
      },
      timeslots: {
        type: Array
      },
      scheduleIndex: {
        type: Number
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
      '_checkParams(params, day, params.*)'
    ];
  }

  _getDateString (dateString) {
    return formatDate(new Date(dateString));
  }

  _dayChanged (day) {
    const keys = Object.keys(day.timeslots);
    const timeslots = [];
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i];
      const obj = { ...day.timeslots[key], $key: key };
      timeslots.push(obj);
    }
    timeslots.sort((i, j) => (i.value - j.value));
    this.timeslots = timeslots;
  }

  _showDay () {
    requestAnimationFrame(() => {
      this.shadowRoot.querySelector(`.invi-anchor-day-${this.day.$key}`)
        .scrollIntoView(true);
    });
  }

  _checkParams (params, day) {
    if (day && params.scheduleId === day.$key) {
      this._showDay();
      setTimeout(() => {
        history.pushState({}, '', `?`);
        dispatchEvent(new CustomEvent('location-changed'));
      }, 1000);
    }
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

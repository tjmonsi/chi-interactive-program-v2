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
const formatDate = (date) => {
  const array = date.split('-');
  return monthNames[parseInt(array[1], 10) - 1] + ' ' + array[2] + ', ' + array[0];
  // ```${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

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
      },
      hidden: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    };
  }

  static get observers () {
    return [
      '_checkParams(params, day, params.*)'
    ];
  }

  _getDateString (dateString) {
    return formatDate(dateString);
  }

  _dayChanged (day) {
    if (day) {
      const keys = Object.keys(day.timeslots);
      const timeslots = [];
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        const obj = { ...day.timeslots[key], $key: key };
        timeslots.push(obj);
      }
      timeslots.sort((i, j) => (i.value - j.value));
      this.timeslots = timeslots;
      this.hidden = day.hidden;
    }
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

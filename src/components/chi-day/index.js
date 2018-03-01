// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { customElements } from 'global/window';
import '@polymer/polymer/lib/elements/dom-repeat';
import 'chi-timeslot';

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

class Component extends Element {
  static get is () { return 'chi-day'; }
  static get template () { return `<style>${style}</style>${template}`; }
  static get properties () {
    return {
      scheduleObj: {
        type: Object
      },
      timeslots: {
        type: Array,
        value: []
      },
      scheduleIndex: {
        type: Number
      }
    };
  }

  static get observers () {
    return [
      '_getTimeslots(scheduleObj.timeslots, scheduleObj.timeslots.*)'
    ];
  }

  _getTimeslots (timeslots) {
    this.set('timeslots', []);
    setTimeout(() => {
      const array = [];
      Object.entries(timeslots).forEach(([key, item]) => { array.splice(item.value, 0, key); });
      this.set('timeslots', array);
    }, 100);
  }

  _getDateString (dateString) {
    return formatDate(new Date(dateString));
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

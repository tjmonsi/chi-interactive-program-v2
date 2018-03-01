// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { customElements, scrollY, scrollTo, requestAnimationFrame } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
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

class Component extends LittleQStoreMixin(Element) {
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
      },
      params: {
        type: Object,
        statePath: 'littleqQueryParams.params'
      }
    };
  }

  static get observers () {
    return [
      '_getTimeslots(scheduleObj.timeslots, scheduleObj.timeslots.*)',
      '_showDay(params.scheduleId, scheduleObj.$key)'
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

  _showDay (paramsScheduleId, scheduleId) {
    const showDay = this._isEqual(paramsScheduleId, scheduleId);

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (showDay) scrollTo(0, (scrollY + this.shadowRoot.querySelector('h1').getBoundingClientRect().top) - 102);
      }, 100);
    });
  }

  _isEqual (a, b) { return a === b; }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { customElements, requestAnimationFrame, scrollTo, scrollY } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { debounce } from 'chi-interactive-schedule/debounce';
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
      },
      filteredVenues: {
        type: Array,
        statePath: 'chiState.filteredVenues'
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
      '_getTimeslots(scheduleObj.timeslots, scheduleObj.timeslots.*)',
      '_showDay(params.scheduleId, scheduleObj.$key)',
      '_checkDay(timeslots, filteredVenues, filteredVenues.splices)'
    ];
  }

  constructor () {
    super();
    this._debouncedCheckDay = debounce(this._checkDayOnce.bind(this), 500);
  }

  _getTimeslots (timeslots) {
    this.set('timeslots', []);
    setTimeout(() => {
      const array = [];
      if (timeslots) Object.entries(timeslots).forEach(([key, item]) => { array.splice(item.value, 0, key); });
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
        if (showDay) { scrollTo(0, (scrollY + this.shadowRoot.querySelector(`.${scheduleId}-day`).getBoundingClientRect().top) - 102); }
        // if (showDay) {
        //   // console.log(this.shadowRoot.querySelector(`.invi-anchor-day-${scheduleId}`))
        //   this.shadowRoot.querySelector(`.invi-anchor-day-${scheduleId}`).scrollIntoView({
        //     block: 'start',
        //     behavior: 'smooth'
        //   });
        // }
      }, 200);
    });
  }

  _checkDayOnce () {
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.hidden = this.timeslots.length === this.shadowRoot.querySelectorAll('chi-timeslot[hidden]').length;
        this._showDay(this.params.scheduleId, this.scheduleObj.$key);
      }, 200);
    });
  }

  _checkDay () {
    this._debouncedCheckDay();
  }

  _isEqual (a, b) { return a === b; }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

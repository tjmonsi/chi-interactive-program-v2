// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { customElements } from 'global/window';
import '@polymer/polymer/lib/elements/dom-repeat';
import 'chi-timeslot';

// define style and template
import style from './style.styl';
import template from './template.html';

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
      }
    };
  }

  static get observers () {
    return [
      '_getTimeslots(scheduleObj.timeslots, scheduleObj.timeslots.*)'
    ];
  }

  _getTimeslots (timeslots) {
    const array = [];
    Object.entries(timeslots).forEach(([key, item]) => { array.splice(item.value, 0, key); });
    this.set('timeslots', array);
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

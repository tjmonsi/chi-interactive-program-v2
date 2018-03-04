// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiTimeslotMixin } from 'chi-timeslot-mixin';
import { customElements, requestAnimationFrame, CustomEvent } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { debounce } from 'chi-interactive-schedule/debounce';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import 'chi-session';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends LittleQStoreMixin(ChiTimeslotMixin(Element)) {
  static get is () { return 'chi-timeslot'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      scheduleIndex: {
        type: Number
      },
      filteredVenues: {
        type: Array,
        statePath: 'chiState.filteredVenues'
      }
    };
  }

  static get observers () {
    return [
      '_checkTimeslot(timeslot, sessions, filteredVenues)'
    ];
  }

  constructor () {
    super();
    this._debouncedCheckTimeslot = debounce(this._checkTimeslotOnce.bind(this), 500);
  }

  _checkTimeslotOnce () {
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (this.timeslot) {
          this.hidden = !this.timeslot.sessions || (this.timeslot.sessions && Object.entries(this.timeslot.sessions).length === this.shadowRoot.querySelectorAll('chi-session[hidden]').length);
          this.dispatchEvent(new CustomEvent('chi-timeslot-hidden'));
        }
      }, 150);
    });
  }

  _checkTimeslot () {
    this._debouncedCheckTimeslot();
  }

  _timeslotColorClass (index) {
    switch (index) {
      case 0:
        return 'grey';
      case 1:
        return 'blue';
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

// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiTimeslotMixin } from 'chi-timeslot-mixin';
import { customElements } from 'global/window';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import 'chi-session';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends ChiTimeslotMixin(Element) {
  static get is () { return 'chi-timeslot'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      scheduleIndex: {
        type: Number
      }
    };
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

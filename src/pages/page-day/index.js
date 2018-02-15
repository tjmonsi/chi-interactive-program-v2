// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { LittleqPageMixin } from '@littleq/small-page-viewer/mixin';
import { ChiSingleScheduleMixin } from 'chi-single-schedule-mixin';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { customElements } from 'global/window';
import '@polymer/polymer/lib/elements/dom-if';
import 'chi-day';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends LittleQStoreMixin(ChiSingleScheduleMixin(LittleqPageMixin(Element))) {
  static get is () { return 'page-day'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      scheduleId: {
        type: String,
        statePath: 'littleqSmallRouter.params.id',
        observer: '_getSchedule'
      }
    };
  }

  _getSchedule (scheduleId) {
    this.set('schedule', null);
    setTimeout(() => {
      super._getSchedule(scheduleId);
    }, 100);
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

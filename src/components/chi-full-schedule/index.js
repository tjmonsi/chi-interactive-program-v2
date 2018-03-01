// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { LittleqPageMixin } from '@littleq/small-page-viewer/mixin';
import { ChiScheduleMixin } from 'chi-schedule-mixin';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { customElements } from 'global/window';
import '@polymer/polymer/lib/elements/dom-repeat';
import 'chi-day';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends LittleQStoreMixin(ChiScheduleMixin(LittleqPageMixin(Element))) {
  static get is () { return 'chi-full-schedule'; }
  static get template () { return `<style>${style}</style>${template}`; }

  // static get properties () {
  //   return {
  //     scheduleId: {
  //       type: String,
  //       statePath: 'littleqQueryParams.params.scheduleId',
  //       observer: '_getSchedule'
  //     }
  //   };
  // }

  // _getSchedule (scheduleId) {
  //   this.set('schedule', null);
  //   setTimeout(() => {
  //     super._getSchedule(scheduleId);
  //   }, 100);
  // }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { LittleqPageMixin } from '@littleq/small-page-viewer/mixin';
import { ChiScheduleMixin } from 'chi-schedule-mixin';
import { customElements } from 'global/window';
import '@polymer/polymer/lib/elements/dom-repeat';
import 'chi-day-summary';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends ChiScheduleMixin(LittleqPageMixin(Element)) {
  static get is () { return 'page-home'; }
  static get template () { return `<style>${style}</style>${template}`; }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

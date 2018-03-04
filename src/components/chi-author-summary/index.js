// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiAuthorSummaryMixin } from 'chi-author-summary-mixin';
import { customElements } from 'global/window';

// define style and template
import style from './style.styl';
import template from './template.html';
import 'marked-element';

class Component extends ChiAuthorSummaryMixin(Element) {
  static get is () { return 'chi-author-summary'; }
  static get template () { return `<style>${style}</style>${template}`; }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

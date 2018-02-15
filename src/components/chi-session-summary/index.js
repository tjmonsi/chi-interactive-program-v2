// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiSessionMixin } from 'chi-session-mixin';
import { customElements } from 'global/window';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends ChiSessionMixin(Element) {
  static get is () { return 'chi-session-summary'; }
  static get template () { return `<style>${style}</style>${template}`; }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

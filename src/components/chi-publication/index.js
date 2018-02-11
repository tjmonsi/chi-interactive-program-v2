// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiPublicationMixin } from 'chi-publication-mixin';
import { customElements } from 'global/window';
import '@polymer/polymer/lib/elements/dom-repeat';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends ChiPublicationMixin(Element) {
  static get is () { return 'chi-publication'; }
  static get template () { return `<style>${style}</style>${template}`; }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

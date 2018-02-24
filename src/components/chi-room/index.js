// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiRoomMixin } from 'chi-room-mixin';
import { customElements } from 'global/window';
import '@polymer/polymer/lib/elements/dom-if';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends ChiRoomMixin(Element) {
  static get is () { return 'chi-room'; }
  static get template () { return `<style>${style}</style>${template}`; }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

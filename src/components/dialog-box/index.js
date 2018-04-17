// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { customElements } from 'global/window';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends Element {
  static get is () { return 'dialog-box'; }
  static get template () { return `<style>${style}</style>${template}`; }

  show () {
    this.style.display = 'block';
  }

  close () {
    this.style.display = 'none';
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

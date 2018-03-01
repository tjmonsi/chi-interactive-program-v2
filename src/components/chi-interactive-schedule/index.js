// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { customElements } from 'global/window';
import 'utils/pages';
import 'utils/fragments';
import '@littleq/path-fetcher';
import '@littleq/query-params-fetcher';
import 'chi-full-schedule';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends Element {
  static get is () { return 'chi-interactive-schedule'; }
  static get template () { return `<style>${style}</style>${template}`; }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiScheduleMixin } from 'chi-schedule-mixin';
import { customElements } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import '@polymer/polymer/lib/elements/dom-repeat';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends LittleQStoreMixin(ChiScheduleMixin(Element)) {
  static get is () { return 'chi-header'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      params: {
        type: Object,
        statePath: 'littleqSmallRouter.params'
      },
      route: {
        type: String,
        statePath: 'littleqSmallRouter.route'
      }
    };
  }

  openNavigation () {
    this.shadowRoot.querySelector('.menu').classList.add('hidden');
    this.shadowRoot.querySelector('.close').classList.remove('hidden');
    this.shadowRoot.querySelector('.phone').classList.add('open');
  }

  closeNavigation () {
    this.shadowRoot.querySelector('.menu').classList.remove('hidden');
    this.shadowRoot.querySelector('.close').classList.add('hidden');
    this.shadowRoot.querySelector('.phone').classList.remove('open');
  }

  _isSelected (paramsDayId, dayId) { return paramsDayId === dayId ? 'selected' : ''; }

  _isScheduleAtAGlance (route) { return route === '/' ? 'selected' : ''; }

  _isSearch (route) { return route === '/search' ? 'selected' : ''; }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

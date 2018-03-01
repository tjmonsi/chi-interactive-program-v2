// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { customElements, IntersectionObserver } from 'global/window';
import { ChiScheduleMixin } from 'chi-schedule-mixin';
import { LittleQStoreMixin } from '@littleq/state-manager';
import 'utils/pages';
import 'utils/fragments';
import '@littleq/path-fetcher';
import '@littleq/query-params-fetcher';
import 'chi-full-schedule';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends LittleQStoreMixin(ChiScheduleMixin(Element)) {
  static get is () { return 'chi-interactive-schedule'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      params: {
        type: Boolean,
        statePath: 'littleqQueryParams.params'
      }
    };
  }

  static get observers () {
    return [
      'closeNavigation(params.scheduleId, params.sessionId, params.publicationId)'
    ];
  }

  connectedCallback () {
    super.connectedCallback();
    const target = this.shadowRoot.querySelector('nav.on-top');
    const fixed = this.shadowRoot.querySelector('nav.fixed');
    const options = { threshold: 0 };

    this._observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(({target: entryTarget, isIntersecting}) => {
        if (entryTarget) fixed.style.display = isIntersecting ? 'none' : 'block';
      });
    }, options);

    this._observer.observe(target);
  }

  disconnectedCallback () {
    super.disconnectedCallback();
    if (this._observer) this._observer.disconnect();
  }

  openNavigation () {
    this.shadowRoot.querySelectorAll('.nav-button.menu').forEach(node => (node.style.display = 'none'));
    this.shadowRoot.querySelectorAll('.nav-button.close').forEach(node => (node.style.display = 'block'));
    this.shadowRoot.querySelector('.fixed-phone').style.display = 'block';
  }

  closeNavigation () {
    this.shadowRoot.querySelectorAll('.nav-button.menu').forEach(node => (node.style.display = 'block'));
    this.shadowRoot.querySelectorAll('.nav-button.close').forEach(node => (node.style.display = 'none'));
    this.shadowRoot.querySelector('.fixed-phone').style.display = 'none';
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

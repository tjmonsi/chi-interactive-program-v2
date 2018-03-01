// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners';
import { ChiPublicationMixin } from 'chi-publication-mixin';
import { customElements, scrollTo, scrollY, requestAnimationFrame } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import 'chi-author-summary';
import 'chi-author';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends LittleQStoreMixin(GestureEventListeners(ChiPublicationMixin(Element))) {
  static get is () { return 'chi-publication'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      showInformation: {
        type: Boolean,
        value: false
      },
      scheduleId: {
        type: String
      },
      params: {
        type: Object,
        value: {},
        statePath: 'littleqQueryParams.params'
      }
    };
  }

  static get observers () {
    return [
      '_showInformation(params.publicationId, publicationId, publication)'
    ];
  }

  // constructor () {
  //   super();
  //   this._boundShowInformation = this._showInformation.bind(this, this.params.publicationId, this.publicationId);
  // }

  // connectedCallback () {
  //   super.connectedCallback();
  //   addEventListener('chi-layout-reflow', this._boundShowInformation);
  // }

  // disconnectedCallback () {
  //   super.disconnectedCallback();
  //   removeEventListener('chi-layout-reflow', this._boundShowInformation);
  // }

  _showInformation (paramsPublicationId, publicationId) {
    this.showInformation = this._isEqual(paramsPublicationId, publicationId);
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (this.showInformation) { scrollTo(0, (scrollY + this.shadowRoot.querySelector('h4').getBoundingClientRect().top) - 102); }
      }, 200);
    });
  }

  _isEqual (a, b) { return a === b; }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

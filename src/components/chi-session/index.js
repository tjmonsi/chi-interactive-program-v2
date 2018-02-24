// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiSessionMixin } from 'chi-session-mixin';
import { customElements, scrollTo, scrollY } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import 'chi-publication';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends LittleQStoreMixin(ChiSessionMixin(Element)) {
  static get is () { return 'chi-session'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      showPublications: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      params: {
        type: Object,
        statePath: 'littleqSmallRouter.params'
      }
    };
  }

  static get observers () {
    return [
      '_showPublication(params.sessionId, sessionId)'
    ];
  }

  _showPublication (paramsSessionId, sessionId) {
    this.showPublications = this._isEqual(paramsSessionId, sessionId);
    if (this.showPublications) scrollTo(0, scrollY + this.parentNode.parentNode.querySelector('h2').getBoundingClientRect().top);
  }

  _isEqual (a, b) { return a === b; }

  toggle () { this.showPublications = !this.showPublications; }

  off () { this.showPublications = false; }

  getVenue (venue) {
    switch (venue) {
      case 'altchi':
        return 'alt.chi';
      case 'casestudy':
        return 'Case Study';
      default:
        return venue.charAt(0).toUpperCase() + venue.slice(1);
    }
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

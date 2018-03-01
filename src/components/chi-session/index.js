// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiSessionMixin } from 'chi-session-mixin';
import { customElements, scrollTo, scrollY, requestAnimationFrame } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import 'chi-publication';
import 'chi-room';

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
        value: {},
        statePath: 'littleqQueryParams.params'
      }
    };
  }

  static get observers () {
    return [
      '_showPublication(params.sessionId, sessionId)',
      '_setClass(session.venue)'
    ];
  }

  _showPublication (paramsSessionId, sessionId) {
    this.showPublications = this._isEqual(paramsSessionId, sessionId);
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (this.showPublications) scrollTo(0, (scrollY + this.shadowRoot.querySelector('h3').getBoundingClientRect().top) - 82);
      }, 200);
    });
  }

  _showPublicationClass (showPublications) {
    return showPublications ? 'show-publications' : '';
  }

  _cleanText (title) {
    return title.replace(/&nbsp;/, ' ').replace(/&amp;/, '&');
  }

  _setClass (venue) { this.classList.add(venue.toLowerCase().replace(/ /, '-')); }

  _isEqual (a, b) { return a === b; }

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

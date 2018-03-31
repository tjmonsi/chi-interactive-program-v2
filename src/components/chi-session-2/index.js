// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { customElements, CustomEvent, dispatchEvent, history, requestAnimationFrame } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { store } from 'chi-store';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import 'marked-element';
import 'chi-publication-2';
import 'chi-room';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends LittleQStoreMixin(Element) {
  static get is () { return 'chi-session'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      sessionId: {
        type: String,
        observer: '_sessionIdChange'
      },
      session: {
        type: Object,
        observer: '_sessionChange'
      },
      showPublications: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
        observer: '_showPub'
      },
      forceClose: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      index: {
        type: Number,
        value: 0
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
      '_checkParams(params, sessionId, session, params.*)'
    ];
  }

  constructor () {
    super();
    this._boundSessionUpdate = this._sessionIdChange.bind(this);
    this._boundShowSession = this._showSession.bind(this);
    this._boundCloseSession = this._closeSession.bind(this);
  }

  connectedCallback () {
    super.connectedCallback();
    window.addEventListener('chi-update-session', this._boundSessionUpdate);
    this.addEventListener('click', this._boundShowSession);
  }

  disconnectedCallback () {
    super.disconnectedCallback();
    window.removeEventListener('chi-update-session', this._boundSessionUpdate);
    this.removeEventListener('click', this._boundShowSession);
  }

  _sessionIdChange () {
    const sessionId = this.sessionId;
    if (store.session[sessionId]) {
      this.session = store.session[sessionId];
    }
  }

  _showPub () {
    if (this.showPublications && !this.params.publicationId) {
      requestAnimationFrame(() => {
        this.shadowRoot.querySelector(`.invi-anchor-session-${this.sessionId}`)
          .scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
      });
    }
  }

  _sessionChange (session) {
    if (session && session.publications) {
      const keys = Object.keys(session.publications);
      const publications = [];
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        const obj = { ...session.publications[key], $key: key };
        publications.push(obj);
      }
      publications.sort((i, j) => (i.value - j.value));
      this.publications = publications;
    }
  }

  _showPublicationClass (showPublications) {
    return showPublications ? 'show-publications' : '';
  }

  _cleanText (title, trim) {
    const text = title && title.replace(/&nbsp;/, ' ').replace(/&amp;/, '&');
    return text.length > trim ? (text.split(' ').reduce((prev, next) => prev.length >= trim ? prev : prev + ' ' + next).replace(/:$/, '') + '...') : text;
  }

  _slugifyClass (venue) { return venue.toLowerCase().replace(/ /, '-'); }

  _setClass (venue) { if (venue) this.classList.add(this._slugifyClass(venue)); }

  _showSession () {
    if (!this.showPublications && !this.forceClose) {
      this.dispatchEvent(new CustomEvent('open-duplicate'));
    } else if (this.forceClose) {
      this.dispatchEvent(new CustomEvent('close-duplicate'));
    }
  }

  _closeSession (e) {
    e.stopPropagation();
    e.preventDefault();
    this.dispatchEvent(new CustomEvent('close-duplicate'));
  }

  _checkParams (params, sessionId, session) {
    if (sessionId && session && params.sessionId === this.sessionId) {
      this._showSession();
      setTimeout(() => {
        history.pushState({}, '', `?`);
        dispatchEvent(new CustomEvent('location-changed'));
      }, 1000);
    }
  }

  getVenueTitle (venue) {
    if (venue) {
      switch (venue.toLowerCase()) {
        case 'altchi':
          return 'alt.chi';
        case 'casestudy':
          return 'Case Study';
        case 'docconsortium':
          return '';
        case 'science jam':
          return '';
        case 'demo':
          return '';
        case 'workshop':
          return '';
        case 'game jam':
          return '';
        case 'symposia':
          return 'Symposium';
        case 'keynote':
          return '';
        case 'paper':
          return 'Paper Session';
        case 'sig':
          return 'SIG';
        case 'competition':
          return '';
        case 'awards':
          return '';
        case 'videoshowcase':
          return '';
        case 'lbw':
          return 'Late-breaking Work';
        case 'panel':
          return 'Panel/Roundtable';
        default:
          return venue.charAt(0).toUpperCase() + venue.slice(1);
      }
    }
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

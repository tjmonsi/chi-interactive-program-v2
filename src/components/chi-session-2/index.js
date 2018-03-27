// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { customElements } from 'global/window';
import { store } from 'chi-store';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import 'marked-element';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends Element {
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
        value: false
      }
    };
  }

  constructor () {
    super();
    this._boundSessionUpdate = this._sessionIdChange.bind(this);
  }

  connectedCallback () {
    super.connectedCallback();
    window.addEventListener('chi-update-session', this._boundSessionUpdate);
  }

  disconnectedCallback () {
    super.disconnectedCallback();
    window.removeEventListener('chi-update-session', this._boundSessionUpdate);
  }

  _sessionIdChange () {
    const sessionId = this.sessionId;
    if (store.session[sessionId]) {
      this.session = store.session[sessionId];
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
      this.sessions = publications;
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

// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { customElements, CustomEvent, requestAnimationFrame, history } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { store } from 'chi-store';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import 'marked-element';
import 'chi-publication-2';
import 'chi-room';
import { toastr } from 'toastr-component';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends LittleQStoreMixin(Element) {
  static get is () { return 'chi-session'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      dayString: {
        type: String
      },
      dateString: {
        type: String
      },
      timeString: {
        type: String
      },
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
      forceShowPublications: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
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
      hidden: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      _baseUrl: {
        type: String,
        value: window.baseURL || '/'
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
    window.addEventListener('chi-update-query', this._boundSessionUpdate);
    this.addEventListener('click', this._boundShowSession);
  }

  disconnectedCallback () {
    super.disconnectedCallback();
    window.removeEventListener('chi-update-session', this._boundSessionUpdate);
    window.removeEventListener('chi-update-query', this._boundSessionUpdate);
    this.removeEventListener('click', this._boundShowSession);
  }

  _sessionIdChange () {
    const sessionId = this.sessionId;
    if (store.session[sessionId]) {
      this.session = store.session[sessionId];
      this.hidden = store.session[sessionId].hidden;
      this.forceShowPublications = store.session[sessionId].expand;
      // console.log(!!store.search && store.session[sessionId].expand)
      // this.showPublications = !!store.search && store.session[sessionId].expand;
    }
  }

  _showPub () {
    // console.log(this.showPublications, this.sessionId)
    if (this.showPublications && this.params.sessionId === this.sessionId && !this.params.publicationId) {
      requestAnimationFrame(() => {
        this.shadowRoot.querySelector(`.invi-anchor-session-${this.sessionId}`)
          .scrollIntoView({
            behavior: 'auto',
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
    if (!this.showPublications && !this.forceClose && !this.forceShowPublications) {
      this.dispatchEvent(new CustomEvent('open-duplicate'));
    } else if (this.forceClose) {
      this.dispatchEvent(new CustomEvent('close-duplicate'));
    }
  }

  _closeSession (e) {
    e.stopPropagation();
    e.preventDefault();
    if (!store.session[this.sessionId].expand) this.dispatchEvent(new CustomEvent('close-duplicate'));
  }

  _checkParams (params, sessionId, session) {
    if (sessionId && session && params.sessionId === this.sessionId) {
      this._showSession();
      // setTimeout(() => {
      //   history.pushState({}, '', `?`);
      //   dispatchEvent(new CustomEvent('location-changed'));
      // }, 5000);
    }
  }

  _openPublications (showPublications, forceShowPublications) {
    return showPublications || forceShowPublications;
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
          return '';
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

  _getDateTime (dayString, dateString, time) {
    return `${dayString}, ${dateString} - ${time.split('-')[0]}`;
  }

  copyLink () {
    const copyText = document.createElement('input');
    const { location: { protocol, host, pathname } } = window;
    copyText.value = `${protocol}//${host}${pathname}?sessionId=${encodeURI(this.sessionId)}`;
    copyText.style.display = 'inline';
    copyText.style.position = 'fixed';
    copyText.style.opacity = 0;
    this.shadowRoot.appendChild(copyText);
    copyText.select();
    document.execCommand('copy');
    this.shadowRoot.removeChild(copyText);
    console.log('copied');
    toastr.info(`Copied Session link: "${this.session.title}" to the clipboard`);
    history.pushState({}, '', `?sessionId=${encodeURI(this.sessionId)}`);
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

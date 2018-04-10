// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { customElements, requestAnimationFrame, history } from 'global/window';
import { ChiPublicationMixin } from 'chi-publication-mixin';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { toastr } from 'toastr-component';
import { store } from 'chi-store';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import 'marked-element';
import 'chi-author-2';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends LittleQStoreMixin(ChiPublicationMixin(Element)) {
  static get is () { return 'chi-publication'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      showInformation: {
        type: Boolean,
        value: false,
        observer: '_showInfo'
      },
      sessionId: {
        type: String
      },
      _baseUrl: {
        type: String,
        value: window.baseURL || '/'
      },
      params: {
        type: Object,
        value: {},
        statePath: 'littleqQueryParams.params'
      },
      hidden: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    };
  }

  static get observers () {
    return [
      '_checkParams(params, sessionId, publicationId, publication, params.*)',
      '_showPublication(publication)'
    ];
  }

  constructor () {
    super();
    this._boundShowPublication = this._showPublication.bind(this);
  }

  connectedCallback () {
    super.connectedCallback();
    window.addEventListener('chi-update-query', this._boundShowPublication);
  }

  disconnectedCallback () {
    super.connectedCallback();
    window.removeEventListener('chi-update-query', this._boundShowPublication);
  }

  _isEqual (a, b) { return a === b; }

  _isOr (a, b) { return a || b; }

  _hideAbstract () {
    this.showInformation = false;
  }

  _showAbstract () {
    this.showInformation = true;
  }

  _toggleAbstract () {
    this.showInformation = !this.showInformation;
  }

  _showInfo () {
    if (this.showInformation && this.params.publicationId) {
      requestAnimationFrame(() => {
        this.shadowRoot.querySelector(`.invi-anchor-pub-${this.publicationId}`)
          .scrollIntoView(true);
      });
    }
  }

  _showPublication () {
    if (store.showPublications && store.showPublications.length === 0) {
      this.hidden = false;
    } else if (store.showPublications && store.showPublications.indexOf(this.publicationId) < 0) {
      this.hidden = true;
    } else {
      this.hidden = false;
    }
    // console.log(this.hidden, this.publicationId)
  }

  _checkParams (params, sessionId, publicationId, publication) {
    if (sessionId && publicationId && publication && publicationId === this.params.publicationId) {
      this._showAbstract();
    }
  }

  copyLink () {
    const copyText = document.createElement('input');
    const { location: { protocol, host, pathname } } = window;
    copyText.value = `${protocol}//${host}${pathname}?sessionId=${encodeURI(this.sessionId)}&publicationId=${encodeURI(this.publicationId)}`;
    copyText.style.display = 'inline';
    copyText.style.position = 'fixed';
    copyText.style.opacity = 0;
    this.shadowRoot.appendChild(copyText);
    copyText.select();
    document.execCommand('copy');
    this.shadowRoot.removeChild(copyText);
    console.log('copied');
    toastr.info(`Copied Publication link: "${this.publication.title}" to the clipboard`);
    history.pushState({}, '', `?sessionId=${encodeURI(this.sessionId)}&publicationId=${encodeURI(this.publicationId)}`);
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

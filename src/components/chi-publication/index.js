// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners';
import { ChiPublicationMixin } from 'chi-publication-mixin';
import { customElements, requestAnimationFrame } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { debounce } from 'chi-interactive-schedule/debounce';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import 'chi-author-summary';
import 'chi-author';
import 'marked-element';

// define style and template
import style from './style.styl';
import template from './template.html';

let loaded = false; // haxx

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
      thisSessionId: {
        type: String
      },
      params: {
        type: Object,
        value: {},
        statePath: 'littleqQueryParams.params'
      },
      filteredVenues: {
        type: Array,
        statePath: 'chiState.filteredVenues'
      },
      queryResults: {
        type: Array,
        statePath: 'chiState.queryResults'
      },
      hidden: {
        type: Boolean,
        reflectToAttribute: true,
        value: false
      },
      _baseUrl: {
        type: String,
        value: window.baseURL || '/'
      }
    };
  }

  constructor () {
    super();
    this._debouncedFilterPublicationsOnce = debounce(this._filterPublicationsOnce.bind(this), 500);
    this._debouncedShowInformationOnce = debounce(this._showInformationOnce.bind(this), 1000);
  }

  static get observers () {
    return [
      '_showInformation(params.publicationId, params.oldPublicationId, publicationId, params.sessionId, thisSessionId, params.search, publication, filteredVenues)',
      '_filterPublications(filteredVenues, publication.venue, queryResults)'
    ];
  }

  _filterPublications (filteredVenues, venue, queryResults) {
    this._debouncedFilterPublicationsOnce(filteredVenues, venue, queryResults);
  }

  _filterPublicationsOnce (filteredVenues, venue) {
    const queryResults = this.queryResults;
    this.hidden = queryResults ? queryResults.length > 0 : false;

    if (this.publication && queryResults) {
      for (let indexResult in queryResults) {
        let result = queryResults[indexResult];
        if (result.searchType === 'publication' && result.objectID === this.publicationId) {
          this.showInformation = true;
          this.hidden = false;
        }
        if (result.publications) {
          for (let publicationId in result.publications) {
            if (this.publicationId === publicationId) {
              this.showInformation = true;
              this.hidden = false;
            }
          }
        }
        if (!this.hidden) break;
      }
    }
    // console.log('publications-call')
    this.hidden = this.hidden || (filteredVenues && filteredVenues.indexOf(venue ? venue.toLowerCase() : null) < 0);
    // this.dispatchEvent(new CustomEvent('chi-publication-hidden'));
  }

  _showInformation (paramsPublicationId, paramsOldPublicationId, publicationId, paramsSessionId, sessionId, search) {
    loaded
      ? this._showInformationOnce(paramsPublicationId, paramsOldPublicationId, publicationId, paramsSessionId, sessionId, search)
      : this._debouncedShowInformationOnce(paramsPublicationId, paramsOldPublicationId, publicationId, paramsSessionId, sessionId, search);
  }

  _showInformationOnce (paramsPublicationId, paramsOldPublicationId, publicationId, paramsSessionId, sessionId, search) {
    // console.log(this.publication)
    this.showInformation = (this._isEqual(paramsPublicationId, publicationId) && this._isEqual(paramsSessionId, sessionId)) || search;
    this._focusInformation = (this._isEqual(paramsPublicationId, publicationId) && this._isEqual(paramsSessionId, sessionId));
    requestAnimationFrame(() => {
      setTimeout(() => {
        // if (this.showInformation) { scrollTo(0, (scrollY + this.shadowRoot.querySelector('h4').getBoundingClientRect().top) - 102); }
        if (this._focusInformation && !search) {
          this.shadowRoot.querySelector(`.invi-anchor-pub-${publicationId}`).scrollIntoView({
            block: 'start',
            behavior: 'smooth'
          });
          loaded = true;
        }
      }, 200);
    });
  }

  _isEqual (a, b) { return a === b; }

  _isOr (a, b) { return a || b; }

  copyLink () {
    const copyText = document.createElement('input');
    const { location: { protocol, host, pathname } } = window;
    copyText.value = `${protocol}//${host}${pathname}?sessionId=${encodeURI(this.thisSessionId)}&publicationId=${encodeURI(this.publicationId)}`;
    copyText.style.display = 'inline';
    copyText.style.position = 'fixed';
    copyText.style.opacity = 0;
    this.shadowRoot.appendChild(copyText);
    copyText.select();
    document.execCommand('copy');
    this.shadowRoot.removeChild(copyText);
    console.log('copied');
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

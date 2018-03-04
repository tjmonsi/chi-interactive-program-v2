// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiSessionMixin } from 'chi-session-mixin';
import { customElements, requestAnimationFrame, CustomEvent } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { CHI_STATE } from 'chi-interactive-schedule/reducer';
import { debounce } from 'chi-interactive-schedule/debounce';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import 'chi-publication';
import 'chi-room';
import 'marked-element';

// define style and template
import style from './style.styl';
import template from './template.html';

let time = 500; // haxx

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
      },
      venues: {
        type: Array,
        value: [],
        statePath: 'chiState.venues'
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
      },
      time: {
        type: Number,
        value: 0
      }
    };
  }

  static get observers () {
    return [
      '_showPublication(params.sessionId, params.oldSessionId, sessionId)',
      '_setClass(session.venue)',
      '_addVenue(session.venue, venues)',
      // '_setLoading(loading, time)',
      '_filterSessions(filteredVenues, session.venue, queryResults)'
    ];
  }

  constructor () {
    super();
    this._debouncedFilterSessionsOnce = debounce(this._filterSessionsOnce.bind(this), 500);
  }

  _filterSessionsOnce (filteredVenues, venue) {
    const queryResults = this.queryResults;
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (this.loading) return;
        this.hidden = queryResults ? queryResults.length > 0 : false;

        if (this.session && queryResults) {
          for (let result of queryResults) {
            if (result.searchType === 'session' && result.objectID === this.sessionId) {
              this.showPublications = true;
              this.hidden = false;
            }
            if (result.publications) {
              for (let publicationId in result.publications) {
                if (this.session.publications && this.session.publications[publicationId]) {
                  this.showPublications = true;
                  this.hidden = false;
                }
              }
            }
            if (result.searchType === 'publication' && this.session.publications && this.session.publications[result.objectID]) {
              this.showPublications = true;
              this.hidden = false;
              if (this.shadowRoot.querySelector(`chi-publication[show-publication-id="${result.objectID}"]`)) this.shadowRoot.querySelector(`chi-publication[show-publication-id="${result.objectID}"]`).removeAttribute('hidden');
            }
            if (!this.hidden) break;
          }
        }
        this.hidden = this.hidden || (filteredVenues && filteredVenues.indexOf(venue ? venue.toLowerCase() : null) < 0);
        this.dispatchEvent(new CustomEvent('chi-session-hidden'));
        time = 100;
        // console.log('session-call')
      }, time);
    });
  }

  _filterSessions (filteredVenues, venue, queryResults) {
    // if (!this.session || (queryResults && !queryResults.length)) return;
    this._debouncedFilterSessionsOnce(filteredVenues, venue, queryResults);
    // console.log(filteredVenues, venue, queryResults)
  }

  _showPublication (paramsSessionId, paramsOldSessionId, sessionId) {
    this.showPublications = this._isEqual(paramsSessionId, sessionId);
    this._focusPublications = this._isEqual(paramsSessionId, sessionId) || this._isEqual(paramsOldSessionId, sessionId);
    requestAnimationFrame(() => {
      setTimeout(() => {
        // if (this._focusPublications) scroll(0, (scrollY + this.shadowRoot.querySelector('h3').getBoundingClientRect().top) - 102);
        if (this._focusPublications) {
          this.shadowRoot.querySelector(`.invi-anchor-session-${sessionId}`).scrollIntoView({
            block: 'start',
            behavior: 'smooth'
          });
          time = 100;
        }
      }, time);
    });
  }

  _showPublicationClass (showPublications) {
    return showPublications ? 'show-publications' : '';
  }

  _cleanText (title) {
    return title && title.replace(/&nbsp;/, ' ').replace(/&amp;/, '&');
  }

  _setClass (venue) { if (venue) this.classList.add(venue.toLowerCase().replace(/ /, '-')); }

  _addVenue (venue, oldVenues) {
    if (venue && oldVenues.indexOf(venue.toLowerCase()) < 0) {
      const venues = [ ...oldVenues, venue.toLowerCase() ];
      this.dispatch({ type: CHI_STATE.VENUE, venues });
    }
  }

  _isEqual (a, b) { return a === b; }

  getVenue (venue) {
    if (venue) {
      switch (venue.toLowerCase()) {
        case 'altchi':
          return 'alt.chi';
        case 'casestudy':
          return 'Case Study';
        case 'docconsortium':
          return 'Doctoral Consortium';
        default:
          return venue.charAt(0).toUpperCase() + venue.slice(1);
      }
    }
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

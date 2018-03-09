// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiSessionMixin } from 'chi-session-mixin';
import { customElements, requestAnimationFrame, CustomEvent, history, dispatchEvent } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { CHI_STATE } from 'chi-interactive-schedule/reducer';
import { debounce } from 'chi-interactive-schedule/debounce';
import { checkVisible } from 'chi-interactive-schedule/check-visible';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import 'chi-publication';
import 'chi-room';
import 'marked-element';

// define style and template
import style from './style.styl';
import template from './template.html';

let time = 500; // haxx
let loaded = false;

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
      timeString: {
        type: String
      },
      dateString: {
        type: String
      },
      dayString: {
        type: String
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
      },
      forceClose: {
        type: Boolean,
        reflectToAttribute: true,
        value: false
      }
    };
  }

  static get observers () {
    return [
      '_showPublication(params.sessionId, params.oldSessionId, sessionId, params.search)',
      '_setClass(session.venue)',
      '_addVenue(session.venue, venues)',
      '_showAndFocusPublication(showPublications, _focusPublications)',
      // '_setLoading(loading, time)',
      '_filterSessions(filteredVenues, session.venue, queryResults)'
    ];
  }

  constructor () {
    super();
    this._debouncedFilterSessionsOnce = debounce(this._filterSessionsOnce.bind(this), 500);
    this._debouncedShowPublicationOnce = debounce(this._showPublicationOnce.bind(this), 500);
    this._debouncedShowAndFocusPublication = debounce(this._showAndFocusPublicationOnce.bind(this), 500);
    // this._debouncedShowPublicationFast = debounce(this._showPublicationOnce.bind(this), 100);
  }

  _toTextUrl (text) {
    return encodeURI(text);
  }

  _getDateTime (dayString, dateString, time) {
    return `${dayString}, ${dateString} - ${time.split('-')[0]}`;
  }

  _filterSessionsOnce (filteredVenues, venue) {
    const queryResults = this.queryResults;
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (this.loading) return;
        this.hidden = queryResults ? queryResults.length > 0 : false;

        if (this.session && queryResults) {
          for (let indexResult in queryResults) {
            let result = queryResults[indexResult];
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
              if (this.shadowRoot.querySelector(`chi-publication[show-publication-id="${result.objectID}"]`)) {
                this.shadowRoot.querySelector(`chi-publication[show-publication-id="${result.objectID}"]`).removeAttribute('hidden');
              }
            }
            if (!this.hidden) break;
          }
        }
        this.hidden = this.hidden || (filteredVenues && filteredVenues.indexOf(venue ? venue.toLowerCase() : null) < 0);
        this.dispatchEvent(new CustomEvent('chi-session-hidden'));
        time = 100;
        // this._showPublication(this.params.sessionId, this.params.oldSessionId, this.sessionId, this.params.search);
        // console.log('session-call')
      }, time);
    });
  }

  _filterSessions (filteredVenues, venue, queryResults) {
    // if (!this.session || (queryResults && !queryResults.length)) return;
    this._debouncedFilterSessionsOnce(filteredVenues, venue, queryResults);
    // console.log(filteredVenues, venue, queryResults)
  }

  _showPublication (paramsSessionId, paramsOldSessionId, sessionId, search) {
    loaded
      ? this._showPublicationOnce(paramsSessionId, paramsOldSessionId, sessionId, search)
      : this._debouncedShowPublicationOnce(paramsSessionId, paramsOldSessionId, sessionId, search);
  }

  _showPublicationOnce (paramsSessionId, paramsOldSessionId, sessionId, search) {
    this.showPublications = (this._isEqual(paramsSessionId, sessionId) && !this.forceClose);
    this._focusPublications = this._isEqual(paramsSessionId, sessionId); // || this._isEqual(paramsOldSessionId, sessionId);

    if (this.showPublications && !search) {
      if (!this._clone) {
        this._clone = this.cloneNode();
        this._clone.forceClose = true;
        this._clone.loading = false;
        this.parentNode.insertBefore(this._clone, this);
        this._clone.hidden = false;
        this._clone.dontLoad = true;
        this._clone.sessionId = this.sessionId;
        this._clone.session = this.session;
        this._clone.addEventListener('click', () => {
          history.pushState({}, '', `?timeslotId=${this.timeslotId}&oldSessionId=${sessionId}&${search && search.trim() ? `search=${search}` : ''}`);
          dispatchEvent(new CustomEvent('location-changed'));
        });
      }
    } else if (this._clone) {
      // console.log(this._clone);
      this.parentNode.removeChild(this._clone);
      this._clone = null;
    }
  }

  _showAndFocusPublication (showPublications, _focusPublications) {
    this._debouncedShowAndFocusPublication(showPublications, _focusPublications);
  }

  _showAndFocusPublicationOnce (showPublications, _focusPublications) {
    const { search, sessionId } = this;
    requestAnimationFrame(() => {
      setTimeout(() => {
        // if (this._focusPublications) scroll(0, (scrollY + this.shadowRoot.querySelector('h3').getBoundingClientRect().top) - 102);
        if (this._focusPublications && !this.forceClose && !this.params.publicationId && !search) {
          // scroll(0, (scrollY + this._clone.shadowRoot.querySelector(`.invi-anchor-session-${sessionId}`).getBoundingClientRect().top) - 102);

          const el = window.innerWidth >= 450
            ? this._clone.shadowRoot.querySelector(`.invi-anchor-session-${sessionId}`)
            : this.shadowRoot.querySelector(`.invi-anchor-session-${sessionId}`);

          el.scrollIntoView({
            block: 'start',
            behavior: 'smooth'
          });
          loaded = true;
          // console.log(checkVisible(el))
          if (!checkVisible(el)) {
            setTimeout(() => {
              this._showAndFocusPublication(showPublications, _focusPublications);
            }, 200);
          }
        }
      }, 200);
    });
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

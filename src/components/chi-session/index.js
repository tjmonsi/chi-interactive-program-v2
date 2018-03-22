// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiSessionMixin } from 'chi-session-mixin';
import { customElements, requestAnimationFrame, CustomEvent, history, dispatchEvent, scroll, scrollY } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { CHI_STATE } from 'chi-interactive-schedule/reducer';
import { debounce } from 'chi-interactive-schedule/debounce';
// import { checkVisible } from 'chi-interactive-schedule/check-visible';
import toastr from 'toastr';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import 'chi-publication';
import 'chi-room';
import 'marked-element';

// define style and template
import style from './style.styl';
import template from './template.html';

toastr.options = {
  'closeButton': true,
  'debug': false,
  'newestOnTop': false,
  'progressBar': true,
  'positionClass': 'toast-bottom-full-width',
  'preventDuplicates': true,
  'onclick': null,
  'showDuration': '300',
  'hideDuration': '1000',
  'timeOut': '5000',
  'extendedTimeOut': '1000',
  'showEasing': 'swing',
  'hideEasing': 'linear',
  'showMethod': 'fadeIn',
  'hideMethod': 'fadeOut'
};

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
      forceOpen: {
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
      '_showPublication(params.sessionId, params.oldSessionId, sessionId, params.timeslotId, timeslotId, forceOpen, params.search, session)',
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
        this.hidden = this.hidden || (venue && filteredVenues && filteredVenues.indexOf(venue.toLowerCase()) < 0);
        // if (this.sessionId === '-L7SBTLdBf3qw5014YjK') console.log(this.sessionId, venue, filteredVenues, venue && filteredVenues && filteredVenues.indexOf(venue.toLowerCase()) < 0)
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

  _showPublication (paramsSessionId, paramsOldSessionId, sessionId, paramsTimeslotId, timeslotId, forceOpen, search) {
    loaded
      ? this._showPublicationOnce(paramsSessionId, paramsOldSessionId, sessionId, paramsTimeslotId, timeslotId, forceOpen, search)
      : this._debouncedShowPublicationOnce(paramsSessionId, paramsOldSessionId, sessionId, paramsTimeslotId, timeslotId, forceOpen, search);
  }

  _showPublicationOnce (paramsSessionId, paramsOldSessionId, sessionId, paramsTimeslotId, timeslotId, forceOpen, search) {
    this.showPublications = (this._isEqual(paramsSessionId, sessionId) && !this.forceClose) || (this._isEqual(paramsTimeslotId, timeslotId) && forceOpen === 'yes');
    this._focusPublications = this._isEqual(paramsSessionId, sessionId); // || this._isEqual(paramsOldSessionId, sessionId);

    if (forceOpen === 'yes') return;

    if (this.showPublications && !search) {
      if (!this._clone) {
        this._clone = this.cloneNode();
        this._clone.forceClose = true;
        this._clone.loading = false;
        this.parentNode.insertBefore(this._clone, this);
        this._clone.hidden = false;
        this._clone.dontLoad = true;
        this._clone.sessionId = this.sessionId;

        this._clone.addEventListener('click', () => {
          history.pushState({}, '', `?timeslotId=${this.timeslotId}&oldSessionId=${sessionId}&${search && search.trim() ? `search=${search}` : ''}`);
          dispatchEvent(new CustomEvent('location-changed'));
        });

        setTimeout(() => {
          this._clone.session = this.session;
          console.log(this._clone.session, this.session);
        }, 500);
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
        if (this._focusPublications && !this.forceClose && !this.params.publicationId && !search && !loaded) {
          scroll(0, (scrollY + this._clone.shadowRoot.querySelector(`.invi-anchor-session-${sessionId}`).getBoundingClientRect().top) - 102);
          loaded = true;
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

  copyLink () {
    const copyText = document.createElement('input');
    const { location: { protocol, host, pathname } } = window;
    copyText.value = `${protocol}//${host}${pathname}?timeslotId=${encodeURI(this.timeslotId)}&sessionId=${encodeURI(this.sessionId)}`;
    copyText.style.display = 'inline';
    copyText.style.position = 'fixed';
    copyText.style.opacity = 0;
    this.shadowRoot.appendChild(copyText);
    copyText.select();
    document.execCommand('copy');
    this.shadowRoot.removeChild(copyText);
    console.log('copied');
    toastr.info(`Copied Session link: "${this.session.title}" to the clipboard`);
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

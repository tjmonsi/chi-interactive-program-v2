// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiSessionMixin } from 'chi-session-mixin';
import { customElements, scrollTo, scrollY, requestAnimationFrame, CustomEvent } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { CHI_STATE } from 'chi-interactive-schedule/reducer';
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
      }
    };
  }

  static get observers () {
    return [
      '_showPublication(params.sessionId, sessionId)',
      '_setClass(session.venue)',
      '_addVenue(session.venue, venues)',
      '_filterSessions(filteredVenues, session.venue, queryResults, filteredVenues.splices, queryResults.splices, sessionId, session)'
    ];
  }

  _filterInformation (queryResults) {
    if (queryResults) {
      this.hidden = queryResults.length > 0;

      if (this.session) {
        for (let result of queryResults) {
          if (result.searchType === 'session' && result.objectID === this.sessionId) {
            this.hidden = false;
          }
          if (result.publications) {
            for (let publicationId in result.publications) {
              // if (this.session.publications) console.log(this.session.publications[publicationId], publicationId)
              if (this.session.publications && this.session.publications[publicationId]) {
                this.showPublications = true;
                this.hidden = false;
              }
            }
          }
          if (!this.hidden) break;
        }
      }
    }
  }

  _filterSessions (filteredVenues, venue, queryResults) {
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
        if (!this.hidden) break;
      }
    }
    this.hidden = this.hidden || (filteredVenues && filteredVenues.indexOf(venue ? venue.toLowerCase() : null) < 0);
    this.dispatchEvent(new CustomEvent('chi-session-hidden'));
  }

  _showPublication (paramsSessionId, sessionId) {
    this.showPublications = this._isEqual(paramsSessionId, sessionId);
    this._focusPublications = this._isEqual(paramsSessionId, sessionId);
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (this._focusPublications) scrollTo(0, (scrollY + this.shadowRoot.querySelector('h3').getBoundingClientRect().top) - 102);
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

  _addVenue (venue, oldVenues) {
    if (venue && oldVenues.indexOf(venue.toLowerCase()) < 0) {
      const venues = [ ...oldVenues, venue.toLowerCase() ];
      this.dispatch({ type: CHI_STATE.VENUE, venues });
    }
  }

  _isEqual (a, b) { return a === b; }

  getVenue (venue) {
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

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

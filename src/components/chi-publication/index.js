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
  }

  static get observers () {
    return [
      '_showInformation(params.publicationId, params.oldPublicationId, publicationId, publication, filteredVenues, publication.venue, filteredVenues.splices)',
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
      for (let result of queryResults) {
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

  _showInformation (paramsPublicationId, paramsOldPublicationId, publicationId) {
    // console.log(this.publication)
    this.showInformation = this._isEqual(paramsPublicationId, publicationId);
    this._focusInformation = this._isEqual(paramsPublicationId, publicationId) || this._isEqual(paramsOldPublicationId, publicationId);
    requestAnimationFrame(() => {
      setTimeout(() => {
        // if (this.showInformation) { scrollTo(0, (scrollY + this.shadowRoot.querySelector('h4').getBoundingClientRect().top) - 102); }
        if (this._focusInformation) {
          this.shadowRoot.querySelector(`.invi-anchor-pub-${publicationId}`).scrollIntoView({
            block: 'start',
            behavior: 'smooth'
          });
        }
      }, 200);
    });
  }

  _isEqual (a, b) { return a === b; }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

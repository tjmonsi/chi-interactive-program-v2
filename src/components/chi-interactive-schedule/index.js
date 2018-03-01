// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners';
import { customElements, IntersectionObserver, scrollTo, history, dispatchEvent, CustomEvent } from 'global/window';
import { ChiScheduleMixin } from 'chi-schedule-mixin';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { conf } from 'chi-conference-config';
import { CHI_STATE } from './reducer';
import { debounce } from './debounce';
import algoliasearch from 'algoliasearch/lite';
import '@littleq/path-fetcher';
import '@littleq/query-params-fetcher';
import 'chi-full-schedule';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';

// define style and template
import style from './style.styl';
import template from './template.html';

const client = algoliasearch('3QB5G30QFN', '67be59962960c0eb7aec182885ef1b3f');
const index = client.initIndex(`chi-index-${conf}`);

class Component extends GestureEventListeners(LittleQStoreMixin(ChiScheduleMixin(Element))) {
  static get is () { return 'chi-interactive-schedule'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      params: {
        type: Boolean,
        statePath: 'littleqQueryParams.params'
      },
      venues: {
        type: Array,
        statePath: 'chiState.venues'
      },
      filteredVenues: {
        type: Array,
        statePath: 'chiState.filteredVenues'
      },
      _baseUrl: {
        type: String,
        value: window.baseURL || '/'
      }
    };
  }

  static get observers () {
    return [
      'closeNavigation(params.scheduleId, params.sessionId, params.publicationId)',
      '_queryChanged(params.search)',
      '_updateParent(params, params.*)',
      '_goToTop(params.sessionId)'
    ];
  }

  constructor () {
    super();
    this._debouncedSearch = debounce(this.search.bind(this), 500);
  }

  connectedCallback () {
    super.connectedCallback();
    const target = this.shadowRoot.querySelector('nav.on-top');
    const fixed = this.shadowRoot.querySelector('nav.fixed');
    const options = { threshold: 0 };

    this._observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(({target: entryTarget, isIntersecting}) => {
        if (entryTarget) fixed.style.display = isIntersecting ? 'none' : 'block';
      });
    }, options);

    this._observer.observe(target);
    this._filterContainer = false;
  }

  disconnectedCallback () {
    super.disconnectedCallback();
    if (this._observer) this._observer.disconnect();
  }

  _updateParent (params) {
    const queryParams = [];
    for (let q in params) { if (params[q]) queryParams.push(q + '=' + params[q]); }
    if (window.top && window.top.history) window.top.history.pushState({}, '', '?' + queryParams.join('&'));
    else if (window.top && window.top.updateURL && typeof window.top.updateURL === 'function') window.parent.updateURL(params);
  }

  _goToTop (sessionId) {
    if (sessionId === 'all') scrollTo(0, 0);
  }

  openNavigation () {
    this.shadowRoot.querySelectorAll('.nav-button.menu').forEach(node => (node.style.display = 'none'));
    this.shadowRoot.querySelectorAll('.nav-button.close').forEach(node => (node.style.display = 'block'));
    this.shadowRoot.querySelector('.fixed-phone').style.display = 'block';
    this.shadowRoot.querySelector('.filter-container').style.display = 'none';
    this._filterContainer = false;
  }

  closeNavigation () {
    this.shadowRoot.querySelectorAll('.nav-button.menu').forEach(node => (node.style.display = 'block'));
    this.shadowRoot.querySelectorAll('.nav-button.close').forEach(node => (node.style.display = 'none'));
    this.shadowRoot.querySelector('.fixed-phone').style.display = 'none';
    this.shadowRoot.querySelector('.filter-container').style.display = 'none';
    this._filterContainer = false;
  }

  filter () {
    this.shadowRoot.querySelectorAll('.nav-button.menu').forEach(node => (node.style.display = 'block'));
    this.shadowRoot.querySelectorAll('.nav-button.close').forEach(node => (node.style.display = 'none'));
    this.shadowRoot.querySelector('.fixed-phone').style.display = 'none';
    this._filterContainer = !this._filterContainer;
    this.shadowRoot.querySelector('.filter-container').style.display = this._filterContainer ? 'block' : 'none';
  }

  _onChangeQuery ({ target: el }) {
    this.shadowRoot.querySelectorAll('[name=search]').forEach(node => {
      if (node !== el) node.value = el.value;
    });
    this._debouncedSearch();
  }

  search () {
    let query = '';
    this.shadowRoot.querySelectorAll('[name=search]').forEach(node => {
      query = node.value || query;
    });
    history.pushState({}, '', query ? `?search=${query}` : '?sessionId=all');
    dispatchEvent(new CustomEvent('location-changed'));
  }

  clear () {
    const queryParams = [];
    for (let q in this.params) {
      if (q !== 'search') queryParams.push(`${q}=${this.params[q]}`);
    }
    history.pushState({}, '', `?${queryParams.join('&')}`);
    dispatchEvent(new CustomEvent('location-changed'));
  }

  async _queryChanged (query) {
    this.shadowRoot.querySelectorAll('[name=search]').forEach(node => {
      node.value = query || '';
    });
    const { hits: queryResults } = query
      ? await index.search(query, {
        hitsPerPage: 300,
        attributesToRetrieve: [
          'authors', 'conferenceId', 'searchType', 'sessionId', 'timeslots', 'publications', 'scheduleId', 'timeslotId'
        ]
      })
      : { hits: [] };
    this.dispatch({ type: CHI_STATE.QUERY_RESULTS, queryResults });
  }

  addFilter ({ target: el }) {
    // console.log(this.shadowRoot.querySelector('#filterForm').filter)
    setTimeout(() => {
      const { value, checked } = el;
      const filteredVenues = [ ...this.filteredVenues ];
      const index = filteredVenues.indexOf(value);
      if (checked && index < 0) filteredVenues.push(value);
      else if (!checked && index >= 0) {
        filteredVenues.splice(index, 1);
        if (filteredVenues.indexOf('all') >= 0) filteredVenues.splice(filteredVenues.indexOf('all'), 1);
      }
      this.dispatch({ type: CHI_STATE.FILTER_VENUE, filteredVenues });
    }, 10);
  }

  _setFilterId (venue) { this.classList.add(venue.toLowerCase().replace(/ /, '-')); }

  _checkIfFiltered (venue, filteredVenues) {
    return filteredVenues.indexOf(venue) >= 0;
  }

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

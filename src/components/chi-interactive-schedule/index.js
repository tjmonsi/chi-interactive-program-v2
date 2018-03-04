// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners';
import { customElements, IntersectionObserver, scrollTo, history, dispatchEvent, CustomEvent } from 'global/window';
import { ChiScheduleMixin } from 'chi-schedule-mixin';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { conf } from 'chi-conference-config';
import { CHI_STATE, defaultFilteredSearch } from './reducer';
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
      filteredSearch: {
        type: Array,
        statePath: 'chiState.filteredSearch'
      },
      defaultFilteredSearch: {
        type: Array,
        value: defaultFilteredSearch
      },
      searching: {
        type: Boolean,
        value: false
      },
      showFilterWarning: {
        type: Boolean,
        value: false
      },
      hitsNumber: {
        type: Number,
        value: 0
      },
      searchResultTypes: {
        type: Object,
        value: {}
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
      '_queryChanged(params.search, filteredSearch)',
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

    document.querySelector('#loading-screen').style.display = 'none';
    if (window.loaderInterval) clearInterval(window.loaderInterval);
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
    this.shadowRoot.querySelector('.fixed-phone').style.top =
      this.shadowRoot.querySelector('.fixed').style.display === 'none'
        ? (this.shadowRoot.querySelector('.container').getBoundingClientRect().top <= (window.innerHeight / 2) ? (this.shadowRoot.querySelector('.container').getBoundingClientRect().top + 72) + 'px' : '0px')
        : '72px';
    this.shadowRoot.querySelector('.fixed-phone').style.bottom =
      this.shadowRoot.querySelector('.fixed').style.display === 'none'
        ? (this.shadowRoot.querySelector('.container').getBoundingClientRect().top > (window.innerHeight / 2) ? (window.innerHeight - this.shadowRoot.querySelector('.container').getBoundingClientRect().top) + 'px' : '0px')
        : null;
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
    if (this._filterContainer) {
      this.shadowRoot.querySelector('.filter-container').style.top =
        this.shadowRoot.querySelector('.fixed').style.display === 'none'
          ? (this.shadowRoot.querySelector('.container').getBoundingClientRect().top <= (window.innerHeight / 2)
            ? (this.shadowRoot.querySelector('.container').getBoundingClientRect().top + 72) + 'px'
            : '0px')
          : '72px';
      this.shadowRoot.querySelector('.filter-container').style.bottom =
        this.shadowRoot.querySelector('.fixed').style.display === 'none'
          ? (this.shadowRoot.querySelector('.container').getBoundingClientRect().top > (window.innerHeight / 2)
            ? (window.innerHeight - this.shadowRoot.querySelector('.container').getBoundingClientRect().top) + 'px'
            : '0px')
          : null;
    }
  }

  _onChangeQuery ({ target: el }) {
    this.shadowRoot.querySelectorAll('[name=search]').forEach(node => {
      if (node !== el) node.value = el.value;
    });
    this._debouncedSearch();
  }

  formSearch (e) {
    e.preventDefault();
    this.search();
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

  async _queryChanged (query, filteredSearch) {
    this.shadowRoot.querySelectorAll('[name=search]').forEach(node => {
      node.value = query || '';
    });
    this.searching = true;
    this.showFilterWarning = false;
    const settings = {
      query,
      hitsPerPage: 100,
      attributesToRetrieve: [
        'authors', 'conferenceId', 'searchType', 'sessionId', 'timeslots', 'publications', 'scheduleId', 'timeslotId'
      ],
      typoTolerance: 'strict'
    };

    // console.log(filteredSearch)

    if (filteredSearch && filteredSearch.length && filteredSearch.indexOf('all') < 0) {
      settings.restrictSearchableAttributes = [];
      const searchType = [];
      filteredSearch.forEach(filter => {
        switch (filter) {
          case 'people':
            settings.restrictSearchableAttributes = [ ...settings.restrictSearchableAttributes, 'displayName', 'email', 'firstName', 'lastName' ];
            if (searchType.indexOf('author') < 0) searchType.push('author');
            break;
          case 'institution':
            settings.restrictSearchableAttributes = [ ...settings.restrictSearchableAttributes, 'primary.institution', 'primary.dept', 'primary.city', 'primary.country' ];
            if (searchType.indexOf('author') < 0) searchType.push('author');
            break;
          case 'session':
            if (settings.restrictSearchableAttributes.indexOf('title') < 0) settings.restrictSearchableAttributes = [ ...settings.restrictSearchableAttributes, 'title' ];
            if (searchType.indexOf('session') < 0) searchType.push('session');
            break;
          case 'paper-title':
            if (settings.restrictSearchableAttributes.indexOf('title') < 0) settings.restrictSearchableAttributes = [ ...settings.restrictSearchableAttributes, 'title' ];
            if (searchType.indexOf('publication') < 0) searchType.push('publication');
            break;
          case 'abstract':
            settings.restrictSearchableAttributes = [ ...settings.restrictSearchableAttributes, 'abstract', 'shortText' ];
            if (searchType.indexOf('publication') < 0) searchType.push('publication');
            break;
        }
      });
      if (searchType.length) {
        settings.filters = searchType.map(item => `searchType:${item}`).join(' OR ');
      }
    }

    try {
      const { hits: queryResults, nbHits } = query
        ? await index.search(settings)
        : { hits: [] };
      this.searching = false;
      this.hitsNumber = nbHits;
      const searchResultTypes = {
        author: 0,
        publication: 0,
        session: 0
      };
      queryResults.forEach(hit => {
        searchResultTypes[hit.searchType]++;
      });

      this.set('searchResultTypes', searchResultTypes);

      if (nbHits > 100) {
        this.showFilterWarning = true;
        this.dispatch({ type: CHI_STATE.QUERY_RESULTS, queryResults: [] });
        return;
      }

      if (this._filterContainer) this.filter();

      this.dispatch({ type: CHI_STATE.QUERY_RESULTS, queryResults });
    } catch (error) {
      console.log(error);
    }
  }

  toggleVenueFilter ({ target: el }) {
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

  toggleSearchFilter ({ target: el }) {
    setTimeout(() => {
      const { value, checked } = el;
      const filteredSearch = [ ...this.filteredSearch ];
      const index = filteredSearch.indexOf(value);
      if (checked && index < 0) filteredSearch.push(value);
      else if (!checked && index >= 0) {
        filteredSearch.splice(index, 1);
        if (filteredSearch.indexOf('all') >= 0) filteredSearch.splice(filteredSearch.indexOf('all'), 1);
      }
      this.dispatch({ type: CHI_STATE.FILTER_SEARCH, filteredSearch });
    }, 10);
  }

  _setFilterId (venue) { this.classList.add(venue.toLowerCase().replace(/ /, '-')); }

  _checkIfFiltered (venue, filteredVenues) {
    return filteredVenues.indexOf(venue) >= 0;
  }

  _checkSearchFiltered (filter, filteredSearch) {
    return filteredSearch.indexOf(filter) >= 0;
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

  getSearch (filter) {
    switch (filter.toLowerCase()) {
      case 'paper-title':
        return 'Paper Title';

      default:
        return filter.charAt(0).toUpperCase() + filter.slice(1);
    }
  }

  goUp () {
    this.scrollIntoView({
      block: 'start',
      behavior: 'smooth'
    });
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

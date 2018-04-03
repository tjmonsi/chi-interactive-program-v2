// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiScheduleMixin } from 'chi-schedule-mixin';
import { customElements, history, CustomEvent, dispatchEvent } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { CHI_STATE, defaultFilteredSearch } from 'chi-interactive-schedule-2/reducer';
import { debounce } from 'chi-interactive-schedule-2/debounce';
import { toastr } from 'toastr-component';
import { store } from 'chi-store';
import '@polymer/polymer/lib/elements/dom-repeat';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends LittleQStoreMixin(ChiScheduleMixin(Element)) {
  static get is () { return 'chi-header'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      currentScheduleId: {
        type: String
      },
      params: {
        type: Object,
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
      _baseUrl: {
        type: String,
        value: window.baseURL || '/'
      }
    };
  }

  static get observers () {
    return [
      '_checkParams(params, currentScheduleId, params.*)'
    ];
  }

  constructor () {
    super();
    this._debouncedSearch = debounce(this.search.bind(this), 2000);
    this._boundStoreUpdate = this._storeUpdate.bind(this);
  }

  connectedCallback () {
    super.connectedCallback();
    window.addEventListener('chi-update-session', this._boundStoreUpdate);
  }

  disconnectedCallback () {
    super.disconnectedCallback();
    window.removeEventListener('chi-update-session', this._boundStoreUpdate);
  }

  _checkParams (params, currentScheduleId) {
    if (params.scheduleId !== currentScheduleId) {
      this.currentScheduleId = params.scheduleId;
      this.closeNavigation();
    }

    this.shadowRoot.querySelector('[name=search]').value = params.search || '';
  }

  _storeUpdate () {
    this.dispatch({ type: CHI_STATE.VENUE, venues: store.venueList });
  }

  _slugifyClass (venue) {
    return venue.toLowerCase().replace(/ /, '-');
  }

  _returnSearch (filter) {
    return filter.map(item => this.getSearch(item)).join(', ');
  }

  _returnVenues (filter) {
    return filter.map(item => this.getVenue(item)).join(', ');
  }

  _ifTheresAll (filter) {
    return filter.indexOf('all') >= 0;
  }

  _onChangeQuery ({ target: el }) {
    this._debouncedSearch();
  }

  getVenue (venue) {
    switch (venue.toLowerCase()) {
      case 'altchi':
        return 'alt.chi';
      case 'casestudy':
        return 'Case Studies';
      case 'docconsortium':
        return 'Doctoral Consortium';
      case 'keynote':
        return 'Plenaries';
      case 'sig':
        return 'Special Interest Groups (SIG)';
      case 'videoshowcase':
        return 'Video Showcase';
      case 'awards':
        return 'Awards';
      case 'lbw':
        return 'Late-breaking Work';
      default:
        return venue.charAt(0).toUpperCase() + venue.slice(1) + 's';
    }
  }

  openNavigation () {
    this.shadowRoot.querySelectorAll('.nav-button.menu').forEach(node => (node.style.display = 'none'));
    this.shadowRoot.querySelectorAll('.nav-button.close').forEach(node => (node.style.display = 'block'));
    this.shadowRoot.querySelector('.fixed-phone').style.display = 'block';
    // this.shadowRoot.querySelector('.filter-container').style.display = 'none';
    this._filterContainer = false;
  }

  closeNavigation () {
    this.shadowRoot.querySelectorAll('.nav-button.menu').forEach(node => (node.style.display = 'block'));
    this.shadowRoot.querySelectorAll('.nav-button.close').forEach(node => (node.style.display = 'none'));
    this.shadowRoot.querySelector('.fixed-phone').style.display = 'none';
    // this.shadowRoot.querySelector('.filter-container').style.display = 'none';
    this._filterContainer = false;
  }

  showClear (search, filteredSearch, filteredVenues) {
    return search || filteredSearch.indexOf('all') < 0 || filteredVenues.indexOf('all') < 0;
  }

  formSearch (e) {
    e.preventDefault();
    this.search();
  }

  search () {
    const query = this.shadowRoot.querySelector('[name=search]').value;
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

    this.dispatch({ type: CHI_STATE.FILTER_VENUE, filteredVenues: ['all'] });
    this.dispatch({ type: CHI_STATE.FILTER_SEARCH, filteredSearch: ['all'] });
  }

  filter () {
    this._filterContainer = !this._filterContainer;
    this.toggleFilter();
  }

  toggleFilter () {
    this.shadowRoot.querySelectorAll('.nav-button.menu').forEach(node => (node.style.display = 'block'));
    this.shadowRoot.querySelectorAll('.nav-button.close').forEach(node => (node.style.display = 'none'));
    this.shadowRoot.querySelector('.fixed-phone').style.display = 'none';
    this.shadowRoot.querySelector('.filter-container').style.display = this._filterContainer ? 'block' : 'none';
  }

  toggleVenueFilter ({ target: el }) {
    // console.log(this.shadowRoot.querySelector('#filterForm').filter)
    setTimeout(() => {
      if (el.nodeType === 'LABEL') {
        el = el.querySelector('input[type=checkbox]');
      }
      const { value, checked } = el;
      if (value === 'all' && !checked) {
        toastr.info('You need at least one venue checked to see the schedule.');
        return this.dispatch({ type: CHI_STATE.FILTER_VENUE, filteredVenues: [] });
      }
      const filteredVenues = [ ...this.filteredVenues ];
      const index = filteredVenues.indexOf(value);
      if (checked && index < 0) filteredVenues.push(value);
      else if (!checked && index >= 0) {
        filteredVenues.splice(index, 1);
        if (filteredVenues.indexOf('all') >= 0) filteredVenues.splice(filteredVenues.indexOf('all'), 1);
      }

      if (this._filterContainer) this.toggleFilter();
      this.dispatch({ type: CHI_STATE.FILTER_VENUE, filteredVenues });
    }, 10);
  }

  toggleSearchFilter (event) {
    event.stopPropagation();
    let { target: el } = event;
    if (el.tagName === 'LABEL') {
      el = el.querySelector('input[type=checkbox]');
    }
    const { value, checked } = el;
    setTimeout(() => {
      if (value === 'all' && !checked) {
        return this.dispatch({ type: CHI_STATE.FILTER_SEARCH, filteredSearch: [] });
      }
      const filteredSearch = [ ...this.filteredSearch ];
      const index = filteredSearch.indexOf(value);
      if (checked && index < 0) filteredSearch.push(value);
      else if (!checked && index >= 0) {
        filteredSearch.splice(index, 1);
        if (filteredSearch.indexOf('all') >= 0) filteredSearch.splice(filteredSearch.indexOf('all'), 1);
      }
      if (this._filterContainer) this.toggleFilter();
      this.dispatch({ type: CHI_STATE.FILTER_SEARCH, filteredSearch });
    }, 10);
  }

  getSearch (filter) {
    switch (filter.toLowerCase()) {
      case 'paper-title':
        return 'Paper Title';

      default:
        return filter.charAt(0).toUpperCase() + filter.slice(1);
    }
  }

  _checkIfFiltered (venue, filteredVenues) {
    return filteredVenues.indexOf(venue) >= 0;
  }

  _checkSearchFiltered (filter, filteredSearch) {
    return filteredSearch.indexOf(filter) >= 0;
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

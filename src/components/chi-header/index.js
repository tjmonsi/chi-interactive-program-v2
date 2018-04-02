// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiScheduleMixin } from 'chi-schedule-mixin';
import { customElements, history, CustomEvent, dispatchEvent } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { CHI_STATE, defaultFilteredSearch } from 'chi-interactive-schedule-2/reducer';
import { debounce } from 'chi-interactive-schedule-2/debounce';
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
  }

  _checkParams (params, currentScheduleId) {
    if (params.scheduleId !== currentScheduleId) {
      this.currentScheduleId = params.scheduleId;
      this.closeNavigation();
    }
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
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

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
import toastr from 'toastr';
import '@littleq/path-fetcher';
import '@littleq/query-params-fetcher';
import 'chi-full-schedule';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';

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
      '_goToTop(params.sessionId)',
      '_clearOldSession(params, params.oldSessionId)'
    ];
  }

  constructor () {
    super();
    this._debouncedSearch = debounce(this.search.bind(this), 2000);
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

  _clearOldSession (params) {
    const queryParams = [];
    for (let q in params) { if (params[q] && q !== 'oldSessionId') queryParams.push(q + '=' + params[q]); }
    history.pushState({}, '', '?' + queryParams.join('&'));
  }

  _goToTop (sessionId) {
    if (sessionId === 'all') scrollTo(0, 0);
  }

  _ifTheresAll (filter) {
    return filter.indexOf('all') >= 0;
  }

  _ifTheresAllTwo (filter, filter2) {
    return filter.indexOf('all') >= 0 || filter2.indexOf('all') >= 0;
  }

  _returnSearch (filter) {
    return filter.map(item => this.getSearch(item)).join(', ');
  }

  _returnVenues (filter) {
    return filter.map(item => this.getVenue(item)).join(', ');
  }

  openNavigation () {
    this.shadowRoot.querySelectorAll('.nav-button.menu').forEach(node => (node.style.display = 'none'));
    this.shadowRoot.querySelectorAll('.nav-button.close').forEach(node => (node.style.display = 'block'));
    this.shadowRoot.querySelector('.fixed-phone').style.display = 'block';
    this.shadowRoot.querySelector('.filter-container').style.display = 'none';
    this._filterContainer = false;
    // this.shadowRoot.querySelector('.fixed-phone').style.top =
    //   this.shadowRoot.querySelector('.fixed').style.display === 'none'
    //     ? (this.shadowRoot.querySelector('.container').getBoundingClientRect().top <= (window.innerHeight / 2) ? (this.shadowRoot.querySelector('.container').getBoundingClientRect().top + 72) + 'px' : '0px')
    //     : '72px';
    // this.shadowRoot.querySelector('.fixed-phone').style.bottom =
    //   this.shadowRoot.querySelector('.fixed').style.display === 'none'
    //     ? (this.shadowRoot.querySelector('.container').getBoundingClientRect().top > (window.innerHeight / 2) ? (window.innerHeight - this.shadowRoot.querySelector('.container').getBoundingClientRect().top) + 'px' : '0px')
    //     : null;
  }

  closeNavigation () {
    this.shadowRoot.querySelectorAll('.nav-button.menu').forEach(node => (node.style.display = 'block'));
    this.shadowRoot.querySelectorAll('.nav-button.close').forEach(node => (node.style.display = 'none'));
    this.shadowRoot.querySelector('.fixed-phone').style.display = 'none';
    this.shadowRoot.querySelector('.filter-container').style.display = 'none';
    this._filterContainer = false;
  }

  toggleFilter () {
    this.shadowRoot.querySelectorAll('.nav-button.menu').forEach(node => (node.style.display = 'block'));
    this.shadowRoot.querySelectorAll('.nav-button.close').forEach(node => (node.style.display = 'none'));
    this.shadowRoot.querySelector('.fixed-phone').style.display = 'none';
    this.shadowRoot.querySelector('.filter-container').style.display = this._filterContainer ? 'block' : 'none';

    if (this._filterContainer) {
      // this.shadowRoot.querySelector('.filter-container').style.top =
      //   this.shadowRoot.querySelector('.fixed').style.display === 'none'
      //     ? (this.shadowRoot.querySelector('.container').getBoundingClientRect().top <= (window.innerHeight / 2)
      //       ? (this.shadowRoot.querySelector('.container').getBoundingClientRect().top + 72) + 'px'
      //       : '0px')
      //     : '72px';
      // this.shadowRoot.querySelector('.filter-container').style.bottom =
      //   this.shadowRoot.querySelector('.fixed').style.display === 'none'
      //     ? (this.shadowRoot.querySelector('.container').getBoundingClientRect().top > (window.innerHeight / 2)
      //       ? (window.innerHeight - this.shadowRoot.querySelector('.container').getBoundingClientRect().top) + 'px'
      //       : '0px')
      //     : null;
    }
  }

  filter () {
    this._filterContainer = !this._filterContainer;
    this.toggleFilter();
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

    this.dispatch({ type: CHI_STATE.FILTER_VENUE, filteredVenues: ['all'] });
    this.dispatch({ type: CHI_STATE.FILTER_SEARCH, filteredSearch: ['all'] });
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
    if (filteredSearch && filteredSearch.length === 0) {
      toastr.info('You need at least one search filter to use search');
      return;
    }

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
            settings.restrictSearchableAttributes = [ ...settings.restrictSearchableAttributes, 'primary.institution', 'primary.dept', 'primary.city', 'primary.country', 'secondary.institution', 'secondary.dept', 'secondary.city', 'secondary.country' ];
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
        primaryInstitution: 0,
        secondaryInstitution: 0,
        publication: 0,
        session: 0,
        publicationList: [],
        displayNameList: [],
        displayNamePublicationList: [],
        primaryInstitutionList: [],
        secondaryInstitutionList: [],
        secondaryPublicationInstutionList: []
      };
      queryResults.forEach(hit => {
        const { searchType, publications, _highlightResult } = hit;
        if (searchType === 'author') {
          const { displayName, primary, secondary } = _highlightResult;
          const { institution } = primary;
          const { institution: institution2 } = secondary;

          const displayNameItem = displayName.value.replace(/<em>/g, '').replace(/<\/em>/g, '');

          if (displayName.matchedWords.length) {
            let index = searchResultTypes.displayNameList.findIndex(item => item.displayName === displayNameItem);
            if (index < 0) {
              searchResultTypes.displayNameList.push({
                displayName: displayNameItem,
                publications: []
              });
              index = searchResultTypes.displayNameList.length - 1;
            }
            Object.entries(publications).forEach(([pub]) => {
              if (searchResultTypes.displayNameList[index].publications.indexOf(pub) < 0) searchResultTypes.displayNameList[index].publications.push(pub);
            });
            searchResultTypes[searchType] = searchResultTypes.displayNameList.length;
          }

          const institutionItem = institution.value.replace(/<em>/g, '').replace(/<\/em>/g, '');

          if (institution.matchedWords.length) {
            let index = searchResultTypes.primaryInstitutionList.findIndex(item => item.institution === institutionItem);
            if (index < 0) {
              searchResultTypes.primaryInstitutionList.push({
                institution: institutionItem,
                publications: []
              });
              index = searchResultTypes.primaryInstitutionList.length - 1;
            }
            Object.entries(publications).forEach(([pub]) => {
              if (searchResultTypes.primaryInstitutionList[index].publications.indexOf(pub) < 0) searchResultTypes.primaryInstitutionList[index].publications.push(pub);
            });
            searchResultTypes.primaryInstitution = searchResultTypes.primaryInstitutionList.length;
          }

          const institution2Item = institution2.value.replace(/<em>/g, '').replace(/<\/em>/g, '');

          if (institution2.matchedWords.length) {
            let index = searchResultTypes.secondaryInstitutionList.findIndex(item => item.institution === institution2Item);
            if (index < 0) {
              searchResultTypes.secondaryInstitutionList.push({
                institution: institution2Item,
                publications: []
              });
              index = searchResultTypes.secondaryInstitutionList.length - 1;
            }
            Object.entries(publications).forEach(([pub]) => {
              if (searchResultTypes.secondaryInstitutionList[index].publications.indexOf(pub) < 0) searchResultTypes.secondaryInstitutionList[index].publications.push(pub);
            });
            searchResultTypes.secondaryInstitution = searchResultTypes.secondaryInstitutionList.length;
          }

          if (institution2.matchedWords.length && searchResultTypes.secondaryInstitutionList.indexOf(institution2Item) < 0) {
            if (institution.matchedWords.length) {
              searchResultTypes.secondaryInstitutionList.push(institution2Item);
              Object.entries(publications).forEach(([pub]) => {
                if (searchResultTypes.secondaryPublicationInstutionList.indexOf(pub) < 0) searchResultTypes.secondaryPublicationInstutionList.push(pub);
              });
            }
            searchResultTypes.secondaryInstitution = searchResultTypes.secondaryPublicationInstutionList.length;
          }
          // if (city2.matchedWords.length || country2.matchedWords.length || institution2.matchedWords.length) {
          //   searchResultTypes.secondaryInstitution++;
          // }
          return;
        }
        searchResultTypes[searchType]++;
      });

      this.set('searchResultTypes', searchResultTypes);

      if (nbHits > 100) {
        this.showFilterWarning = true;
        this.dispatch({ type: CHI_STATE.QUERY_RESULTS, queryResults: [] });
        return;
      }

      if (this._filterContainer) this.toggleFilter();

      this.dispatch({ type: CHI_STATE.QUERY_RESULTS, queryResults });
    } catch (error) {
      console.log(error);
      // if (this._filterContainer) this.toggleFilter();
    }
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

  _setFilterId (venue) { this.classList.add(venue.toLowerCase().replace(/ /, '-')); }

  _checkIfFiltered (venue, filteredVenues) {
    return filteredVenues.indexOf(venue) >= 0;
  }

  _checkSearchFiltered (filter, filteredSearch) {
    return filteredSearch.indexOf(filter) >= 0;
  }

  _slugifyClass (venue) {
    return venue.toLowerCase().replace(/ /, '-');
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
      default:
        return venue.charAt(0).toUpperCase() + venue.slice(1) + 's';
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

  showClear (search, filteredSearch, filteredVenues) {
    return search || filteredSearch.indexOf('all') < 0 || filteredVenues.indexOf('all') < 0;
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);

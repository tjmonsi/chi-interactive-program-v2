// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiScheduleMixin } from 'chi-schedule-mixin';
import { customElements } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { CHI_STATE, defaultFilteredSearch } from 'chi-interactive-schedule-2/reducer';
import { toastr } from 'toastr-component';
import { conf } from 'chi-conference-config';
import { store } from 'chi-store';
import algoliasearch from 'algoliasearch/lite';

const client = algoliasearch('3QB5G30QFN', '67be59962960c0eb7aec182885ef1b3f');
const index = client.initIndex(`chi-index-${conf}`);

class Component extends LittleQStoreMixin(ChiScheduleMixin(Element)) {
  static get is () { return 'chi-search'; }

  static get properties () {
    return {
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
      showFilterWarning: {
        type: Boolean,
        value: false,
        notify: true
      }
    };
  }

  static get observers () {
    return [
      '_checkParams(params, params.*)'
    ];
  }

  _checkParams (params, currentScheduleId) {
    if (params.search) {
      this._queryChanged(params.search, this.filteredSearch);
    }
  }

  async _queryChanged (query, filteredSearch) {
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
      for (let filter of filteredSearch) {
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
      }
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

      for (let hit of queryResults) {
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
            const pkeys = Object.keys(publications);

            for (let i = 0, l = pkeys.length; i < l; i++) {
              const pub = pkeys[i];
              if (searchResultTypes.displayNameList[index].publications.indexOf(pub) < 0) searchResultTypes.displayNameList[index].publications.push(pub);
            }

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

            const pkeys = Object.keys(publications);

            for (let i = 0, l = pkeys.length; i < l; i++) {
              const pub = pkeys[i];
              if (searchResultTypes.primaryInstitutionList[index].publications.indexOf(pub) < 0) searchResultTypes.primaryInstitutionList[index].publications.push(pub);
            }

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

            const pkeys = Object.keys(publications);

            for (let i = 0, l = pkeys.length; i < l; i++) {
              const pub = pkeys[i];
              if (searchResultTypes.secondaryInstitutionList[index].publications.indexOf(pub) < 0) searchResultTypes.secondaryInstitutionList[index].publications.push(pub);
            }

            searchResultTypes.secondaryInstitution = searchResultTypes.secondaryInstitutionList.length;
          }

          if (institution2.matchedWords.length && searchResultTypes.secondaryInstitutionList.indexOf(institution2Item) < 0) {
            if (institution.matchedWords.length) {
              searchResultTypes.secondaryInstitutionList.push(institution2Item);

              const pkeys = Object.keys(publications);

              for (let i = 0, l = pkeys.length; i < l; i++) {
                const pub = pkeys[i];
                if (searchResultTypes.secondaryPublicationInstutionList.indexOf(pub) < 0) searchResultTypes.secondaryPublicationInstutionList.push(pub);
              }
            }
            searchResultTypes.secondaryInstitution = searchResultTypes.secondaryPublicationInstutionList.length;
          }

          continue;
        }
        searchResultTypes[searchType]++;
      }

      // this.set('searchResultTypes', searchResultTypes);
      this.dispatch({ type: CHI_STATE.SEARCH_RESULT_TYPES, searchResultTypes });

      if (nbHits > 100) {
        this.showFilterWarning = true;
        return;
      }

      if (this._filterContainer) this.toggleFilter();

      // this.dispatch({ type: CHI_STATE.QUERY_RESULTS, queryResults });
    } catch (error) {
      console.log(error);
      // if (this._filterContainer) this.toggleFilter();
    }
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);
